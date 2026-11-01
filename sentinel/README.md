# SENTINEL — unpublished UI review

This is an offline, interactive simulation prototype, not a connected trading terminal. No real prices, social posts, account balances or model outputs are shown. No real-money orders, signing, credentials or network clients exist.

## Review without installation

Open the supplied `SENTINEL-preview.html` yourself when ready. It is one self-contained file, with no server, installation or external assets. Nothing launches automatically. Keep the same file location/browser profile for stored preferences. Some browsers restrict storage or clipboard operations on local files: the UI reports failures and provides JSON export/restore and manual copy alternatives.

No hosted preview was published. The user chose to keep the GitHub repository public and SENTINEL changes unpublished. The local review file is not a password-protected hosted service; access follows local file permissions. Backups contain conversations and wallet-watchlist preferences and should be treated as private.

## Source & reproducible checks

Node 22+ is sufficient. There are no npm dependencies and no install step.

```powershell
cd sentinel
node scripts/build.mjs
node --test tests/*.test.mjs
```

Build first: one test checks the generated portable file. The resulting file is `dist/SENTINEL-preview.html`. For development, edit `src/app.js`, `src/model.js`, `src/store.js` and `src/styles.css`, rebuild, then reload the portable file manually. There is no preview server or startup service.

The lightweight measurement command is `node scripts/measure.mjs`. It measures only bounded pure functions and file size. See `docs/measurements.json`; it is not a desktop performance benchmark.

## Implemented UI workflows

- Eight navigable pages, responsive compact charcoal layout, keyboard token search, selectable charts and hover OHLC values.
- Discovery search, risk filter, sorting, saved-token filter, token detail dialogs and fixture ID copying.
- Dashboard, practice portfolio, cash additions, reviewed buys/sells, partial sells, costs, slippage, allocation and drawdown checks, deterministic failure scenario and CSV trade export.
- Fee-inclusive average-cost holdings, realised/unrealised P&L and closed-sell statistics with selectable periods.
- Fictional social feed search/source filters; editable monitoring keywords, account priorities, per-account keywords and alert preferences.
- Scripted assistant with progressive text display, conversations, conversation search and context from practice balances. Every response is marked scripted.
- Persisted alert centre; test popup; acknowledgement/dismissal; current fixture quote; seeded +80% expired-signal example; quiet hours, category/liquidity filters, sound opt-in and popup positioning.
- Appearance controls, native colour picker + HEX input, density, font base size, reduced motion, chart colours, tint/transparency/blur, corner radius and popup shadow.
- All six settings groups plus data/privacy controls; validated JSON backup/restore with confirmation; public-address list; explicit connection health.

## Important boundaries

- Simulation starts paused. Play updates fixture quotes/charts every five seconds while the page is visible. It does not consume GPU inference resources or collect data in the background.
- Token names, sources, posts, market caps, volumes and risk labels are invented. Fixture IDs are not Solana contracts. Simulated prices use the selected display currency as a label, with no FX conversion.
- Charts use a normalised synthetic index; they are not market OHLC. The portfolio curve is illustrative, not reconstructed equity history. Calculated balances and the ledger are separate and labelled.
- Time filters apply to sell-fill statistics and ledger display. Header P&L/costs are lifetime. A sell fill counts as one outcome; this is not a closed-position win-rate methodology.
- Monitor choice, hardware acceleration, local AI, background processing, memory/cache/retention settings and future connector preferences are saved only. The browser does not control Windows or run those services.
- Notifications stay inside the page. They cannot appear above other applications, determine Windows Do Not Disturb/fullscreen state, launch at login or select an OS monitor. Pending alerts remain in the centre after restart if browser storage is available.
- Glass blurs web content only. Alpha/tint does not blur the desktop wallpaper. Native acrylic, custom GPU fallback and Windows transparency-disabled behaviour are unimplemented.
- No SQLite/native shell/installer is shipped at this checkpoint. Future implementation requires design approval plus an authorised remote build environment or permission for native build work.
- Stop orders, trailing stops, realistic execution latency/failure fees, live integrations, cloud sync and backtesting are deferred.

## Repository protection

Source was based on `bIoodling/blood` main commit `20702941d4ef4709a69c5e6fbf254c5cd59233e3`. Existing `fb.lua` and history are preserved. All application changes are inside `/sentinel` on local branch `sentinel/ui-prototype`. No push, PR, merge, visibility change or external deployment has occurred.

GitHub Actions was deferred by instruction because active workflows must live at repository-root `.github/workflows`. A future exception or a separate private repository is needed. No unused workflow file is presented as functioning CI.

## Approval checkpoint

Implementation is ready for manual design testing, not visually certified. No app/browser was launched and no screen automation was performed. Automated checks cover domain calculations, templates, persistence validation and portable packaging, not viewport layout, keyboard focus, screen readers, animation smoothness or native performance. Review the file when convenient. Live integrations remain stopped until explicit design approval.

See `docs/architecture.md`, `docs/integrations.md`, `docs/security.md` and `docs/review-checklist.md`.
