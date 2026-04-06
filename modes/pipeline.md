# Mode: pipeline

Process queued job URLs from `data/pipeline.md`.

1. Read pending URLs
2. Extract job descriptions
3. Evaluate each role
4. Generate report and optional PDF
5. Update canonical tracker

This mode is intended to support both manual and cron-triggered runs.
