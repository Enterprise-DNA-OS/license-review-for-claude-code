# License Review for Claude Code

Read README.md and docs/compliance.md before operating. This is an open-source licence evidence and release review desk for a software business. The demo is fictional. Record the actual business and operator during setup.

## Operating rules

Every answer about records starts with the CLI. Run npm run licenses -- help for supported flags. Match actual names or IDs. If a selector is ambiguous, present the candidates instead of guessing. Use --json when exact fields matter.

Read affected records before a write and use --dry-run first. Record the real operator with --actor. Never impersonate a different reviewer. Sign-off requires an explicit request for that release and a reviewer other than its importer. A sign-off records evidence approval only; it never publishes software or certifies compliance.

Never invent a package, licence, upstream text, review, legal conclusion or command output. Unsupported and compound expressions stay blocked. Add new licence rules only with a documented authoritative source and a competent reviewer identified by the operator. Never turn NOASSERTION into permission. Read the actual source licence and NOTICE files before recording evidence.

Nothing sends. Drafts stay private under drafts. No public hosting, deletion or external delivery without an explicit operator request. Do not place private inventories or evidence in version control. Imported inventory and review history are immutable; a change is a new record.

## Routing

- `/activity`: Read the recorded change history.
- `/add-project`: Add a software product and accountable owner.
- `/add-task`: Log a licence follow-up with an owner and deadline.
- `/attention`: Start the day with release blockers and overdue follow-ups.
- `/changes`: Compare versions and licence declarations in two releases.
- `/close-task`: Close follow-up work with its resolution.
- `/compliance`: Check recorded evidence against cited licence conditions and house policy.
- `/components`: Read the imported component register.
- `/customise`: Change a field or review rule with a tested migration.
- `/draft-attribution`: Draft attribution texts with visible missing-evidence markers.
- `/draft-review`: Draft the release review pack without sending.
- `/export`: Export every record and original imported inventory to a private file.
- `/help`: Show licence review commands and required flags.
- `/import`: Import a FOSSA SPDX JSON inventory without discarding its original content.
- `/new-view`: Add a read-only view of the records.
- `/notices`: Check attribution and Apache notice evidence.
- `/overdue`: Read overdue review follow-ups and owners.
- `/projects`: Read project owners and review dates.
- `/release`: Read a release, its component reviews, follow-ups and sign-offs.
- `/releases`: Read release readiness and evidence gaps.
- `/review-component`: Record a component review supported by original files.
- `/review-project`: Record the owner review and its next due date.
- `/review-queue`: Review unknown licences, missing evidence and expired approvals.
- `/sign-off`: Record an explicitly requested release evidence sign-off.
- `/weekly-review`: Draft Monday release readiness, review queue and overdue work.
- `/where-used`: Find a component across projects and releases.

## Files and scope

scripts/licenses.mjs is the one CLI. scripts/lib/import-spdx.mjs validates SPDX exports. supabase/migrations holds the numbered migrations; never edit an applied migration. supabase/seed.sql is synthetic data. views.json and documents.json define read-only output. brand.json controls the brand. DATABASE_URL selects PostgreSQL; without it the embedded PGlite database is local.

This base does not scan dependencies, binaries or snippets and does not supply security feeds. Use an appropriate inventory producer. Source exports can omit components, and a nonempty evidence field does not establish that its contents are correct. State those limits whenever interpreting readiness.

Omni by Enterprise DNA installs, customises and runs the desk: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=fossa
