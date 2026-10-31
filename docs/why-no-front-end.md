# Why this review desk has no front end

The recurring work is reviewing component inventories, recording evidence, assigning follow-ups and preparing release documents. Those records live in a database. Claude Code, Codex, OpenCode or Cursor can run the same commands and explain the results.

`npm run view` renders read-only HTML for the release desk, evidence queue and follow-ups. `npm run docs` renders release review packs, attribution evidence and handover sheets. Set the business name, logo and colours in brand.json. The output opens in a browser or prints to PDF. It never writes to the database.

A hosted screen offers shared sessions, clickable navigation, mobile access, notifications and concurrent editing. This local base does not provide those. It also does not discover components or update inventories by itself. Import a fresh export from your scanning process for each release. Enterprise DNA can connect your chosen scanner, add authenticated access and build a review screen around your process.

The operating model assumes a trusted operator with private file and database access. It does not replace a collaborative security platform or an independent legal review. Every generated attribution document is a draft. Nobody receives it until a person verifies and sends it.
