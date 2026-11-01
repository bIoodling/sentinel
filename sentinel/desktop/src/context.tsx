import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import {
  desktopDefaults,
  initialState,
  upgrade,
  validate,
  type State,
  type DesktopPreferences,
} from "./domain";
import { native, call, broadcast } from "./native";
export interface Session {
  state: State;
  setState: Dispatch<SetStateAction<State>>;
  desktop: DesktopPreferences;
  setDesktop: Dispatch<SetStateAction<DesktopPreferences>>;
  ready: boolean;
  error: string;
  notify: (text: string) => void;
  recover: () => void;
  flush: () => Promise<void>;
}
const Context = createContext<Session | null>(null);
const key = "sentinel.desktop.v2";
export function parseSession(raw: string) {
  const v = JSON.parse(raw);
  const state = upgrade(validate(v.state ?? v));
  const d = { ...desktopDefaults, ...v.desktop } as DesktopPreferences;
  if (!["Acrylic", "Mica", "Opaque"].includes(d.backdrop))
    d.backdrop = "Opaque";
  if (!/^#[0-9a-f]{6}$/i.test(d.tint)) d.tint = desktopDefaults.tint;
  d.chartDensity = Math.min(16, Math.max(4, Number(d.chartDensity) || 8));
  if (!["1m", "5m", "15m", "1h"].includes(d.timeframe)) d.timeframe = "1m";
  for (const k of [
    "startup",
    "closeToTray",
    "nativeNotifications",
    "floatingAlerts",
  ] as const)
    d[k] = d[k] === true;
  if (typeof d.monitor !== "string") d.monitor = "Current monitor";
  return { state, desktop: d };
}
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => upgrade(initialState()));
  const [desktop, setDesktop] = useState<DesktopPreferences>(desktopDefaults);
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState("");
  const writes = useRef(Promise.resolve());
  async function flush() {
    const payload = JSON.stringify({ state, desktop });
    writes.current = writes.current
      .catch(() => {})
      .then(async () => {
        if (native) {
          await call("save_state", { payload });
          await broadcast();
        } else localStorage.setItem(key, payload);
      });
    await writes.current;
    setError("");
  }
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = native
          ? await call<string | null>("load_state")
          : (localStorage.getItem(key) ??
            localStorage.getItem("sentinel.prototype.v1"));
        if (raw && alive) {
          const loaded = parseSession(raw);
          setState(loaded.state);
          setDesktop(loaded.desktop);
        }
      } catch (e) {
        if (alive)
          setError(
            `Saved data could not be loaded: ${String(e)}. Import a backup or explicitly reset; automatic saves are paused.`,
          );
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!ready || error.startsWith("Saved data")) return;
    const timer = setTimeout(() => {
      const payload = JSON.stringify({ state, desktop });
      writes.current = writes.current
        .catch(() => {})
        .then(async () => {
          try {
            if (native) {
              await call("save_state", { payload });
              await broadcast();
            } else localStorage.setItem(key, payload);
            setError("");
          } catch (e) {
            setError(
              `Could not save: ${String(e)}. Export a backup before closing.`,
            );
          }
        });
    }, 200);
    return () => clearTimeout(timer);
  }, [state, desktop, ready, error.startsWith("Saved data")]);
  useEffect(() => {
    if (!state.settings.simulation || !ready) return;
    const timer = setInterval(() => {
      if (!document.hidden) setState((s) => ({ ...s, step: s.step + 1 }));
    }, 5000);
    return () => clearInterval(timer);
  }, [state.settings.simulation, ready]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5500);
    return () => clearTimeout(timer);
  }, [toast]);
  return (
    <Context
      value={{
        state,
        setState,
        desktop,
        setDesktop,
        ready,
        error,
        notify: setToast,
        recover: () => setError(""),
        flush,
      }}
    >
      {children}
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button onClick={() => setToast("")} aria-label="Close status">
            ×
          </button>
        </div>
      )}
    </Context>
  );
}
export function useSession() {
  const value = useContext(Context);
  if (!value) throw Error("Session provider missing");
  return value;
}
