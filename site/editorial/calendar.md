# xRegistry foundations editorial calendar

The proposed cadence is one article every two weeks. Publication dates remain unset until maintainers approve the series and select a start date.

| Relative slot | Article | Perspective | Dependency | Publication gate |
| --- | --- | --- | --- | --- |
| Week 0 | One Registry, Three Views | Core model | Series introduction | Build, source, narrative, and browser checks pass. |
| Week 2 | Where Does the Metadata End and the Document Begin? | Resources and documents | Registry views | Resource, Meta, Version, and document distinctions checked against Core. |
| Week 4 | The Model Is Part of the Program | Model-driven contracts | Entity hierarchy | Model examples checked against the current model schema. |
| Week 6 | Can This Registry Do What Its Model Describes? | Deployment capabilities | Model semantics | Model and capability claims remain separate. |
| Week 8 | How Does a Client Find a Registry? | Registry discovery | Registry roots | Discovery remains bounded to known hosts, pages, and registries. |
| Week 10 | What Exactly Does an HTTP GET Return? | HTTP representations | Resource documents | `$details`, redirects, headers, and Version selection checked against HTTP. |
| Week 12 | How Much of the Graph Should a Client Read? | Selective graph reads | Collections and links | Inlining is not described as arbitrary reference closure. |
| Week 14 | IDs Name, XIDs Locate, Epochs Protect | Identity and concurrency | Graph traversal | Resource and Version epochs remain distinct. |
| Week 16 | Is This Write a Replacement, a Patch, or an Import? | Write semantics | Identity and epochs | Omission, nested update, and atomicity claims checked against HTTP. |
| Week 18 | Versioning Is Five Separate Questions | Versioning policy | Writes and identity | Five-part framing remains editorial rather than normative terminology. |
| Week 20 | Which Schema Did This Message Mean? | Schema references | Version selection | Resource, Version, URI, XID, and fragment behavior checked together. |
| Week 22 | Where a Schema Version Stops Being the Same Schema | Schema evolution | Versioning and references | Compatibility claims checked against the current Schema spec. |
| Week 24 | A Message Definition Is Both a Template and a Filter | Message contracts | Schema references | Registry filtering and wire-message matching remain distinct. |
| Week 26 | What Does CloudEvents Leave Unsaid? | Layered event contracts | Message definitions | CloudEvents omissions are presented as intentional layering. |
| Week 28 | From Protocol Address to Operational Contract | Endpoint model | Messages and protocols | Runtime caveats remain explicit. |
| Week 30 | Following the Water Boiler Contract Graph | Contract graph | Schema, Message, and Endpoint articles | Pinned sample paths and values rechecked mechanically. |
| Week 32 | Who Tells Tools That the Registry Changed? | Registry change events | Graph mutations | Corrected event text and delivery boundaries rechecked. |
| Week 34 | Export Is a Tooling Boundary | Tooling and provenance | Complete contract graph | Tooling recommendations remain distinct from normative export behavior. |
| Week 36 | Can a Client Traverse a Million-Entry Registry? | Scale and pagination | Selective reads | Pagination remains labeled `0.1-wip`; no scale guarantee is implied. |
| Week 38 | What Survives When HTTP Disappears? | Protocol-independent model | Views and bindings | OPC UA and OpenUSD remain labeled as working drafts. |

## Release workflow

1. Rebase the draft's evidence against the current specification and update the source ledger.
2. Run the six editorial passes recorded in the scorecard.
3. Build the locked Jekyll site and run the repository verification suite.
4. Check the article, index, feed, and adjacent navigation at desktop and mobile widths.
5. Replace `Publication draft` only when publication is approved.
6. Add a publication date only when that date is scheduled.

Drafting dates are provenance for this worktree. They are not publication commitments.