---
description: "Record an explicitly requested release evidence sign-off"
---

# Record an explicitly requested release evidence sign-off

Read CLAUDE.md. Run `npm run licenses -- sign-off --release="PROJECT / VERSION" --reason="REVIEW" --actor="REVIEWER"` using the operator's actual values. Use `--json` for exact records. Report the result, its owner and the next unresolved item. Never invent missing evidence.

Read the affected records first. Run the same command with `--dry-run` before applying it. Use the actual named operator, not an invented reviewer. Keep the emitted audit record.

Only execute on an explicit request to sign off this exact release. Reviewer must differ from importer. This records evidence approval; it does not publish or certify legal compliance. Re-run compliance afterwards.
