# SENTINEL

Windows 11 research terminal — **simulation and design review only**.

The current desktop application is in [`sentinel/desktop`](sentinel/desktop/README.md): Tauri 2, Rust, SQLite, React/TypeScript, native titlebar/tray/startup controls, opt-in notifications and native Acrylic/Mica support with an explicit opaque fallback.

No live market/social/AI providers, wallet signing or real financial transactions are connected. All displayed market data and posts are fictional fixtures. The original domain engine and backup validators remain in use.

Development branch: [`sentinel/native-redesign`](https://github.com/bIoodling/sentinel/tree/sentinel/native-redesign). [Windows builds, test reports and screenshots](https://github.com/bIoodling/sentinel/actions/workflows/desktop.yml) are generated on GitHub runners. Nothing runs on the user's PC automatically.

Read the [desktop build and review instructions](sentinel/desktop/README.md) before testing. Downloadable builds are unsigned. Minimum supported window size: 720×620 logical pixels. Mixed-DPI, native effects and fullscreen/game notification behaviour require manual acceptance testing on the target hardware.

The historical browser prototype remains in `sentinel/`; its Git history is preserved in `sentinel/history/prototype.bundle` and in the development branch ancestry. `bIoodling/blood` is not modified by this project.
