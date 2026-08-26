# xRegistry foundations editorial calendar

The series publishes one article every two weeks. Article 1 is the initial release; each later article remains excluded from the generated site until the scheduled workflow marks it published.

| Date | Article | Perspective |
| --- | --- | --- |
| 2026-08-26 | One Registry, Three Views | Core model |
| 2026-09-09 | Where Does the Metadata End and the Document Begin? | Resources and documents |
| 2026-09-23 | The Model Is Part of the Program | Model-driven contracts |
| 2026-10-07 | Can This Registry Do What Its Model Describes? | Deployment capabilities |
| 2026-10-21 | How Does a Client Find a Registry? | Registry discovery |
| 2026-11-04 | What Exactly Does an HTTP GET Return? | HTTP representations |
| 2026-11-18 | How Much of the Graph Should a Client Read? | Selective graph reads |
| 2026-12-02 | IDs Name, XIDs Locate, Epochs Protect | Identity and concurrency |
| 2026-12-16 | Is This Write a Replacement, a Patch, or an Import? | Write semantics |
| 2026-12-30 | Versioning Is Five Separate Questions | Versioning policy |
| 2027-01-13 | Which Schema Did This Message Mean? | Schema references |
| 2027-01-27 | Where a Schema Version Stops Being the Same Schema | Schema evolution |
| 2027-02-10 | A Message Definition Is Both a Template and a Filter | Message contracts |
| 2027-02-24 | What Does CloudEvents Leave Unsaid? | Layered event contracts |
| 2027-03-10 | From Protocol Address to Operational Contract | Endpoint model |
| 2027-03-24 | Following the Water Boiler Contract Graph | Contract graph |
| 2027-04-07 | Who Tells Tools That the Registry Changed? | Registry change events |
| 2027-04-21 | Export Is a Tooling Boundary | Tooling and provenance |
| 2027-05-05 | Can a Client Traverse a Million-Entry Registry? | Scale and pagination |
| 2027-05-19 | What Survives When HTTP Disappears? | Protocol-independent model |

## Release workflow

1. Rebase the draft's evidence against the current specification and update the source ledger.
2. Run the six editorial passes recorded in the scorecard.
3. Build the locked Jekyll site and run the repository verification suite.
4. Check the article, index, feed, and adjacent navigation at desktop and mobile widths.
5. Keep unreleased articles at `published: false`; the scheduled workflow changes due articles to `published: true`.
6. Let the workflow commit trigger the Pages deployment workflow. Do not edit publication state manually unless correcting the schedule.

Drafting dates remain provenance. The `date` field is the publication schedule and controls the public date shown on the site and in the Atom feed.