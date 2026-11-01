# SENTINEL native redesign

The desktop target is Tauri 2 / Rust / WebView2, with React 19 and TypeScript, Manrope Variable, and TradingView Lightweight Charts. The original `../src/model.js` trading engine and `../src/store.js` backup validators are reused; the original browser preview remains intact.

All market data, social posts, signals and AI responses are simulated. No provider credentials, wallet signing or real transactions exist. Native notification and floating-window delivery are opt-in; startup is disabled until explicitly enabled in Windows settings inside the application.

## Build

Use Node 24+, pnpm 11.25.0, stable Rust, Windows MSVC build tools and WebView2 on a build machine. No native toolchain was installed on the user's PC. The GitHub Actions Windows job is the preferred build route.

```text
cd sentinel/desktop
pnpm install --frozen-lockfile
pnpm build
pnpm test
node scripts/icon.mjs
pnpm tauri build --bundles nsis
```

Executable: `src-tauri/target/release/sentinel.exe`. Installer: `src-tauri/target/release/bundle/nsis/*-setup.exe`. CI also packages `SENTINEL-portable.exe`. The portable executable requires Windows WebView2 Runtime; it does not open Chrome/Edge or use browser tabs. The installer can obtain WebView2 if it is absent, only when the user chooses to run the installer. Builds are unsigned unless a later signing setup is provided.

Development preview: `pnpm dev` (launch manually); then visit the displayed localhost address. This preview is secondary to the desktop target. Browser mode cannot apply Windows acrylic, register startup or show OS-level notifications. Browser backups can be imported in the desktop app.

## Persistence and native behaviour

The Rust backend owns SQLite at the application-data path for `dev.sentinel.research`. Migration `001_state.sql` creates a versioned, transactional workspace snapshot with WAL. Snapshot data includes preferences, watchlists, alerts, practice ledger and conversations. JSON export/restore remains supported. Browser-mode storage uses `sentinel.desktop.v2` and migrates the original `sentinel.prototype.v1` format when on the same origin. No secret is stored in the snapshot.

Main-window position, size and maximised state use Tauri's window-state plugin. Saved off-screen bounds are checked against attached monitors. Supported minimum window size is **720 × 620 logical pixels**. The layout uses contained scrolling in tables, feeds, chat and settings; lower-priority panels collapse at compact sizes. Displays with less logical workspace cannot fit that minimum without changing window/application scale.

Close exits by default; “Close to system tray” is optional. Tray menu offers Open and Quit. Startup registration changes only through the explicit switch; importing a backup does not enable it. Floating alerts are non-focusable and use the selected monitor's work area, falling back to current/primary when disconnected. Native toasts remain subject to Windows notification policy and are not guaranteed to stay visible. Persistent alert history lives in SQLite.

## Acrylic and fallback

Native Windows Acrylic/Mica is configured through Tauri's native window effects, with transparent WebView2 backgrounds. Acrylic tint and opacity are passed to the compositor. The native blur kernel is controlled by Windows; the Panel blur slider only adjusts web-content blur. Mica tint is OS-controlled.

If Windows transparency is disabled or native effect setup fails, the UI explicitly reports **opaque fallback**. There is no custom desktop-capture/GPU blur fallback. Browser glass is page-content blur only. Native effect visibility, borderless resize/DPI transitions, Windows DND/fullscreen/game interaction and multi-monitor placement require manual testing on the user's hardware. Never claim those have been verified solely by a successful compile.

## Tests and review

- `pnpm build`: strict TypeScript and production asset build.
- `pnpm test`: original trading, risk-limit, persistence and ledger tests.
- `pnpm test:ui`: Playwright layout/workflow checks at 1440×920, 1024×768, 768×1024 portrait and 720×620; captures all eight pages. Run in CI, not on the user's desktop.
- Windows CI builds an NSIS installer and portable executable and performs a short process-liveness smoke check. It does not certify interactive resizing, hardware acceleration performance or compositor output.

Performance claims remain measured rather than assumed: the frontend build is small and views are lazy-loaded; no 60 FPS, memory or inference guarantee is made. Model inference and live connectors are still outside this design-review build.

## Preserved features and limitations

Practice buy/sell review, partial sells, cash additions, CSV export, fees/slippage, limits, watchlists, keyword/account editing, preferences, backup/restore, alerts and scripted chat remain functional. Original custom settings and keywords are preserved. The untouched default four-keyword list is upgraded to a grouped 62-word vocabulary. Charts are valid deterministic synthetic OHLC, not historic prices. The portfolio curve is explicitly an illustrative index; balances, holdings and realised statistics derive from the practice ledger. Currency selection relabels fixture units, without FX conversion.

Connections open honest setup explanations, not fake OAuth. No live integration begins before design approval. The full original Git history is archived in `../history/prototype.bundle` and imported into the new development branch by CI; `blood` is not changed.
