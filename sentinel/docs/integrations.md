# Integration feasibility — documentation review, 1 November 2026

All connector implementations are deferred until design approval. Documentation availability is not proof of account entitlement. No credentials, requests to provider data endpoints or account authorisations have been tested.

| Source | Legitimate future interface | Availability / cost boundary |
| --- | --- | --- |
| DEX Screener | Official token-profile and pair/token market endpoints | Public documented endpoints with route-specific limits; profiles are not complete launch coverage. Current reference lists 60/min on profile routes and 300/min on several market routes. https://docs.dexscreener.com/api/reference |
| Solana | Read-only HTTP RPC and supported WebSocket subscriptions | Public addresses only, provider rate limits. Full transaction history/indexing may require a paid provider; a wallet balance is not a complete P&L ledger. https://solana.com/docs/rpc |
| X | Official developer API | Current docs describe pay-per-use credits; do not promise free unrestricted monitoring. Requires authorised access and budget. https://docs.x.com/x-api/getting-started/pricing |
| Reddit | Official API with approved access/OAuth where applicable | Account/application eligibility and policies must be checked before collection; no unrestricted anonymous scraping assumed. https://www.reddit.com/dev/api/ |
| YouTube | Official Data API | API project/key for supported public data, OAuth for authorised user data, quota limits. Not universal real-time social search. https://developers.google.com/youtube/data/getting-started |
| Telegram | Bot API in permitted chats/channels | Bot membership, privacy mode and permissions constrain visible messages. Not global arbitrary-channel access. https://core.telegram.org/bots/faq |
| Discord | Authorised bot/Gateway | Server permissions and applicable message-content intent restrictions. No user-token extraction or self-bot access. https://docs.discord.com/developers/events/gateway |
| News / RSS | Publisher-permitted feeds | Per-publisher terms, attribution, caching and refresh rules. No claim that all news content is free or redistributable. |
| Axiom | Not established | Official docs/index reviewed; no developer portfolio API or documented token-link contract found. This is a limited negative finding, not proof no private partner API exists. Use public-wallet RPC and manual transaction CSV as future alternatives. https://docs.axiom.trade/llms.txt |

No Axiom token URL is constructed. The prototype copies a clearly fictional fixture ID and shows integration requirements; it cannot open a corresponding real token.

## Free versus paid

| Capability | No provider charge possible | Limits / potential payment |
| --- | --- | --- |
| Current UI prototype | Entirely offline, zero external runtime dependencies | PC electricity/storage; no paid integration needed |
| Future paper trading / SQLite | Local computation and storage | Requires legitimate price data; free sources have gaps and quotas |
| Future local AI | Open-weight local models, subject to model licence | Hardware, energy, model download; paid hosted APIs optional |
| Future market and wallet reads | Documented public endpoints / provider free tiers | Throughput, reliability, archival indexing and history can cost money |
| Social intelligence | Permitted feeds and eligible bot integrations may be free | X usage, Reddit approval/terms and other platform quotas cannot be assumed free |
| GitHub Actions | Plan-dependent included usage | Not configured here. Quotas and runner billing apply; not permanent app hosting. https://docs.github.com/en/actions/concepts/billing-and-usage |
| Render | Free static sites and limited web services | Free web services idle after 15 minutes, have ephemeral files and usage limits; unsuitable for a continuously connected collector. Free Postgres expires after 30 days. https://render.com/docs/free |
| Cloudflare Workers | Free quota may suit bounded scheduled HTTP checks | CPU/request/duration limits; not a desktop AI process or unrestricted always-running daemon. Durable storage/auth and scheduling design still required. https://developers.cloudflare.com/workers/platform/limits/ |
| Reliable cloud monitoring | No uninterrupted free operation promised | Paid worker/VPS + durable DB may be necessary; credentials and budget require separate configuration |

No hosting account was created, no billing enabled, and no deployment published. An access-controlled hosted preview would be a later opt-in publication, which conflicts with the current instruction to keep changes unpublished.
