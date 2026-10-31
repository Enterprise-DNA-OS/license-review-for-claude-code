---
description: "Import a FOSSA SPDX JSON inventory without discarding its original content"
---

# Import a FOSSA SPDX JSON inventory without discarding its original content

Read CLAUDE.md. Run `npm run licenses -- import fossa --file="PATH" --project="PROJECT" --version="VERSION" --target-date=YYYY-MM-DD --distribution=binary --actor="OPERATOR"` using the operator's actual values. Use `--json` for exact records. Report the result, its owner and the next unresolved item. Never invent missing evidence.

Read the affected records first. Run the same command with `--dry-run` before applying it. Use the actual named operator, not an invented reviewer. Keep the emitted audit record.

Read docs/replace-fossa.md. Compare exported package count, names and versions with the imported results. Unsupported fields remain in the original document but are not evaluated. Never fabricate a missing export.
