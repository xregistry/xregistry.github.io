# xRegistry foundations source ledger

This ledger records the evidence basis for the nine publication drafts. It is an editorial artifact and is excluded from the generated site.

## Evidence rules

- **Normative fact** describes a requirement or definition in a pinned xRegistry specification revision.
- **Observed behavior** describes a named sample or repository implementation at a pinned revision.
- **Editorial judgment** interprets evidence or recommends an engineering practice. It must not be presented as a specification requirement.
- Specification links use commit `d2433a8c726ab096303bd943a4fc6691925f7910` (`v1.0-rc4`).
- Website implementation links use commit `2efb795b0f0bf0cef0effa7b087d079b3c3f0a9e`.

## Article ledger

| # | Article | Central claim | Primary normative evidence | Observed evidence | Review risk |
| --- | --- | --- | --- | --- | --- |
| 1 | One Registry, Three Views | API, document, and static forms project one entity graph. | Core registry views, `doc`, no-code servers; HTTP `GET /export` | Website `tools/buildsite` and generated `xreg/` tree | Do not imply equal capabilities across projections. |
| 2 | Where a Schema Version Stops Being the Same Schema | Compatible revisions remain Versions; breaking changes require a new Schema Resource. | Core Resource/Version, `compatibility`, `ancestorid`; Schema versioning | Pinned Protobuf example | Compatibility meaning remains format-specific. |
| 3 | The Model Is Part of the Program | The model is structured contract data generic tools can inspect. | Core model, attributes, constraints, model retrieval | `sample-model.json` and resolved model | “Executable” means machine-interpretable, not arbitrary code. |
| 4 | A Message Definition Is Both a Template and a Filter | One definition guides production and recognition and links to payload contracts. | Message definitions, metadata, matching, `basemessage`; core filter | None required | Registry filtering and wire matching are different operations. |
| 5 | IDs Name, XIDs Locate, Epochs Protect | IDs, XIDs, and epochs answer local identity, registry location, and state questions. | Core ID, XID, epoch; HTTP update rules | Resolved full-model sample | Epoch is concurrency state, not Resource versioning. |
| 6 | From Protocol Address to Operational Contract | Endpoint roles connect addresses to message contracts without proving runtime health. | Endpoint usage, channel, addresses, authorization, message groups | Sparkplug B scenario | `deployed: true` is metadata, not a health check. |
| 7 | Versioning Is Five Separate Questions | Specification, Resource, Version, default, and compatibility concerns are independent. | Core `specversion`, Resource/Version, `defaultversionid`, compatibility | None required | Avoid treating the five-part framing as normative terminology. |
| 8 | Following the Water Boiler Contract Graph | Explicit references form a traversable endpoint-message-schema graph. | Core model; endpoint, message, and schema extensions | Water Boiler scenario | The sample does not prove messages were exchanged. |
| 9 | Export Is a Tooling Boundary | Export supplies portable graph input; generators remain downstream tools. | Core views, `doc`, no-code servers; HTTP `GET /export` | Water Boiler input; website build script | Generation examples are recommendations, not guarantees. |

## Source maintenance

Before publication, compare the pinned RC4 claims with the then-current specification. Update an article only after recording whether the change is editorial, compatible, or materially changes its thesis. Keep old commit links when they remain the evidence for a historical statement; otherwise move all links for a claim to one reviewed revision.