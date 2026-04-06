# JobForge

JobForge is an open-source job search pipeline that combines:

- **Discovery**: cron-driven job scraping and portal scans
- **Evaluation**: structured JD analysis and scoring
- **Application prep**: tailored resume/CV and draft answers
- **Tracking**: deduped canonical application state
- **Automation**: optional batch and scheduled runs

It is designed to blend the best parts of two systems:

- the **productized UX** of Career-Ops
- the **agentic discovery engine** of LifeOS

## Goals

- Keep the workflow reproducible and source-controlled
- Support both manual review and autonomous cron runs
- Stay provider-agnostic: Claude, OpenClaw agents, local scripts, or browser automation
- Make the repo public-friendly: docs, examples, clean configs, and MIT licensing

## Current status

This repo has been scaffolded and is ready for the first implementation pass.

## Proposed workflow

1. **Scan** jobs from sources and portals
2. **Evaluate** each JD against the profile
3. **Generate** report, resume, and draft answers
4. **Track** application state in a canonical file
5. **Repeat** via cron or batch mode

## Suggested structure

- `config/` — profile and source configuration
- `data/` — canonical pipeline inputs and tracker data
- `docs/` — architecture, customization, and contribution docs
- `modes/` — prompt-driven workflow definitions
- `scripts/` — executable pipeline entrypoints
- `templates/` — resume, portal, and tracker templates
- `reports/` — generated evaluation reports
- `output/` — generated PDFs and assets

## Next implementation steps

- import the LifeOS discovery pipeline as the backend
- add a clean job tracker format
- implement a Career-Ops-style evaluation mode
- add a dashboard and batch runner
- add docs and examples for public release
