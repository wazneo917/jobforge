# Architecture

JobForge combines two ideas:

- **Career-Ops style UX**: markdown-driven modes, structured evaluation, batch processing, tracker integrity
- **LifeOS style automation**: cron jobs, multi-stage scraping, agent roles, continuous pipelines

## System layers

1. **Discovery**
   - scrape portals
   - normalize URLs and dedupe
   - store raw job data

2. **Evaluation**
   - classify role archetype
   - score fit
   - generate report markdown

3. **Preparation**
   - create tailored resume/CV
   - draft application answers
   - optional PDF generation

4. **Tracking**
   - write canonical application records
   - normalize statuses
   - verify integrity

5. **Automation**
   - cron triggers
   - batch processing
   - optional dashboard

## Design principles

- source-controlled configuration
- reusable prompt modes
- provider-agnostic execution
- clear separation of raw data and generated output
- public repo friendly
