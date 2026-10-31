---
description: "Record a component review supported by original files"
---

# Record a component review supported by original files

Read CLAUDE.md. Run `npm run licenses -- review-component --component="ID" --decision=approved --reason="REVIEW" --evidence="SOURCE" --valid-until=YYYY-MM-DD --license-file="PATH" --modified=no --actor="REVIEWER"` using the operator's actual values. Use `--json` for exact records. Report the result, its owner and the next unresolved item. Never invent missing evidence.

Read the affected records first. Run the same command with `--dry-run` before applying it. Use the actual named operator, not an invented reviewer. Keep the emitted audit record.

Read docs/compliance.md. Include --copyright-file when the export lacks verified copyright. Apache-2.0 needs --notice-status=absent after checking the upstream files, or --notice-status=included with --notice-file. Modified packages need --modified=yes and --change-notice. Compound and unsupported licences stay blocked until a reviewed rule is implemented. Never approve because a package is merely described as open source.
