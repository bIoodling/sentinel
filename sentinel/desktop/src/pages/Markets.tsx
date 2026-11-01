import { useMemo, useState } from "react";
import { useSession } from "../context";
import {
  tokens,
  quote,
  price,
  compact,
  signed,
  portfolio,
  holdings,
  statistics,
  money,
  type Token,
} from "../domain";
import { Chart } from "../components/Chart";
import { Badge, PageHeading, Panel, Empty, TokenLabel } from "../components/UI";
import { Icon } from "../components/Icon";
export interface MarketProps {
  onToken: (token: Token) => void;
  onNavigate: (route: string) => void;
  onAlert: () => void;
}
export function TokenTable({
  list,
  onToken,
}: {
  list: Token[];
  onToken: (t: Token) => void;
}) {
  const { state, setState } = useSession();
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Token / pair</th>
            <th>Price</th>
            <th>24h</th>
            <th className="optional-column">Activity</th>
            <th>Liquidity</th>
            <th className="optional-column">Risk</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map((t) => (
            <tr key={t.id}>
              <td>
                <TokenLabel token={t} onClick={() => onToken(t)} />
              </td>
              <td className="number">{price(quote(t, state.step))}</td>
              <td className={t.change >= 0 ? "positive" : "negative"}>
                {signed(t.change)}
              </td>
              <td className="optional-column">
                <Chart token={t} mini />
              </td>
              <td>{compact(t.liquidity)}</td>
              <td className="optional-column">
                <Badge
                  tone={
                    t.risk === "Critical"
                      ? "red"
                      : t.risk === "High"
                        ? "amber"
                        : "neutral"
                  }
                >
                  {t.risk}
                </Badge>
              </td>
              <td>
                <button
                  className={`icon-button ${state.watchlist.includes(t.id) ? "saved" : ""}`}
                  aria-label={`${state.watchlist.includes(t.id) ? "Unsave" : "Save"} ${t.symbol}`}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      watchlist: s.watchlist.includes(t.id)
                        ? s.watchlist.filter((v) => v !== t.id)
                        : [...s.watchlist, t.id],
                    }))
                  }
                >
                  <Icon name="star" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && (
        <Empty title="No matching tokens">
          Try another category or filter.
        </Empty>
      )}
    </div>
  );
}
function Metrics({ values }: { values: [string, string, string, string?][] }) {
  return (
    <div className="metrics">
      {values.map(([label, value, note, tone]) => (
        <div className="metric" key={label}>
          <label>{label}</label>
          <strong className={tone ?? ""}>{value}</strong>
          <small>{note}</small>
        </div>
      ))}
    </div>
  );
}
export default function Dashboard({
  onToken,
  onNavigate,
  onAlert,
}: MarketProps) {
  const { state, setState, desktop, setDesktop } = useSession(),
    p = portfolio(state);
  return (
    <>
      <PageHeading
        title="The signal. Without the noise."
        description="Your research workspace · all values are simulated"
        actions={
          <>
            <button
              onClick={() =>
                setState((s) => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    simulation: !s.settings.simulation,
                  },
                }))
              }
            >
              <Icon name={state.settings.simulation ? "pause" : "play"} />
              {state.settings.simulation ? "Pause" : "Play"} simulation
            </button>
            <button className="primary" onClick={onAlert}>
              <Icon name="plus" />
              Test alert
            </button>
          </>
        }
      />
      <Metrics
        values={[
          [
            "Practice portfolio",
            money(p.value, state.settings.currency),
            `${money(state.cash, state.settings.currency)} available`,
          ],
          [
            "On your radar",
            `${state.watchlist.length} tokens`,
            "Saved research watchlist",
          ],
          [
            "Research alerts",
            String(state.alerts.filter((a) => a.status === "Pending").length),
            "Pending in your centre",
          ],
          ["Environment", "Simulation", "No live sources connected"],
        ]}
      />
      <div className="overview-grid flex-fill">
        <div className="market-column">
          <Panel
            className="market-chart flex-fill"
            title="ORBIT / Research view"
            meta={
              <div className="actions">
                <select
                  aria-label="Chart timeframe"
                  value={desktop.timeframe}
                  onChange={(e) =>
                    setDesktop((d) => ({
                      ...d,
                      timeframe: e.target.value as typeof d.timeframe,
                    }))
                  }
                >
                  {["1m", "5m", "15m", "1h"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <div className="segmented">
                  {["Candles", "Line"].map((mode) => (
                    <button
                      key={mode}
                      aria-pressed={state.settings.chartStyle === mode}
                      onClick={() =>
                        setState((s) => ({
                          ...s,
                          settings: { ...s.settings, chartStyle: mode },
                        }))
                      }
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            }
          >
            <div className="chart-value">
              <strong>{price(quote(tokens[0], state.step))}</strong>
              <span className="positive">+18.42%</span>
              <small>{state.settings.currency} · fixture price</small>
            </div>
            <Chart />
            <div className="panel-bottom">
              <span>
                <Icon name="shield" />
                Evidence before interpretation.
              </span>
              <button
                className="text-button"
                onClick={() => onToken(tokens[0])}
              >
                Inspect ORBIT
                <Icon name="arrow" />
              </button>
            </div>
          </Panel>
          <Panel
            className="radar-panel"
            title="On your radar"
            meta={
              <button
                className="text-button"
                onClick={() => onNavigate("Discovery")}
              >
                Discover all
                <Icon name="arrow" />
              </button>
            }
          >
            <TokenTable list={tokens.slice(0, 3)} onToken={onToken} />
          </Panel>
        </div>
        <aside className="intelligence-column">
          <Panel
            title="Priority research"
            meta={<Badge tone="blue">DEMO</Badge>}
            className="priority-panel"
          >
            <div className="internal-scroll">
              {state.alerts
                .filter((a) => a.status !== "Dismissed")
                .slice(0, 3)
                .map((a) => (
                  <button
                    key={a.id}
                    className="research-item"
                    onClick={() =>
                      onToken(tokens.find((t) => t.id === a.token)!)
                    }
                  >
                    <Badge tone={a.status === "Expired" ? "neutral" : "blue"}>
                      {a.status === "Expired"
                        ? "SIGNAL EXPIRED"
                        : tokens.find((t) => t.id === a.token)!.signal}
                    </Badge>
                    <TokenLabel token={tokens.find((t) => t.id === a.token)!} />
                    <p>{a.reason}</p>
                    <small>
                      {new Date(a.created).toLocaleTimeString("en-GB")} ·
                      simulation
                    </small>
                  </button>
                ))}
            </div>
            <button
              className="panel-link"
              onClick={() => onNavigate("Notifications")}
            >
              Open notification centre
              <Icon name="arrow" />
            </button>
          </Panel>
          <Panel title="Source health" className="health-panel">
            {["X / Twitter", "Reddit", "Telegram"].map((s) => (
              <div className="source-row" key={s}>
                <span>{s}</span>
                <small>
                  <i className="status-dot" />
                  Disconnected
                </small>
              </div>
            ))}
            <button
              className="panel-link"
              onClick={() => onNavigate("Connections")}
            >
              Manage connections
              <Icon name="connect" />
            </button>
          </Panel>
        </aside>
      </div>
    </>
  );
}
export function Discovery({ onToken }: MarketProps) {
  const { state } = useSession(),
    [tab, setTab] = useState("Trending"),
    [query, setQuery] = useState(""),
    [risk, setRisk] = useState("All risks");
  const list = useMemo(() => {
    let result = tokens.filter(
      (t) =>
        `${t.symbol} ${t.name}`.toLowerCase().includes(query.toLowerCase()) &&
        (risk === "All risks" || risk === t.risk) &&
        (tab !== "Watchlisted" || state.watchlist.includes(t.id)),
    );
    return [...result].sort((a, b) =>
      tab === "Highest volume"
        ? b.volume - a.volume
        : tab === "Volatility"
          ? Math.abs(b.change) - Math.abs(a.change)
          : tab === "Recent"
            ? tokens.indexOf(b) - tokens.indexOf(a)
            : b.social - a.social,
    );
  }, [tab, query, risk, state.watchlist]);
  return (
    <>
      <PageHeading
        title="Discover the next question."
        description="Fictional Solana tokens for testing your research workflow"
      />
      <div className="tabbar">
        {[
          "Trending",
          "Recent",
          "Highest volume",
          "Volatility",
          "Watchlisted",
        ].map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="token-previews">
        {list.slice(0, 3).map((t) => (
          <button
            className="token-preview"
            key={t.id}
            onClick={() => onToken(t)}
          >
            <TokenLabel token={t} />
            <div className="spread">
              <strong className="number">{price(quote(t, state.step))}</strong>
              <span className={t.change >= 0 ? "positive" : "negative"}>
                {signed(t.change)}
              </span>
            </div>
            <Chart token={t} mini />
            <small>
              {compact(t.volume)} volume · {t.age} fixture age
            </small>
          </button>
        ))}
      </div>
      <Panel
        className="flex-fill"
        title={`${tab} tokens`}
        meta={<Badge>SIMULATED DATA</Badge>}
      >
        <div className="filter-row">
          <label className="search-field">
            <Icon name="search" />
            <input
              placeholder="Search tokens…"
              aria-label="Search tokens"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter risk"
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
          >
            {["All risks", "Elevated", "High", "Critical"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <span className="muted">{list.length} tokens</span>
        </div>
        <TokenTable list={list} onToken={onToken} />
      </Panel>
    </>
  );
}
export function Portfolio({ onToken, onNavigate }: MarketProps) {
  const { state, setState, notify } = useSession(),
    p = portfolio(state),
    [tab, setTab] = useState("Positions"),
    [period, setPeriod] = useState("All time");
  const positions = Object.entries(holdings(state)).filter(
      ([, v]) => v.quantity > 1e-8,
    ),
    since =
      period === "All time" ? 0 : Date.now() - parseInt(period) * 86400000,
    stats = statistics(state, since);
  const ranked = positions
    .map(([id, v]) => ({
      token: tokens.find((t) => t.id === id)!,
      gain:
        v.quantity * quote(tokens.find((t) => t.id === id)!, state.step) -
        v.cost,
      value: v.quantity * quote(tokens.find((t) => t.id === id)!, state.step),
    }))
    .sort((a, b) => b.gain - a.gain);
  return (
    <>
      <PageHeading
        title="Practice with perspective."
        description="Fictional capital. Reproducible, fee-inclusive trade accounting."
        actions={
          <>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              aria-label="Statistics period"
            >
              {["7 days", "30 days", "90 days", "All time"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={() => {
                if (state.settings.initialBalance >= 1000000) {
                  notify("Practice capital limit reached.");
                  return;
                }
                setState((s) => ({
                  ...s,
                  cash: s.cash + 10,
                  settings: {
                    ...s.settings,
                    initialBalance: s.settings.initialBalance + 10,
                  },
                }));
                notify("Added 10 fictional practice funds.");
              }}
            >
              Add {money(10, state.settings.currency)} practice funds
            </button>
          </>
        }
      />
      <Metrics
        values={[
          [
            "Total portfolio",
            money(p.value, state.settings.currency),
            `${signed((p.value / state.settings.initialBalance - 1) * 100)} overall`,
          ],
          [
            "Available",
            money(state.cash, state.settings.currency),
            "Unallocated practice funds",
          ],
          [
            "Realised P&L",
            money(p.realised, state.settings.currency),
            "Lifetime · after costs",
            p.realised >= 0 ? "positive" : "negative",
          ],
          [
            "Unrealised P&L",
            money(p.unrealised, state.settings.currency),
            "Current simulated quotes",
            p.unrealised >= 0 ? "positive" : "negative",
          ],
        ]}
      />
      <div className="portfolio-overview">
        <Panel
          title="Illustrative performance"
          meta={<Badge>SYNTHETIC INDEX · NOT EQUITY HISTORY</Badge>}
        >
          <Chart token={tokens[1]} line />
        </Panel>
        <Panel title="Asset allocation">
          <div className="allocation-list internal-scroll">
            <div className="allocation-row">
              <span>Available cash</span>
              <strong>{money(state.cash, state.settings.currency)}</strong>
            </div>
            <div className="allocation-bar">
              <span
                style={{
                  width: `${(state.cash / p.value) * 100}%`,
                  background: "var(--accent)",
                }}
              />
              {ranked.map((r) => (
                <span
                  key={r.token.id}
                  style={{
                    width: `${(r.value / p.value) * 100}%`,
                    background: r.token.color,
                  }}
                />
              ))}
            </div>
            {ranked.map((r) => (
              <div className="allocation-row" key={r.token.id}>
                <TokenLabel token={r.token} onClick={() => onToken(r.token)} />
                <strong>{((r.value / p.value) * 100).toFixed(1)}%</strong>
              </div>
            ))}
            <div className="allocation-row">
              <span>Best position</span>
              <strong>{ranked[0]?.token.symbol ?? "No positions"}</strong>
            </div>
            <div className="allocation-row">
              <span>Worst position</span>
              <strong>{ranked.at(-1)?.token.symbol ?? "No positions"}</strong>
            </div>
          </div>
        </Panel>
      </div>
      <Panel className="flex-fill">
        <div className="tabbar">
          {["Positions", "Recent trades", "Statistics"].map((t) => (
            <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
          <button
            className="push-right text-button"
            onClick={() => {
              const rows = [
                "time,side,fixture,quantity,price,fees,total,currency",
                ...state.trades.map((t) =>
                  [
                    new Date(t.time).toISOString(),
                    t.side,
                    t.token,
                    t.quantity,
                    t.price,
                    t.fees,
                    t.total,
                    state.settings.currency,
                  ].join(","),
                ),
              ];
              const a = document.createElement("a"),
                url = URL.createObjectURL(
                  new Blob([rows.join("\n")], { type: "text/csv" }),
                );
              a.href = url;
              a.download = "sentinel-practice.csv";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            Export CSV
            <Icon name="download" />
          </button>
        </div>
        {tab === "Positions" ? (
          positions.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Quantity</th>
                    <th>Cost incl. fees</th>
                    <th>Value</th>
                    <th>Unrealised</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map(([id, v]) => {
                    const t = tokens.find((t) => t.id === id)!,
                      value = v.quantity * quote(t, state.step);
                    return (
                      <tr key={id}>
                        <td>
                          <TokenLabel token={t} onClick={() => onToken(t)} />
                        </td>
                        <td>{v.quantity.toFixed(4)}</td>
                        <td>{money(v.cost, state.settings.currency)}</td>
                        <td>{money(value, state.settings.currency)}</td>
                        <td
                          className={value >= v.cost ? "positive" : "negative"}
                        >
                          {money(value - v.cost, state.settings.currency)}
                        </td>
                        <td>
                          <button onClick={() => onToken(t)}>Manage</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="A clean slate">
              Your practice positions will appear here.
              <button onClick={() => onNavigate("Discovery")}>
                Explore tokens
              </button>
            </Empty>
          )
        ) : tab === "Recent trades" ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Token</th>
                  <th>Quantity</th>
                  <th>Costs</th>
                  <th>Cash flow</th>
                </tr>
              </thead>
              <tbody>
                {state.trades
                  .filter((t) => t.time >= since)
                  .slice(-100)
                  .reverse()
                  .map((t) => (
                    <tr key={t.id}>
                      <td>{new Date(t.time).toLocaleTimeString("en-GB")}</td>
                      <td>{t.side}</td>
                      <td>{t.token}</td>
                      <td>{t.quantity.toFixed(4)}</td>
                      <td>{money(t.fees, state.settings.currency)}</td>
                      <td>
                        {t.side === "buy" ? "−" : "+"}
                        {money(t.total, state.settings.currency)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!state.trades.length && (
              <Empty title="No practice transactions">
                Review a token to place a simulated trade.
              </Empty>
            )}
          </div>
        ) : (
          <div className="statistics-grid internal-scroll">
            {[
              [
                "Win rate",
                stats.winRate === null
                  ? "No sell fills"
                  : stats.winRate.toFixed(1) + "%",
              ],
              ["Average gain", money(stats.averageGain)],
              ["Average loss", money(stats.averageLoss)],
              ["Largest gain", money(stats.largestGain)],
              ["Largest loss", money(stats.largestLoss)],
              ["Total losses", money(stats.totalLoss)],
              ["Trading costs", money(p.fees)],
              ["Sell fills", String(stats.count)],
            ].map(([label, value]) => (
              <div key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
