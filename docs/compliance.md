# Licence evidence checks

Checked 31 October 2026. These checks help a reviewer assemble evidence. They do not certify legal compliance, discover every dependency, determine licence compatibility or replace legal advice. A qualified reviewer decides what the actual software distribution requires. The base deliberately blocks unsupported and compound licence expressions.

## Sources and implemented checks

| Source | Relevant requirement | Implemented evidence check | Human review still required |
|---|---|---|---|
| [MIT licence, Open Source Initiative](https://opensource.org/license/mit) | Preserve the copyright and permission notice in copies or substantial portions. | Licence text, copyright evidence and an identified reviewer must be recorded. | Check the complete, correct upstream text is present in the actual distribution. |
| [Apache License 2.0, section 4](https://www.apache.org/licenses/LICENSE-2.0) | Redistribution has licence, change marking, retained attribution and applicable NOTICE conditions. | Requires licence and copyright text, a verified notice status, notice text when present, and a change notice for modified packages. | Determine relevant notices, modifications, distribution form and patent or trademark issues. A short change note does not prove source files were marked. |
| [BSD 3-Clause licence, Open Source Initiative](https://opensource.org/license/bsd-3-clause) | Preserve notices, conditions and disclaimers in the required distribution material. Names cannot imply endorsement without permission. | Licence text, copyright evidence and a dated review are required. | Check source or binary delivery material and endorsement use. The program cannot inspect marketing statements. |
| [SPDX 2.3.1 package information](https://spdx.github.io/spdx-spec/v2.3.1/package-information/) | Package identifiers, names and licence information describe the inventory. NOASSERTION does not mean permission has been granted. | Reject malformed or duplicate package identities. Preserve declared and concluded expressions. NOASSERTION stays unresolved when no usable declaration exists. | Check inventory completeness and file-level evidence. Source declarations are not an independent legal finding. |

The effective expression uses a concluded licence when present and not NOASSERTION, otherwise the declaration. Exact MIT, Apache-2.0 and BSD-3-Clause expressions have evidence checklists. All other expressions, including NONE, unknown identifiers, custom licences, OR, AND and WITH, return MANUAL_LICENSE_REVIEW. They cannot receive an approved review through this base. Add a reviewed rule through /customise, with authoritative sources and meaningful tests, before relying on that licence.

## House policy, not a statute

- Every software product has an owner and a next review date.
- An inventory older than 30 days blocks sign-off. Age is measured from the source document's creation timestamp, not the day it was imported.
- Every component needs a nonexpired, approved review and an evidence reference.
- Every open release follow-up blocks sign-off, even if its due date has not passed.
- A release reviewer must differ from the importer. This is an attribution check, not authentication.
- Review evidence is append-only. Imports cannot be overwritten. A different export requires a new release version.
- A sign-off records the component review fingerprint. A subsequent review invalidates that fingerprint. Expiry, a stale inventory, an overdue project review or an open task blocks current readiness even if the historical sign-off remains.

The 30-day policy is in the release_readiness view in the initial migration. Change it through a new migration, not by editing applied migrations. Review validity dates are set explicitly by the reviewer.

## Interpreting output

REVIEW_NOT_APPROVED covers missing or rejected reviews. REVIEW_EXPIRED_OR_UNDATED is separate. LICENSE_TEXT_MISSING, COPYRIGHT_MISSING, APACHE_NOTICE_UNVERIFIED and CHANGE_NOTICE_MISSING identify missing evidence. EVIDENCE_MISSING requires a reference to the exact upstream files or a documented review. A nonempty field proves that something was recorded, not that it is correct. Read the original evidence.

The distribution field records internal, binary, source or service use. The base uses a conservative common evidence checklist for all four. It does not interpret linking, modification, network use, jurisdiction, patents or copyright ownership. Attribution documents are always drafts, including when current readiness says approved.

## Access and operations

Use a local machine with disk encryption and restricted user access, or a private PostgreSQL connection managed by your administrator. Row-level security is enabled and PUBLIC privileges are revoked. There are no browser roles or anonymous access policies. The CLI needs a trusted database owner connection; that owner can bypass row-level security and alter controls. Actor strings record attribution but do not establish identity, and the audit log is not tamper-proof against the database owner. Add authenticated roles, backups and restore verification before shared use.

Exports, source inventories, licence evidence and drafts can reveal private product details. Keep them out of public version control. Generated files request private filesystem permissions; Windows access also depends on the directory ACL. Nothing in this system sends, hosts or publishes a document. The demo uses fictional packages and synthetic evidence, never real compliance approvals.
