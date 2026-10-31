# Move the licence review desk from FOSSA

This base replaces the record-keeping part of an open-source licence review workflow. Keep a suitable component discovery and security scanning process. Binary analysis, snippet detection, dependency resolution and vulnerability feeds are separate capabilities. Never cancel a scanner on the strength of an imported inventory alone.

## Export from FOSSA

Open the relevant project or release group, then Reports > SBOM. Select SPDX JSON. Include the full dependency scope, declared and concluded licences, and copyright information. Download locally. FOSSA's [generation guide](https://docs.fossa.com/docs/sbom/generating-sboms), reopened 31 October 2026, documents this route. Confirm the output identifies itself as SPDX-2.2 or SPDX-2.3. The base accepts these JSON versions, not the separate FOSSA JSON attribution format, XML or tag-value text.

Also download the [licensing report](https://docs.fossa.com/docs/reports/licensing-report) and retain original upstream licence and NOTICE files. Imported inventory metadata does not automatically become an approved attribution record.

## Prepare the empty destination

Node 20 or later. Run `npm install` and `npm run migrate` against an empty local or private PostgreSQL database. Use `npm run demo` only for fictional exploration. Create your project once:

```bash
npm run licenses -- add-project --name="Dispatch" --owner="Real owner" --purpose="Delivery product" --review-due=2026-12-01 --actor="Real operator"
```

Use dates appropriate to your actual review. The examples are syntax, not instructions to invent an operator or a review.

## One import command

```bash
npm run licenses -- import fossa --file="imports/dispatch.spdx.json" --project="Dispatch" --version="2.0" --target-date=2026-11-15 --distribution=binary --actor="Real operator"
```

First add `--dry-run` to validate and roll back the entire import. The normal command imports all packages atomically and stores the original document, its source timestamp and a checksum. A repeated identical file with the same project, version and settings is skipped. Different bytes or settings under the same version are refused; give changed inventory its own version. Timestamps older than the 30-day house limit import successfully but block release sign-off.

A representative synthetic file is in fixtures/fossa.spdx.json. It follows the published standard and is not an actual customer's export. This release has not been tested against a private FOSSA account export. Validate your real download before switching.

## Mapping

| FOSSA SPDX JSON field | Destination |
|---|---|
| documentNamespace, creationInfo.created | Release source identity and inventory date |
| Entire original document | Preserved source_document plus SHA-256 of the original input bytes |
| packages[].SPDXID | Unique package identity within the release |
| name, versionInfo | Component name and version |
| licenseDeclared, licenseConcluded | Separate expressions, preserved as supplied |
| copyrightText, supplier | Imported evidence metadata |
| externalRefs with referenceType purl | Package URL identity |
| Command arguments | Destination project, release version, target date and distribution type |

An absent version, supplier or copyright is preserved as missing. Missing licence expressions become NOASSERTION and block review. All exported packages are imported, including a root package if the export includes it. Nothing is silently treated as first-party or excluded as a development dependency.

Files, snippets, relationships, checksums, vulnerability statements, extracted licence texts and additional metadata stay inside the original document but are not normalised or evaluated. FOSSA's issue dispositions, audit history, access policies, scanner configuration and existing approvals do not become local review decisions. Map those separately when needed. Separate release groups and inventory files require their own explicit destination mapping.

## Reconcile before switching

Read `components --release="Dispatch / 2.0"` and compare package counts, names, versions and both licence expressions with the export. Export the destination with `export --out="exports/first-import.json"` and compare the preserved source document. Read `compliance --release="Dispatch / 2.0"`, record evidence reviews and assign every unresolved item. Unsupported licences remain blocked.

Run one real release review alongside your current process. Compare the attribution draft against original licence and NOTICE files, confirm completeness with your reviewer, and test backups and access before shared use. The local review workflow can be set up in a day for a supported export. Remediation and legal review depend on the evidence you bring.
