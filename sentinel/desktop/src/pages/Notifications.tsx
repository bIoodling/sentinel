import { useState } from "react";
import { useSession } from "../context";
import {
  tokenBy,
  quote,
  price,
  signed,
  reviewAlert,
  type Token,
  type Alert,
} from "../domain";
import { Chart } from "../components/Chart";
import { Badge, Empty, PageHeading, Panel, TokenLabel } from "../components/UI";
import { Icon } from "../components/Icon";
export function category(a: Alert) {
  if (a.status === "Expired") return ["Expired signal", "neutral", "clock"];
  const t = tokenBy(a.token);
  if (t.risk === "Critical" || t.risk === "High")
    return ["High-risk warning", "amber", "shield"];
  if (a.category === "Social")
    return ["Important social event", "blue", "social"];
  return t.change >= 0
    ? ["Positive movement", "green", "up"]
    : ["Negative movement", "red", "down"];
}
export default function Notifications({
  onToken,
  onAlert,
}: {
  onToken: (t: Token) => void;
  onAlert: () => void;
}) {
  const { state, setState } = useSession(),
    [filter, setFilter] = useState("All alerts");
  const pending = state.alerts.filter((a) => a.status === "Pending").length,
    list = state.alerts.filter(
      (a) =>
        a.status !== "Dismissed" &&
        (filter === "All alerts" ||
          (filter === "Pending" && a.status === "Pending") ||
          category(a)[0] === filter),
    );
  function update(id: string, status: Alert["status"]) {
    setState((s) => ({
      ...s,
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
  }
  return (
    <>
      <PageHeading
        title="Know what changed."
        description="Persistent research alerts, with movement, context and uncertainty."
        actions={
          <>
            <button
              onClick={() =>
                setState((s) => ({
                  ...s,
                  alerts: s.alerts.map((a) =>
                    a.status === "Pending"
                      ? { ...a, status: "Acknowledged" }
                      : a,
                  ),
                }))
              }
            >
              Acknowledge all
            </button>
            <button className="primary" onClick={onAlert}>
              <Icon name="plus" />
              Test alert
            </button>
          </>
        }
      />
      <div className="alert-summary">
        <span>
          <strong>{pending}</strong> pending alerts
        </span>
        <Badge>SIMULATED EVENTS</Badge>
        <small>
          No Windows alerts or floating windows unless explicitly enabled.
        </small>
      </div>
      <div className="tabbar alert-tabs">
        {[
          "All alerts",
          "Pending",
          "Positive movement",
          "Negative movement",
          "High-risk warning",
          "Important social event",
          "Expired signal",
        ].map((f) => (
          <button
            key={f}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <Panel className="flex-fill">
        <div className="notifications-grid internal-scroll">
          {list
            .slice()
            .reverse()
            .map((a) => {
              const t = tokenBy(a.token),
                [label, tone, icon] = category(a),
                r = reviewAlert(a, quote(t, state.step));
              return (
                <article key={a.id} className={`notification-tile ${tone}`}>
                  <header>
                    <span className="category-mark">
                      <Icon name={icon} />
                    </span>
                    <div className="grow">
                      <strong>{label}</strong>
                      <small>
                        {new Date(a.created).toLocaleString("en-GB")}
                      </small>
                    </div>
                    <button
                      className="icon-button"
                      onClick={() => update(a.id, "Dismissed")}
                      aria-label={`Dismiss ${t.symbol} alert`}
                    >
                      <Icon name="close" />
                    </button>
                  </header>
                  <div className="spread">
                    <TokenLabel token={t} onClick={() => onToken(t)} />
                    <div className="alert-price">
                      <strong>{price(quote(t, state.step))}</strong>
                      <span className={r.move >= 0 ? "positive" : "negative"}>
                        {signed(r.move)} since alert
                      </span>
                    </div>
                  </div>
                  <div className="notification-chart">
                    <Chart token={t} mini />
                  </div>
                  <p>{a.reason}</p>
                  <div className="spread">
                    <Badge tone={t.risk === "Critical" ? "red" : "amber"}>
                      {t.risk} risk · fixture
                    </Badge>
                    <small>Source: demo feed</small>
                  </div>
                  {r.expired && (
                    <div className="expired-note">
                      Signal expired. Original conditions no longer apply.
                    </div>
                  )}
                  <footer>
                    <button onClick={() => onToken(t)}>
                      View details
                      <Icon name="arrow" />
                    </button>
                    {a.status === "Pending" ? (
                      <button
                        className="text-button"
                        onClick={() => update(a.id, "Acknowledged")}
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <small>{a.status}</small>
                    )}
                  </footer>
                </article>
              );
            })}
          {!list.length && (
            <Empty title="Nothing pending">
              Change the filter or create a test alert.
            </Empty>
          )}
        </div>
      </Panel>
    </>
  );
}
