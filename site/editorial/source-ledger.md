# xRegistry foundations source ledger

This ledger records the evidence basis for the 20 article drafts. It is an editorial artifact and is excluded from the generated site.

## Evidence rules

- **Normative fact** describes a requirement or definition in a pinned xRegistry specification revision.
- **Observed behavior** describes a named sample or repository implementation at a pinned revision.
- **Editorial judgment** interprets evidence or recommends an engineering practice. It must not be presented as a specification requirement.
- Specification links use commit `d2433a8c726ab096303bd943a4fc6691925f7910` (`v1.0-rc4`).
- Corrected registry-event links use commit `015095e7090e2e2f646db36a18d9183ecae4506c`.
- Pagination links use working-draft commit `3958712081589ee5058975aba4a6d09892c14184`.
- OPC UA and OpenUSD links use working-draft commit `5331d12d89dd764e67feedb7ee8e355133587676`.
- Website implementation links use commit `2efb795b0f0bf0cef0effa7b087d079b3c3f0a9e`.

## Article ledger

| # | Article | Central claim | Primary normative evidence | Observed evidence | Review risk |
| --- | --- | --- | --- | --- | --- |
| 1 | One Registry, Three Views | API, document, and static forms project one entity graph. | Core registry views, `doc`, no-code servers; HTTP `GET /export` | Website `tools/buildsite` and generated `xreg/` tree | Do not imply equal capabilities across projections. |
| 2 | Where Does the Metadata End and the Document Begin? | Resource identity, Meta state, concrete Versions, and documents have separate jobs. | Core entities, Resource metadata, `hasdocument`; HTTP Resource retrieval | Core document-store sample | Keep Resource and Version epochs distinct. |
| 3 | The Model Is Part of the Program | The model is structured contract data generic tools can inspect. | Core model, attributes, constraints, model retrieval | `sample-model.json` and resolved model | “Executable” means machine-interpretable, not arbitrary code. |
| 4 | Can This Registry Do What Its Model Describes? | Model semantics and deployment capabilities answer different questions. | Core no-code servers and validation controls; HTTP capabilities | Static website and mutable server contrast | Capability does not grant caller authorization. |
| 5 | How Does a Client Find a Registry? | Discovery returns candidate roots from an already-known web context. | Core and HTTP host, registry, webpage, and root-header discovery | Boiler documentation scenario | Do not imply global discovery or trust. |
| 6 | What Exactly Does an HTTP GET Return? | Target, Resource model, and flags determine whether GET returns metadata, documents, collections, or redirects. | HTTP Resource document serialization and GET operations | Temperature Schema scenario | Keep `Location` and `Content-Location` distinct. |
| 7 | How Much of the Graph Should a Client Read? | Clients can combine collection traversal, filtering, and selective inlining. | Core API view, `inline`, `filter`, and retrieval limits | Water Boiler traversal | Inlining follows containment, not arbitrary references. |
| 8 | IDs Name, XIDs Locate, Epochs Protect | IDs, XIDs, and epochs answer local identity, registry location, and state questions. | Core ID, XID, epoch; HTTP update rules | Resolved full-model sample | Epoch is concurrency state, not Resource versioning. |
| 9 | Is This Write a Replacement, a Patch, or an Import? | Methods and targets define omission and collection semantics; import uses ordinary writes. | HTTP writes; Core nested collections, `collections`, and `ignore` | Schema collection copy | Do not describe `POST` as create-only or import as a separate verb. |
| 10 | Versioning Is Five Separate Questions | Specification, Resource, Version, default, and compatibility concerns are independent. | Core `specversion`, Resource/Version, `defaultversionid`, compatibility | None required | Avoid treating the five-part framing as normative terminology. |
| 11 | Which Schema Did This Message Mean? | Schema reference shape records resolution and update policy. | Message `dataschema`, `dataschemauri`, `dataschemaxid`; Schema formats | Water Boiler scenario | Format, payload content type, and fragments remain separate. |
| 12 | Where a Schema Version Stops Being the Same Schema | Compatible revisions remain Versions; breaking changes require a new Schema Resource. | Core Resource/Version, `compatibility`, `ancestorid`; Schema versioning | Pinned Protobuf example | Compatibility meaning remains format-specific. |
| 13 | A Message Definition Is Both a Template and a Filter | One definition guides production and recognition and links to payload contracts. | Message definitions, metadata, matching, `basemessage`; Core filter | None required | Registry filtering and wire matching are different operations. |
| 14 | What Does CloudEvents Leave Unsaid? | CloudEvents, Message, Schema, and Endpoint metadata form intentional layers. | CloudEvents context; xRegistry CloudEvents, Message, and Endpoint specs | Water Boiler and Wind Generator scenarios | Do not present layering as a CloudEvents defect. |
| 15 | From Protocol Address to Operational Contract | Endpoint roles connect addresses to message contracts without proving runtime health. | Endpoint usage, channel, addresses, authorization, message groups | Sparkplug B scenario | `deployed: true` is metadata, not a health check. |
| 16 | Following the Water Boiler Contract Graph | Explicit references form a traversable endpoint-message-schema graph. | Core model; Endpoint, Message, and Schema extensions | Water Boiler scenario | The sample does not prove messages were exchanged. |
| 17 | Who Tells Tools That the Registry Changed? | Change events describe graph mutations but not their delivery system. | Core event design; corrected Events document | Version creation interaction | Do not promise subscriptions, ordering, or exactly-once delivery. |
| 18 | Export Is a Tooling Boundary | Export supplies portable graph input; generators remain downstream tools. | Core views, `doc`, no-code servers; HTTP `GET /export` | Water Boiler input; website build script | Generation examples are recommendations, not guarantees. |
| 19 | Can a Client Traverse a Million-Entry Registry? | Collection boundaries and draft pagination support bounded traversal. | Core retrieval limits; HTTP pagination; Pagination `0.1-wip` | Million-Schema scenario | No snapshot or million-entry performance guarantee. |
| 20 | What Survives When HTTP Disappears? | Core model semantics can survive another binding while HTTP mechanics change. | Core protocol bindings and views; OPC UA and OpenUSD working drafts | Factory OpenUSD registry scenario | Working drafts are architectural evidence, not released guidance. |

## Source maintenance

Before publication, compare the pinned RC4 claims with the then-current specification. Update an article only after recording whether the change is editorial, compatible, or materially changes its thesis. Keep old commit links when they remain the evidence for a historical statement; otherwise move all links for a claim to one reviewed revision.