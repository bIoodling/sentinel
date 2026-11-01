# Architecture and implementation plan

## Environment inspected on 1 November 2026

Windows environment; AMD Ryzen 9 7900X3D (12 cores / 24 logical processors), approximately 31.6 GiB usable physical RAM, NVIDIA GeForce RTX 4060. Windows also lists a virtual display adapter. WMI's adapter-memory field is not a reliable GPU VRAM measurement, so no VRAM capacity is asserted. Git, Node v24.22.1, rustc 1.98.1 and cargo 1.98.1 are available. npm, gh and ollama were not found on PATH. Windows SDK/MSVC/WebView2 build readiness was not established. No software was installed.

The cloud-environment tool returned no configured Codex Cloud environment. Local operations were limited to source editing, a tiny clone, Node checks and file packaging. No AI, GUI control, installer, service, full native build or GPU benchmark was run.

## Architecture established before application code

Recommended production host: Tauri 2, Rust asynchronous workers, SQLite migrations, Windows Credential Manager, and a strict allowlisted IPC boundary. Prefer a single Rust data plane over an always-on Python sidecar to avoid another runtime and process lifecycle. Use WebSocket subscriptions when a provider supports them, bounded backoff/queues and batched writes. A dedicated alert window and tray lifecycle belong in the native layer, not a web polling loop.

The initial proposal used React/TypeScript. For the unpublished offline review, the implementation deliberately uses native JavaScript ES modules with no third-party runtime dependencies. Tauri can host these same assets. This reduces setup and local workload and avoids installing packages during gaming. CSS tokens replace Tailwind for this compact prototype; deterministic domain functions are separate from template rendering. This is an explicit stack deviation, not a claim to have delivered React/TypeScript or Tauri already.

UI modules:

| File | Responsibility |
| --- | --- |
| `src/model.js` | Fixtures, quote generator, candles, holdings, trade guards, statistics, alert review, scripted interpretation |
| `src/store.js` | Versioned persistence, backup schema repair/rejection, ledger reconciliation |
| `src/app.js` | Routes, templates, delegated interactions, dialogs, settings, notification preview, chat streaming effect |
| `src/styles.css` | Theme tokens, density, responsive layout, accessibility states, restrained motion |
| `scripts/build.mjs` | Reproducible self-contained offline HTML packaging |

Future services should implement explicit data types containing source URL/identity, source timestamp, received timestamp, provider latency, currency, units, freshness and missing-data flags. UI fixture implementations will be replaced by service adapters after approval. No provider secrets should cross into the rendered page.

## Local AI feasibility

The fastest defensible path is deterministic screening first, then a locally hosted 1B–3B quantised instruction model with a bounded prompt and validated structured output. Ollama is a convenient future host; llama.cpp is an alternative for tighter runtime control. This is a candidate setup, not a measured winner. The official Ollama API accepts JSON-schema output constraints: https://docs.ollama.com/capabilities/structured-outputs.

Do not load a model while Fortnite is active without permission. After approval, compare a small CPU configuration and GPU offload on the actual machine with p50/p95 latency, prompt length and VRAM usage recorded. Reduce concurrency to one, cap context and enforce cancellation/timeouts. A sub-five-second target cannot be certified from hardware names. No model or provider is connected now.

## Phases and acceptance gates

1. **UI review (current):** offline fixture-driven screens, navigation, preferences, alerts and practice flows; automated checks; manual design review. Stop before integrations.
2. **Live markets after approval:** verified token identity, provider rate limits, stale-data handling, read-only RPC, actual timestamped charts and cache migrations. Remove fixture labels only on verified live records.
3. **Authorised social sources:** per-source authentication/approval, provenance, keyword/account monitoring, deduplication, event timing and gap reporting.
4. **Local AI:** immediate deterministic evidence rules; structured interpretation; missing/contradictory evidence; bounded inference queue and explainable classifications.
5. **Read-only portfolio and alerts:** official Axiom integration only if established; otherwise RPC/CSV; native persistent centre/window; DND/fullscreen/quiet-hours testing; actual performance history.
6. **Paper engine and optimisation:** reproducible execution model, stop/target/trailing orders, liquidity/slippage/fees/failure models, historical backtesting without survivorship shortcuts, CPU/memory/FPS/startup measurement.
7. **Optional cloud:** authenticated worker, durable cursors/gap tracking, encrypted sync, explicit budget and service limitations.
8. **Release:** reviewed migration/backup recovery, Windows CI, signed installer if signing credentials are separately configured, security review and measured Windows acceptance tests.

## Windows appearance limitations

Tauri documents native Windows effects and version-specific acrylic performance caveats: https://v2.tauri.app/reference/config/. Native effects need tests on the target Windows build, including disabled system transparency. A custom GPU renderer is a separate feasibility effort; the app must offer an opaque fallback and describe it honestly. The browser prototype does not implement desktop capture or real desktop blur.

## Proposed persistent production schema (not yet implemented)

Migrations should introduce settings/themes, connection metadata (no plaintext secrets), watchlists, source events with unique source IDs, market samples, evidence snapshots, analyses, alerts and acknowledgement history, practice fills, portfolio snapshots, conversations/messages, worker health/gaps and bounded logs. Use WAL, transactions, foreign keys and versioned backup/restore. Browser localStorage is the explicit prototype substitute; no SQL migration is claimed as delivered.
