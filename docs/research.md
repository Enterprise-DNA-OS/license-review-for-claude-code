# Target research: FOSSA

Checked 31 October 2026. New family: open-source-license-review. Existing software-entitlements tracks purchased rights; vulnerability-remediation tracks security findings. This build tracks component licences, attribution evidence and release decisions.

## Annual bill and score

US$19,872 per year for Business L, calculated as twelve times its US$1,656 monthly equivalent on annual billing. FOSSA's [pricing selector](https://fossa.com/pricing/) was opened in a browser this run, L selected, and the 50-developer, 100-project limits verified. This is a public plan scenario, not a verified NZ or AU customer invoice. Monthly billing and enterprise terms differ. Currency is the site's USD presentation, with no conversion or tax assumption.

Scores in order: annual bill 3 (about US$20k), data-shaped 5, buyer evidence 1, search demand 2, one-session buildable 4, import path 5. Total 20/30. Search results include alternative listicles; search volume was not verified. No FOSSA, Mend.io or Black Duck customer use was found in available customer files and CRM snapshots. The live CRM was not accessed. Buyer evidence is weak and should not be presented as customer demand.

Compared [Mend AppSec](https://www.mend.io/pricing/), 3/3/1/2/2/4 = 15, with an up-to US$1,000 per-developer annual bundle and broader scanning requirements; and [Black Duck](https://www.blackduck.com/software-composition-analysis-tools/black-duck-sca/get-pricing.html), 1/4/1/2/3/4 = 15, whose quote-only bill did not establish the annual cost. These scores are selection judgments, not market statistics.

## Scope evidence

- [FOSSA SBOM generation](https://docs.fossa.com/docs/sbom/generating-sboms): project and release-group exports include SPDX JSON. This is the import path.
- [FOSSA licensing reports](https://docs.fossa.com/docs/reports/licensing-report): attribution includes licence and copyright material. This informs the review paperwork.
- [SPDX package information](https://spdx.github.io/spdx-spec/v2.3.1/package-information/): mapping semantics and unknown values.
- Licence terms and the implemented evidence checks are in [compliance.md](compliance.md).

The package inventories, names, owners, approvals and command outputs in the demo are synthetic. The fixture is a standards-shaped example, not a vendor-issued export. Actual account import compatibility still needs validation with that account's downloaded file.

The rebuild covers the operational review desk, not FOSSA's entire analysis platform. It consumes inventory evidence; it does not scan binaries, detect snippets, resolve dependency trees or supply vulnerability intelligence. Bespoke analysis combines local release history, review expiry, owners and follow-ups. No claim is made that FOSSA cannot produce similar analysis with configuration or exports.
