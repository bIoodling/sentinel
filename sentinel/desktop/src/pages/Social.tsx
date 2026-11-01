import { useMemo, useState } from "react";
import {
  posts,
  sources,
  tokenBy,
  keywordsByCategory,
  recommendedKeywords,
  type Account,
  type Token,
} from "../domain";
import { useSession } from "../context";
import {
  Badge,
  Dialog,
  Empty,
  PageHeading,
  Panel,
  Switch,
  TokenLabel,
} from "../components/UI";
import { Icon } from "../components/Icon";
export default function Social({ onToken }: { onToken: (t: Token) => void }) {
  const { state, setState, notify } = useSession(),
    [tab, setTab] = useState("Feed"),
    [source, setSource] = useState("All sources"),
    [query, setQuery] = useState(""),
    [accountFilter, setAccountFilter] = useState("All accounts"),
    [keywordCategory, setKeywordCategory] = useState("All categories"),
    [editing, setEditing] = useState<number | null>(null),
    [keyword, setKeyword] = useState(""),
    [addingAccount, setAddingAccount] = useState(false);
  const filtered = posts.filter(
    (p) =>
      (source === "All sources" || source === p.source) &&
      (accountFilter === "All accounts" || accountFilter === p.account) &&
      `${p.text} ${p.account}`.toLowerCase().includes(query.toLowerCase()),
  );
  const words = useMemo(
    () =>
      state.settings.keywords
        .map((word, index) => ({ word, index }))
        .filter(
          (k) =>
            k.word.toLowerCase().includes(query.toLowerCase()) &&
            (keywordCategory === "All categories" ||
              keywordsByCategory[keywordCategory]?.some(
                (w) => w.toLowerCase() === k.word.toLowerCase(),
              )),
        ),
    [state.settings.keywords, query, keywordCategory],
  );
  const changeAccount = (i: number, patch: Partial<Account>) =>
    setState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        accounts: s.settings.accounts.map((a, n) =>
          n === i ? { ...a, ...patch } : a,
        ),
      },
    }));
  function addKeyword() {
    const text = keyword.trim();
    if (!text) return;
    setState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        keywords:
          editing === null
            ? [...new Set([...s.settings.keywords, text])].slice(0, 200)
            : s.settings.keywords.map((w, i) => (i === editing ? text : w)),
      },
    }));
    setKeyword("");
    setEditing(null);
  }
  return (
    <>
      <PageHeading
        title="Context moves markets."
        description="A monitoring workspace built around evidence, timing and source quality."
        actions={
          <Badge tone="blue">FICTIONAL FEED · SOURCES DISCONNECTED</Badge>
        }
      />
      <div className="tabbar">
        {["Feed", "Keywords", "Accounts"].map((t) => (
          <button
            key={t}
            aria-pressed={tab === t}
            onClick={() => {
              setTab(t);
              setQuery("");
            }}
          >
            {t}
            {t === "Keywords"
              ? ` · ${state.settings.keywords.length}`
              : t === "Accounts"
                ? ` · ${state.settings.accounts.length}`
                : ""}
          </button>
        ))}
      </div>
      <div className="filter-row standalone">
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="Search social intelligence"
            placeholder={
              tab === "Keywords"
                ? "Search monitoring keywords…"
                : "Search intelligence…"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {tab === "Feed" ? (
          <>
            <select
              aria-label="Filter source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {["All sources", ...sources].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              aria-label="Filter account"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
            >
              {["All accounts", ...posts.map((p) => p.account)].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </>
        ) : tab === "Keywords" ? (
          <select
            aria-label="Keyword category"
            value={keywordCategory}
            onChange={(e) => setKeywordCategory(e.target.value)}
          >
            {["All categories", ...Object.keys(keywordsByCategory)].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        ) : (
          <button onClick={() => setAddingAccount(true)}>
            <Icon name="plus" />
            Add account
          </button>
        )}
      </div>
      {tab === "Feed" ? (
        <div className="social-grid flex-fill">
          <Panel
            title="Intelligence stream"
            meta={<Badge>4 FICTIONAL SCENARIOS</Badge>}
          >
            <div className="feed internal-scroll">
              {filtered.map((p) => (
                <article className="feed-card" key={p.id}>
                  <header>
                    <span className="source-icon">
                      {p.source === "X / Twitter" ? "𝕏" : p.source.slice(0, 2)}
                    </span>
                    <div className="grow">
                      <h3>{p.account}</h3>
                      <small>{p.source} · fictional account</small>
                    </div>
                    <time>{p.time} · fixture</time>
                  </header>
                  <p>{p.text}</p>
                  <div className="feed-evidence">
                    <TokenLabel
                      token={tokenBy(p.token)}
                      onClick={() => onToken(tokenBy(p.token))}
                    />
                    <Badge tone={p.priority === "High" ? "blue" : "neutral"}>
                      {p.priority} priority
                    </Badge>
                  </div>
                  <footer>
                    <span>Source reliability: unmeasured</span>
                    <button
                      className="text-button"
                      onClick={() => onToken(tokenBy(p.token))}
                    >
                      Related market event
                      <Icon name="arrow" />
                    </button>
                  </footer>
                </article>
              ))}
              {!filtered.length && (
                <Empty title="No matching posts">
                  Adjust the account, source or text filter.
                </Empty>
              )}
            </div>
          </Panel>
          <Panel title="Monitoring brief" className="monitoring-brief">
            <div className="padding stack">
              <div className="brief-number">
                {state.settings.keywords.length}
                <span>editable keywords</span>
              </div>
              <div className="brief-number">
                {state.settings.accounts.length}
                <span>watched accounts</span>
              </div>
              <div className="callout">
                <Icon name="shield" />
                <p>
                  All posts are invented examples. Source reliability, detected
                  mentions and related events illustrate the workflow; they are
                  not measured intelligence.
                </p>
              </div>
              <button onClick={() => setTab("Keywords")}>
                Manage keyword groups
                <Icon name="arrow" />
              </button>
              <button onClick={() => setTab("Accounts")}>
                Manage account filters
                <Icon name="arrow" />
              </button>
            </div>
          </Panel>
        </div>
      ) : tab === "Keywords" ? (
        <Panel
          className="flex-fill"
          title="Monitoring vocabulary"
          meta={
            <button
              onClick={() => {
                setState((s) => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    keywords: [
                      ...new Set([
                        ...s.settings.keywords,
                        ...recommendedKeywords,
                      ]),
                    ].slice(0, 200),
                  },
                }));
                notify(
                  "Recommended vocabulary added; your custom words were retained.",
                );
              }}
            >
              Add recommended set
            </button>
          }
        >
          <div className="keyword-groups internal-scroll">
            {words.map(({ word, index }) => (
              <div className="keyword-item" key={index}>
                <span>{word}</span>
                <button
                  className="icon-button"
                  aria-label={`Edit ${word}`}
                  onClick={() => {
                    setEditing(index);
                    setKeyword(word);
                  }}
                >
                  <Icon name="settings" />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Remove ${word}`}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      settings: {
                        ...s.settings,
                        keywords: s.settings.keywords.filter(
                          (_, i) => i !== index,
                        ),
                      },
                    }))
                  }
                >
                  <Icon name="close" />
                </button>
              </div>
            ))}
          </div>
          <form
            className="keyword-composer"
            onSubmit={(e) => {
              e.preventDefault();
              addKeyword();
            }}
          >
            <input
              aria-label="Monitoring keyword"
              placeholder={
                editing === null
                  ? "Add a keyword or #hashtag…"
                  : "Edit keyword…"
              }
              maxLength={80}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
            />
            <button className="primary">
              {editing === null ? "Add keyword" : "Save edit"}
            </button>
            {editing !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setKeyword("");
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </Panel>
      ) : (
        <Panel
          className="flex-fill"
          title="Monitored accounts"
          meta={<Badge>NOT CONNECTED</Badge>}
        >
          <div className="internal-scroll accounts-grid">
            {state.settings.accounts
              .filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
              .map((a) => {
                const i = state.settings.accounts.indexOf(a);
                return (
                  <article className="account-tile" key={i}>
                    <div className="spread">
                      <span className="source-icon">
                        {a.source.slice(0, 2)}
                      </span>
                      <button
                        className="icon-button"
                        aria-label={`Remove ${a.name}`}
                        onClick={() =>
                          setState((s) => ({
                            ...s,
                            settings: {
                              ...s.settings,
                              accounts: s.settings.accounts.filter(
                                (_, n) => n !== i,
                              ),
                            },
                          }))
                        }
                      >
                        <Icon name="close" />
                      </button>
                    </div>
                    <h3>{a.name}</h3>
                    <small>{a.source} · disconnected</small>
                    <label>
                      Priority
                      <select
                        value={a.priority}
                        onChange={(e) =>
                          changeAccount(i, { priority: e.target.value })
                        }
                      >
                        {["High", "Normal", "Low"].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Account keywords
                      <input
                        value={a.keywords}
                        maxLength={200}
                        onChange={(e) =>
                          changeAccount(i, { keywords: e.target.value })
                        }
                      />
                    </label>
                    <div className="spread">
                      <span>Instant alerts</span>
                      <Switch
                        label={`Instant alerts for ${a.name}`}
                        checked={a.alerts}
                        onChange={(v) => changeAccount(i, { alerts: v })}
                      />
                    </div>
                  </article>
                );
              })}
          </div>
        </Panel>
      )}
      {addingAccount && (
        <Dialog
          title="Watch a public account"
          onClose={() => setAddingAccount(false)}
        >
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              if (state.settings.accounts.length >= 100) {
                notify("Account limit reached.");
                return;
              }
              setState((s) => ({
                ...s,
                settings: {
                  ...s.settings,
                  accounts: [
                    ...s.settings.accounts,
                    {
                      name: String(data.get("name")),
                      source: String(data.get("source")),
                      priority: "Normal",
                      alerts: true,
                      keywords: "",
                    },
                  ],
                },
              }));
              setAddingAccount(false);
            }}
          >
            <label>
              Account name
              <input name="name" maxLength={80} required />
            </label>
            <label>
              Platform
              <select name="source">
                {sources.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <p className="muted">
              Saves a watchlist preference; no authorisation or collection
              occurs.
            </p>
            <button className="primary">Save watched account</button>
          </form>
        </Dialog>
      )}
    </>
  );
}
export function Connections() {
  const [selected, setSelected] = useState("");
  const details: Record<string, string> = {
    "X / Twitter":
      "Official developer access and a usage budget may be required. OAuth needs an authorised registered application. No browser cookies or passwords.",
    Reddit:
      "Approved API access and applicable OAuth scopes are required. This prototype does not assume unrestricted API access.",
    YouTube:
      "A Google API project/key and quota are required for public-data requests. User-specific data requires OAuth consent.",
    Telegram:
      "A bot must be invited to permitted chats or channels. Membership, privacy mode and channel permissions constrain visibility.",
    Discord:
      "Use an authorised bot with server permissions and applicable message-content intent. No user tokens or self-bots.",
    "RSS / News":
      "Use publisher-permitted feeds with their refresh and redistribution terms.",
    Ollama:
      "Requires a separately installed local model host. No model installation or inference starts from this screen.",
    Axiom:
      "No official read-only developer API or supported token URL format has been established. Public-wallet RPC and manual transaction import are the planned alternatives.",
  };
  return (
    <>
      <PageHeading
        title="Connect your research."
        description="Simple status. Clear requirements. No passwords or browser session tokens."
      />
      <Panel
        className="flex-fill"
        title="Data sources & providers"
        meta={<Badge>SETUP PREVIEW · NO AUTHENTICATION</Badge>}
      >
        <div className="connections-grid internal-scroll">
          {[...sources, "Ollama", "Axiom"].map((s) => (
            <article className="connection-tile" key={s}>
              <span className="source-icon">
                {s === "X / Twitter" ? "𝕏" : s.slice(0, 2)}
              </span>
              <h3>{s}</h3>
              <p>
                <i className="status-dot" />
                Not connected
              </p>
              <small>
                {s === "Axiom"
                  ? "Official API unverified"
                  : "Authorised provider setup required"}
              </small>
              <button onClick={() => setSelected(s)}>
                <Icon name="connect" />
                View connection setup
              </button>
            </article>
          ))}
        </div>
      </Panel>
      {selected && (
        <Dialog
          title={`${selected} / Connection setup`}
          onClose={() => setSelected("")}
        >
          <div className="stack">
            <Badge tone="blue">PROTOTYPE · NOT A LOGIN FLOW</Badge>
            <p>{details[selected]}</p>
            <p className="muted">
              OAuth and secure credential storage will be implemented only after
              UI approval and provider eligibility checks. No credentials are
              collected here.
            </p>
            <button onClick={() => setSelected("")}>Understood</button>
          </div>
        </Dialog>
      )}
    </>
  );
}
