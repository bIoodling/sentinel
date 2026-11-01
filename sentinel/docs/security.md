# Prototype security review

Scope: offline UI and its local data only. This is an engineering review, not a penetration-test or production certification.

Implemented protections:

- No network data client, external assets, analytics, signing code, order provider, private keys, seed phrases or API-key fields.
- Dynamic strings are HTML-escaped. No eval or remote executable content in application code. Build output is self-contained.
- JSON import has a 2 MB input limit, version/schema checks, bounded arrays, trade arithmetic/cash reconciliation, oversell checks, enum/colour/time validation and confirmation before replacement.
- Settings are constrained to defined keys. Colour values require six-digit HEX; numeric preferences are bounded on restore. User text does not become CSS or arbitrary attributes.
- Atomic localStorage value replacement; failures are surfaced. Backup/restore protects against browser storage unavailability but does not replace a production database.
- Practice fills validate positive finite inputs, holdings, cash including fees, allocation/drawdown and fixture liquidity. Failed fills do not mutate balances.
- Destructive reset and backup replacement require explicit in-app confirmation. No real financial transactions are possible.
- Test popups are local, with opt-in audio, configured quiet hours, category/liquidity filters and persistent history. They do not claim native Windows delivery.

Residual limitations:

- Browser storage and exported JSON are plaintext and accessible to the current OS/browser user. Never store secrets here. Browsers may vary in file-URL persistence isolation.
- No cryptographic tamper resistance: a user can edit local prototype data. The import checks protect normal consistency, not adversarial accounting integrity.
- Ledger amounts use floating-point numbers, adequate for UI simulation only. Production uses fixed-point/decimal arithmetic and unit-labelled quote/FX provenance.
- Local-file CSP, dependency supply chain, Tauri capabilities, IPC origin checks, native credential isolation, cloud authentication, backup encryption and signed updates require a later production review.
- No browser or native UI was launched for visual, accessibility or focus testing. No external security scan or native penetration test was performed.
- App templates deliberately avoid external token links until official URL contracts and token identity are verified. External text is fixture-only.
- Concurrent browser tabs can overwrite local state; the UI warns on storage events but does not merge ledgers. Use one preview tab.
- Chat/alert/backup collections have caps; data retention settings do not implement a production retention service yet.

Before production: add typed IPC schemas and allowlists, exact monetary units, transactionally persisted evidence/fills, SQLite migration recovery tests, Credential Manager integration, redacted logging, provider URL/redirect/SSRF validation, timeouts/cancellation/backoff, least-privilege native capabilities, threat modelling and measured rate-limit handling. Native desktop blur must not use unreviewed desktop capture or privileged hooks.
