---
description: "Record the owner review and its next due date"
---

# Record the owner review and its next due date

Read CLAUDE.md. Run `npm run licenses -- review-project --project="PROJECT" --review-due=YYYY-MM-DD --reason="EVIDENCE" --actor="OPERATOR"` using the operator's actual values. Use `--json` for exact records. Report the result, its owner and the next unresolved item. Never invent missing evidence.

Read the affected records first. Run the same command with `--dry-run` before applying it. Use the actual named operator, not an invented reviewer. Keep the emitted audit record.
