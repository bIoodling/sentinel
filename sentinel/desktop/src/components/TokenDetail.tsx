import { useState } from "react";
import { useSession } from "../context";
import {
  executeTrade,
  holdings,
  quote,
  price,
  money,
  compact,
  type Token,
  type Fill,
} from "../domain";
import { Chart } from "./Chart";
import { Badge, Dialog } from "./UI";
import { TokenIcon, Icon } from "./Icon";
export function TokenDetail({
  token,
  onClose,
  onAnalyse,
}: {
  token: Token;
  onClose: () => void;
  onAnalyse: () => void;
}) {
  const { state, setState, notify } = useSession(),
    [side, setSide] = useState<"buy" | "sell">("buy"),
    [amount, setAmount] = useState("2"),
    [review, setReview] = useState<Fill | null>(null),
    [error, setError] = useState("");
  const p = holdings(state)[token.id] ?? { quantity: 0, cost: 0 };
  const saved = state.watchlist.includes(token.id);
  function watch() {
    setState((s) => ({
      ...s,
      watchlist: s.watchlist.includes(token.id)
        ? s.watchlist.filter((id) => id !== token.id)
        : [...s.watchlist, token.id],
    }));
  }
  function estimate() {
    try {
      setReview(
        executeTrade(state, token.id, side, Number(amount)).trades.at(-1)!,
      );
      setError("");
    } catch (e) {
      setError(String((e as Error).message));
    }
  }
  function confirm() {
    try {
      const next = executeTrade(state, token.id, side, Number(amount));
      setState(next);
      notify("Practice transaction recorded. No real order was sent.");
      onClose();
    } catch (e) {
      setError(String((e as Error).message));
      setReview(null);
    }
  }
  return (
    <Dialog title={`${token.symbol} / Research & practice`} onClose={onClose}>
      <div className="detail-header">
        <TokenIcon id={token.id} size={44} />
        <div>
          <h3>{token.name}</h3>
          <strong className="large-number">
            {price(quote(token, state.step))}
          </strong>
        </div>
        <Badge tone="blue">SIMULATED</Badge>
        <button className="push-right" onClick={watch}>
          <Icon name="star" />
          {saved ? "Saved" : "Watch token"}
        </button>
      </div>
      <div className="detail-chart">
        <Chart token={token} />
      </div>
      <div className="fact-grid">
        {[
          ["Liquidity", compact(token.liquidity)],
          ["24h volume", compact(token.volume)],
          ["Market cap", compact(token.cap)],
          ["Risk", token.risk],
        ].map(([k, v]) => (
          <div key={k}>
            <small>{k}</small>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      <div className="callout">
        <Icon name="shield" />
        <span>
          <strong>{token.signal}</strong>
          <br />
          Invented fixture. Ownership, contract permissions and deployer
          activity are unverified.
        </span>
      </div>
      <div className="actions">
        <button onClick={onAnalyse}>
          <Icon name="assistant" />
          Analyse in demo chat
        </button>
        <button
          onClick={() => {
            navigator.clipboard
              .writeText(`SIM-${token.symbol}`)
              .then(() =>
                notify("Fictional fixture ID copied; not a real contract."),
              )
              .catch(() => setError(`Copy manually: SIM-${token.symbol}`));
          }}
        >
          <Icon name="copy" />
          Copy fixture ID
        </button>
        <Badge>No verified Axiom token link</Badge>
      </div>
      <section className="practice-box">
        <div className="panel-heading">
          <h3>Practice transaction</h3>
          <div className="segmented">
            {(["buy", "sell"] as const).map((v) => (
              <button
                key={v}
                aria-pressed={side === v}
                onClick={() => {
                  setSide(v);
                  setAmount(v === "buy" ? "2" : String(p.quantity / 2));
                  setReview(null);
                }}
              >
                {v === "buy" ? "Buy" : "Sell"}
              </button>
            ))}
          </div>
        </div>
        <p className="muted">
          Available {money(state.cash, state.settings.currency)} · Holding{" "}
          {p.quantity.toFixed(4)} {token.symbol}
        </p>
        {review ? (
          <div className="stack">
            <p>
              {side === "buy" ? "Buy" : "Sell"}{" "}
              <strong>
                {review.quantity.toFixed(4)} {token.symbol}
              </strong>{" "}
              at {price(review.price)}. Costs{" "}
              {money(review.fees, state.settings.currency)}.{" "}
              {side === "buy" ? "Debit" : "Credit"}{" "}
              {money(review.total, state.settings.currency)}.
            </p>
            <div className="actions">
              <button className="primary" onClick={confirm}>
                Confirm practice transaction
              </button>
              <button onClick={() => setReview(null)}>Back</button>
            </div>
          </div>
        ) : (
          <form
            className="trade-row"
            onSubmit={(e) => {
              e.preventDefault();
              estimate();
            }}
          >
            <label>
              {side === "buy"
                ? `Spend (${state.settings.currency}), before fees`
                : `Quantity to sell (${token.symbol})`}
              <input
                aria-label="Practice trade amount"
                type="number"
                min="0.000001"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            <button className="primary">Review {side}</button>
          </form>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <small>
          Slippage {state.settings.slippage}% · Fees {state.settings.fee}% +{" "}
          {money(state.settings.networkFee, state.settings.currency)}. Potential
          loss: entire practice position.
        </small>
      </section>
    </Dialog>
  );
}
