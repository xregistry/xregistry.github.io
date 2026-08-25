---
title: "Can a Client Traverse a Million-Entry Registry?"
description: "Large collection traversal needs bounded requests and opaque continuation links, but the current xRegistry pagination design remains a 0.1 working draft."
permalink: /blog/can-a-client-traverse-a-million-entry-registry/
series_order: 19
perspective: Scale and pagination
status: Working-draft analysis
drafted: 2026-08-25
reading_time: 8 minutes
previous_slug: export-is-a-tooling-boundary
previous_title: Export Is a Tooling Boundary
next_slug: what-survives-when-http-disappears
next_title: What Survives When HTTP Disappears?
---

A million-entry registry is not useful if every client must retrieve one enormous document before it can inspect a collection.

xRegistry Core already separates owners from collections and rejects oversized inline responses instead of silently truncating entities. The separate pagination specification explores how clients can traverse large collections in bounded pages.

That pagination work is currently version `0.1-wip`. This article examines the draft. It does not present pagination as settled Core 1.0 behavior or make a million-entry performance guarantee.

## Retrieve the collection, not its owner

Suppose one Schema Group contains one million Schema Resources:

```text
/schemagroups/telemetry/schemas
```

That URL addresses the Schema collection directly. A client should retrieve it rather than asking for the Schema Group with every Schema inlined.

The distinction matters because pagination applies to collection requests. It does not split an owning Registry, Group, or Resource response merely because that response contains a large inlined collection.

If an inline request is too large, the server reports `too_large`. The client can then move to the child collection endpoint and use the scale behavior available there.

## A limit bounds records, not bytes

The pagination working draft defines `limit` as a positive unsigned 64-bit maximum record count:

```text
GET /schemagroups/telemetry/schemas?limit=500
```

The limit does not promise a fixed number of bytes. One Schema Resource may have a short description while another contains large inlined children. Every returned entity and requested child still has to be complete.

A server may paginate a collection even when the client did not request a limit. Conversely, if the client requests a limit the server cannot honor, the draft requires an error rather than quietly substituting a different contract.

Clients therefore need both record and byte budgets. A page of 500 metadata-only Resources may be small. A page of 500 Resources with documents inlined may be much larger.

## Follow the link without editing it

When more records remain, the draft requires a `rel=next` link. When no records remain, that link is absent.

The continuation URI-reference is opaque. A client should follow it exactly rather than extracting an offset, changing the limit, or reconstructing a URL from assumptions about token syntax.

This lets a server use offsets, cursors, signed tokens, or stored result-set identifiers without exposing those choices as client contracts.

A basic traversal loop is simple:

1. Request the collection with an acceptable limit.
2. Process the complete entities in the returned map.
3. Read the supplied `rel=next` link.
4. Follow it unchanged.
5. Stop when no next link is present.

The complexity lies around changes, expiry, retries, and consumer checkpoints.

## Pagination is not snapshot isolation

The working draft does not guarantee that all pages form a stable snapshot while other clients write to the collection.

If a Schema is inserted, removed, or renamed during traversal, a client may need to restart or reconcile. A `count`, when supplied, describes the complete result set and can help detect change, but the count is strongly recommended rather than mandatory.

An expiry value can bound how long a result set remains available. When no expiry is present, availability remains undefined. A client cannot assume that a continuation link will work forever.

For a one-time report, restarting may be enough. For migration or code generation, the client may need a deployment-specific snapshot mechanism, a captured export, or a reconciliation pass over processed XIDs.

## Filtering and sorting shape the traversal

A million-entry collection becomes more manageable when the client can select one domain and traverse it in a stable order. Filtering and sorting are optional capabilities, so the client must check support.

Even with sorting, concurrent updates can change the effective result set. Stable ordering makes processing predictable; it does not create transaction isolation.

A practical bulk client can record:

- the Registry root and model epoch;
- the original request and filters;
- each processed entity XID;
- continuation links and any expiry;
- counts observed during traversal;
- failures and retry decisions.

This record supports reconciliation without treating continuation tokens as durable entity identifiers.

## Large clients should degrade deliberately

An interactive registry browser should not issue `inline=*` against a large root and hope for the best. It can show collection counts, require a filter, and retrieve pages as the user navigates.

A generator can reject an unbounded run until the user selects a Group or provides an explicit bulk mode. A migration tool can checkpoint XIDs and compare source and target counts after completion.

These are client policies built around the specification. They do not change the server's obligation to return complete entities or explicit errors.

## The honest answer is conditional

Can a client traverse a million-entry registry? The architecture provides the right boundaries: independent collection endpoints, bounded retrieval, complete entities, and explicit oversized-response errors. The pagination draft adds opaque continuation links for iterative collection access.

Actual scale depends on the implementation, deployment limits, document sizes, filters, change rate, and the final pagination specification. Until the draft matures and implementations demonstrate the workload, “one million” is a design scenario rather than a conformance promise.

## Primary sources

- [HTTP binding v1.0-rc4, Pagination](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#pagination)
- [Core specification v1.0-rc4, Data Retrieval Issues](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-data-retrieval-issues)
- [Core specification v1.0-rc4, Inline size failure](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#inline-flag)
- [Pagination 0.1-wip, Client Request](https://github.com/xregistry/spec/blob/3958712081589ee5058975aba4a6d09892c14184/pagination/spec.md#client-request)
- [Pagination 0.1-wip, Iterating over the Record Set](https://github.com/xregistry/spec/blob/3958712081589ee5058975aba4a6d09892c14184/pagination/spec.md#iterating-over-the-record-set)