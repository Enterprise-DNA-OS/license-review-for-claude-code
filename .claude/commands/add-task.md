---
description: "Log a licence follow-up with an owner and deadline"
---

# Log a licence follow-up with an owner and deadline

Read CLAUDE.md. Run `npm run licenses -- add-task --release="PROJECT / VERSION" --title="TASK" --owner="OWNER" --due=YYYY-MM-DD --actor="OPERATOR"` using the operator's actual values. Use `--json` for exact records. Report the result, its owner and the next unresolved item. Never invent missing evidence.

Read the affected records first. Run the same command with `--dry-run` before applying it. Use the actual named operator, not an invented reviewer. Keep the emitted audit record.
