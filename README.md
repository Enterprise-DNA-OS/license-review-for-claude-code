# License Review for Claude Code

Open-source component records, licence evidence and release reviews in a database you own. Free, MIT licensed. Built by Enterprise DNA.

<!-- three-doors -->
<table align="center">
  <tr>
    <td align="center"><strong>Do it yourself</strong><br/>Clone it, run it, own it. Free, MIT.<br/><a href="#quick-start">Quick start</a></td>
    <td align="center"><strong>We customise it</strong><br/>Your fields, your rules, your FOSSA data brought across.<br/><a href="https://enterprisedna.co/omni/book/?utm_source=github&utm_medium=readme&utm_campaign=fossa">Book a call</a></td>
    <td align="center"><strong>We run it for you</strong><br/>Installed, connected and operated inside Omni. Setup fee, then a retainer.<br/><a href="https://enterprisedna.co/omni/instead-of/fossa?utm_source=github&utm_medium=readme&utm_campaign=fossa">How it works</a></td>
  </tr>
</table>

## What this does

Import a FOSSA SPDX JSON inventory, review component licence evidence, compare releases, track overdue follow-ups and draft attribution paperwork. Current release readiness accounts for review expiry and changes after sign-off. Claude Code, Codex, OpenCode or Cursor runs the same commands.

This is a focused replacement for the licence review desk. Component discovery, binary and snippet scanning, dependency resolution and vulnerability intelligence remain separate inputs. It is not a replacement for every FOSSA feature or a legal compliance certification.

FOSSA Business L shows US$1,656 a month billed annually, or US$19,872 a year, for 50 contributing developers and 100 projects on its [pricing selector](https://fossa.com/pricing/), checked 31 October 2026. This is a listed plan, not a customer invoice. See [research](docs/research.md).

## Quick start

```bash
git clone https://github.com/Enterprise-DNA-OS/license-review-for-claude-code.git
cd license-review-for-claude-code
npm install
npm test
npm run demo
npm run licenses -- releases
npm run licenses -- review-queue
npm run view
npm run docs
```

Node 20 or later. With no DATABASE_URL, PGlite persists locally in .data/db. For PostgreSQL 15 or later, set DATABASE_URL to your private empty database and run npm run migrate. The same SQL works on both engines. Do not seed a production database. Demo data is fictional and deliberately includes unknown licences, expired reviews, old inventories and overdue follow-ups.

## The commands

One CLI: `npm run licenses -- help`. Human tables are the default, `--json` returns exact records. Select by a case-insensitive name or UUID prefix. Ambiguous names list candidates and exit 1. Release names use `Project / version`. Database writes require `--actor` and accept `--dry-run`.

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

## Evidence and sign-off

MIT, Apache-2.0 and BSD-3-Clause have explicit evidence checklists. Compound, custom and other licence expressions stay blocked. A reviewer records the exact licence and copyright text, a source reference, a validity date, and applicable notice or modification evidence. The program checks presence and dates, not whether an uploaded legal text is correct.

A release can be signed off only when its inventory is fresh, its project review is current, every component review passes, and no follow-up is open. The sign-off reviewer must differ from the importer. Actor names are recorded labels, not authentication. Imported records and review history cannot be overwritten. A later review invalidates the sign-off fingerprint. Read [compliance.md](docs/compliance.md) before using real data.

## Questions your own review desk answers

These questions are backed by the shipped commands. They combine your own review dates, release history and follow-ups. They are not claims that FOSSA cannot reproduce them.

1. Which releases have missing licence evidence and open follow-up work? (`npm run licenses -- releases`)
2. Which package appears in both products, and who owns each review? (`npm run licenses -- where-used --name=demo-route-kit`)
3. Which dependency versions or licence declarations changed since the last release? (`npm run licenses -- changes --release="Harbour Dispatch / 2.0" --against="Harbour Dispatch / 1.9"`)
4. Which reviews have expired even though somebody approved them before? (`npm run licenses -- review-queue`)
5. Which Apache components still need their upstream notice checked? (`npm run licenses -- notices`)
6. Whose follow-up tasks are overdue, and by how many days? (`npm run licenses -- overdue`)
7. Which products have passed their project review date? (`npm run licenses -- projects`)
8. Which inventories are too old for our release policy? (`npm run licenses -- compliance`)
9. Who signed off a release, and do its current reviews still support that decision? (`npm run licenses -- release --release="Harbour Dispatch / 2.0"`)
10. What review decisions and follow-up changes were recorded, and by whom? (`npm run licenses -- activity`)

## Your first hour: ten things to ask for

1. Put our business name, logo and colours in brand.json.
2. Show every release blocked by missing evidence.
3. Find the component used by both products.
4. Compare the current inventory with the previous version.
5. Show expired approvals and the reviewer who recorded them.
6. Draft the weekly review from readiness, evidence and overdue work.
7. Import our supported FOSSA download with a test run first.
8. Record the original licence and notice evidence for one component.
9. Add our review-owner field through a tested migration.
10. Export a complete private backup before changing a rule.

## Documents and views

`npm run docs` creates three branded HTML documents per release: a release review pack, attribution evidence draft and handover sheet. `npm run view` creates three read-only dashboards. The plain-text `draft-attribution`, `draft-review` and `weekly-review` commands write uniquely named files under drafts. No command sends or publishes. Inspect every attribution draft against upstream files before distribution. Demo texts cannot be used as real notices.

## Instead of FOSSA

The [switching guide](docs/replace-fossa.md) documents the supported SPDX JSON export, one-command import, exact mapping and reconciliation. Import preserves every package and the complete original document. File-level evidence and relationships are retained but not interpreted. Existing vendor approvals are not silently copied into new decisions. Review a real export alongside your existing process before switching.

## Verification and data controls

`npm test` uses an isolated temporary database and output directory. It checks migrations, seed repeatability, all CLI commands, atomic imports, ambiguity, malformed input, expiry, notice requirements, sign-off invalidation, append-only records, exports and HTML escaping. CI covers Node 20 and 22 on Windows and Ubuntu, plus PostgreSQL 16. Configured checks and observed results are reported separately.

Database tables have row-level security and no PUBLIC privileges. The CLI operates as a trusted database owner. That owner can bypass controls, so this is not a tamper-proof audit system or a multi-user access boundary. Keep inventories, exports and drafts private. Back up the database with its native backup tools as well as the complete JSON export. [Why no front end](docs/why-no-front-end.md) explains the operating model.

## Want it installed and run for you?

**Omni by Enterprise DNA** brings your FOSSA records across, builds your review rules and connects your chosen scanning process. We can add a web front end, use a different stack, and operate the system with your team. One setup fee, then a retainer.

[Book a 30-minute call with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=fossa).

## Licence

MIT. Copyright 2026 Enterprise DNA. Third-party component licences remain their owners' terms.
