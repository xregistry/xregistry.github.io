# xRegistry foundations editorial calendar

The series publishes each Monday, Wednesday, and Friday at 16:00 Central European time. Article 1 is the initial release; each later article remains excluded from the generated site until the scheduled workflow marks it published.

| Date | Article | Perspective |
| --- | --- | --- |
| 2026-08-26 | One Registry, Three Views | Core model |
| 2026-08-28 | Where Does the Metadata End and the Document Begin? | Resources and documents |
| 2026-08-31 | The Model Is Part of the Program | Model-driven contracts |
| 2026-09-02 | Can This Registry Do What Its Model Describes? | Deployment capabilities |
| 2026-09-04 | How Does a Client Find a Registry? | Registry discovery |
| 2026-09-07 | What Exactly Does an HTTP GET Return? | HTTP representations |
| 2026-09-09 | How Much of the Graph Should a Client Read? | Selective graph reads |
| 2026-09-11 | IDs Name, XIDs Locate, Epochs Protect | Identity and concurrency |
| 2026-09-14 | Is This Write a Replacement, a Patch, or an Import? | Write semantics |
| 2026-09-16 | Versioning Is Five Separate Questions | Versioning policy |
| 2026-09-18 | Which Schema Did This Message Mean? | Schema references |
| 2026-09-21 | Where a Schema Version Stops Being the Same Schema | Schema evolution |
| 2026-09-23 | A Message Definition Is Both a Template and a Filter | Message contracts |
| 2026-09-25 | What Does CloudEvents Leave Unsaid? | Layered event contracts |
| 2026-09-28 | From Protocol Address to Operational Contract | Endpoint model |
| 2026-09-30 | Following the Water Boiler Contract Graph | Contract graph |
| 2026-10-02 | Who Tells Tools That the Registry Changed? | Registry change events |
| 2026-10-05 | Export Is a Tooling Boundary | Tooling and provenance |
| 2026-10-07 | Can a Client Traverse a Million-Entry Registry? | Scale and pagination |
| 2026-10-09 | What Survives When HTTP Disappears? | Protocol-independent model |

## Release workflow

1. Rebase the draft's evidence against the current specification and update the source ledger.
2. Run the six editorial passes recorded in the scorecard.
3. Build the locked Jekyll site and run the repository verification suite.
4. Check the article, index, feed, and adjacent navigation at desktop and mobile widths.
5. Keep unreleased articles at `published: false`; the scheduled workflow changes due articles to `published: true`.
6. Let the workflow commit trigger the Pages deployment workflow. Do not edit publication state manually unless correcting the schedule.

Drafting dates remain provenance. Each article's `due` field is the authoritative publication schedule. Its `date` field mirrors that day with the 16:00 Europe/Berlin publication timestamp required by Jekyll metadata and the Atom feed; the publishing script rejects mismatches.