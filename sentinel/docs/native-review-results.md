# SENTINEL 0.2 — native Windows review build

Source commit: `e22ca98ed4ebb71b0b6e9032f9a51d28ac4c112d` on `sentinel/native-redesign`.

Repository: https://github.com/bIoodling/sentinel/tree/sentinel/native-redesign

Build and test run: https://github.com/bIoodling/sentinel/actions/runs/41362135631

## What changed

The original simulation engine, fee-inclusive practice ledger, risk guards and backup validators are retained. The primary application now uses Tauri 2 / Rust / WebView2, React/TypeScript, SQLite, locally bundled Manrope, and Lightweight Charts. The original HTML prototype remains preserved rather than replaced or deleted.

The redesign covers all eight screens: dashboard, discovery, portfolio, social intelligence, assistant, notifications, connections and settings. It includes vector token icons, synthetic OHLC charts with zoom/crosshair/volume, 62 grouped default keywords, editable account preferences, scripted Markdown chat, categorized alerts, and contained-scroll desktop layouts.

Windows source includes custom window controls and dragging/resizing, a tray menu, opt-in sign-in startup, native toasts, a non-focusable floating alert window, monitor selection/fallback, persisted window bounds, native Acrylic/Mica configuration, and an explicitly reported opaque fallback. Changes save to a transactional SQLite workspace; normal close waits for the save queue.

## Verification

- Strict TypeScript and production frontend asset build passed locally and remotely.
- Eleven deterministic domain tests cover original accounting/guards/persistence and new OHLC/keyword migration invariants.
- Six remote browser tests cover four viewport sizes, the practice/settings/keyword/chat/alert workflow, and opening the self-contained secondary preview from a local file URL.
- All eight pages were captured at 1440×920, 1024×768, portrait 768×1024 and 720×620. Automated checks found no page-level overflow; tables, feeds, chat and settings use internal scrolling. All eight default-size screenshots were inspected.
- Windows compilation, NSIS packaging, the SQLite migration/rollback test and process-liveness check all passed in the linked Actions run. The run completed successfully.
- The original prototype commit `ee8a29ed3984e5d648ff7af787b4a65c6ddae44d` is an ancestor of the new remote development branch. The exact original Git history is also retained in a bundle. No feature changes were merged into main.

No application, browser automation, native compilation, inference model or GPU benchmark was launched on the user's PC during this overhaul. The authorised local work used source editing, project-local dependencies and lightweight frontend checks. Windows builds and browser tests ran on GitHub-hosted machines.

## Manual acceptance still required

The minimum supported application window is **720×620 logical pixels**. Test your mixed-DPI landscape/portrait monitors, drag/resize, monitor disconnection recovery, native acrylic visibility and keyboard-focus behaviour while a fullscreen game is running. A process-liveness check does not certify those interactions. Native FPS, startup timing, idle CPU/GPU and memory consumption have not been benchmarked; no 60 FPS or sub-five-second AI result is claimed.

Windows controls the native blur kernel. Tint/opacity apply to Acrylic; Mica tint is system-controlled. The Panel blur slider affects web-content blur. Disabled system transparency or native-effect errors produce an opaque fallback, not a custom desktop-capture blur renderer. Browser screenshots show the shared UI, not proof of native desktop blur.

The Windows test binaries are unsigned and require WebView2 Runtime. The optional installer can obtain WebView2 when the user chooses to run it. Nothing installs or launches automatically. Startup, native toast delivery and floating alerts are opt-in.

## Functional boundaries

All token prices, liquidity, posts, risk labels and signals are invented fixtures. AI replies are scripted. The portfolio curve is an illustrative index, separate from the calculated practice ledger. Currency changes relabel fixture values rather than performing FX conversion. Time filters affect sell-fill statistics and trade display; headline P&L is lifetime. Win rate counts sell fills, not closed multi-fill positions.

No live provider, OAuth, private portfolio integration, wallet signing, real-money execution, cloud monitoring or local inference is connected. Connection controls explain provider setup requirements. Stop orders, realistic execution latency, historical equity snapshots and backtesting remain later-phase work. Live integrations remain stopped pending explicit design approval.

## Security review

No credentials, wallet keys, seed phrases, passwords, browser cookies or hardcoded tokens are collected. Production CSP limits content and IPC origins; no shell or general filesystem plugin is enabled. Mutable workspace and window-control Rust commands verify the calling window. Database operations run off the UI thread, use parameterised SQL and transactional writes, and enforce a 2 MB payload cap. JSON restores retain the original schema and ledger-consistency validation. Destructive reset/restore requires confirmation.

Local SQLite, browser storage, JSON backups and Git bundles are not encrypted secret stores. They contain research preferences, conversations and practice data only. Monetary calculations still use floating-point arithmetic and are suitable for this simulation review, not production accounting. Future credentials require a separately implemented secure store; future provider URLs, logging, IPC types, signed updates and cloud authentication require another review. This is an engineering review, not an external penetration-test certification.

## Files

- `SENTINEL.exe`: portable Windows test application; launch manually.
- `SENTINEL-Setup.exe`: optional Windows installer; run manually if desired.
- `SENTINEL-Windows-x64.zip`: original CI package with binary, installer and notices.
- `SENTINEL-v0.2-preview.html`: secondary offline browser review file.
- `SENTINEL-v0.2-source.zip`: source, build instructions, SQL migration and test code.
- `SENTINEL-v0.2-history.bundle`: preserved local and remote history.
- `SENTINEL-UI-review.zip`: all viewport screenshots, browser test report, and web build.
- `SENTINEL-screenshots/`: eight default-size page screenshots.

The repository remains public with the user's explicit authorisation. `bIoodling/blood` is untouched.
