---
title: "How Much of the Graph Should a Client Read?"
description: "Filtering, collection traversal, and selective inlining let xRegistry clients retrieve useful context without treating every operation as a full export."
permalink: /blog/how-much-of-the-graph-should-a-client-read/
series_order: 7
perspective: Selective graph reads
status: Publication draft
drafted: 2026-08-25
reading_time: 8 minutes
previous_slug: what-exactly-does-an-http-get-return
previous_title: What Exactly Does an HTTP GET Return?
next_slug: ids-name-xids-locate-epochs-protect
next_title: IDs Name, XIDs Locate, Epochs Protect
---

A registry is useful because its entities are connected. That does not mean every client should retrieve the whole registry before doing one job.

A deployment tool may need one Endpoint, its Message Group, one Message Definition, and a payload schema. A documentation generator may need every contract in one product domain. An archive job may need the complete registry.

Those are three different read policies. xRegistry gives clients collection URLs, filters, and inlining so they can request the context their task needs.

## Start from the narrowest useful entity

The API view represents collections and entities with links. A client can begin at a known Endpoint or Schema Resource and walk outward instead of downloading the Registry root with every child inlined.

For a Water Boiler integration, a client can:

1. Retrieve the producer Endpoint.
2. Read the Message Group reference associated with it.
3. Retrieve that Group's Messages collection.
4. Select the matching Message Definition.
5. Resolve its payload schema reference.

The client has read one contract path. It has not loaded unrelated endpoints, every message in the registry, or all Versions of every schema.

This is normal API traversal, not a special graph query language. The model and entity links tell the client which paths and references exist.

## Inlining expands containment

The `inline` flag lets a client ask the server to include selected descendants in one response. Its paths follow the model hierarchy. A request can name a path such as:

```text
messagegroups.messages.versions
```

The response includes the parents needed to contain those Versions. It does not include unrelated Group types or sibling collections unless requested.

`inline=*` is broad. It includes nested collections and documents, subject to the operation and server limits. It does not automatically include root-level `model`, `modelsource`, or `capabilities` unless they are named.

More importantly, inlining follows modeled containment. It is not arbitrary reference closure. A Message's `dataschemauri`, an Endpoint's Message Group association, or an external URI may still require another retrieval. A client that wants to follow those edges needs its own depth, cycle, origin, and trust rules.

## Filtering selects before expansion

Filtering and inlining solve different problems.

A filter selects matching branches or entities. Inlining controls which descendants of the selected result are serialized. A client can first select Messages for one protocol or domain and then inline their Versions.

Without that distinction, a request can become much larger than intended. “Find the telemetry Messages” is not the same as “return every Message and let the client discard most of them.” “Inline their Versions” is not the same as “follow every schema and endpoint reference reachable from them.”

Filtering is an optional capability. Clients should inspect deployment capabilities and retain a bounded fallback, such as reading one collection and filtering locally when its size is acceptable.

## Complete entities matter

xRegistry does not permit a server to solve an oversized entity response by silently cutting off attributes or requested children. If the server cannot return a requested inline result because it is too large, it must report `too_large`.

That failure is useful. A partial entity can look valid while hiding the exact child or attribute the client needed. An explicit error lets the client narrow the request or move to a collection endpoint.

Pagination applies to collection retrieval, not to an owning entity merely because the response inlines a large child collection. If a Group with all Resources inlined is too large, the client should retrieve the Resource collection directly and use the collection's scale mechanisms.

## Counts and URLs support planning

API-view responses can expose collection URLs and counts. These values help a client choose a strategy before requesting the contents.

A registry browser might inline a collection containing eight Resources but switch to a paged collection view for eighty thousand. A code generator might refuse an unbounded run unless the user chooses a Group. An interactive search tool might require server-side filtering above a configured threshold.

A count is a planning hint, not proof that one request can return everything. Documents vary in size, nested content may expand the result, and the deployment may enforce response limits.

## Put a budget around reference traversal

Once a client follows references beyond containment, it owns more policy. A robust graph reader can set limits for:

- maximum entities;
- maximum bytes;
- maximum reference depth;
- permitted registry roots and external origins;
- repeated XIDs and cycles;
- total elapsed time.

These limits are not replacements for correct registry semantics. They are protections around a potentially open graph. A schema can refer to another schema, a Message can refer to a schema object, and registries can advertise related registries. “Follow everything” is not a safe default.

## Match the read to the job

An interactive client usually wants a small, current path. A generator wants a closed and reproducible input set. An export or backup process may intentionally retrieve the complete document view.

The practical sequence is:

1. Start with the narrowest entity or collection that represents the task.
2. Filter where the server supports it and the selection is meaningful.
3. Inline only containment paths that save useful round trips.
4. Follow explicit references under a separate traversal budget.
5. Move large child reads to their collection endpoints.
6. Treat `too_large` as a request to narrow the projection, not as permission to accept truncation.

The graph is there to be traversed. Good clients decide how far before they begin.

## Primary sources

- [Core specification v1.0-rc4, API View](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#api-view)
- [Core specification v1.0-rc4, Inline Flag](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#inline-flag)
- [Core specification v1.0-rc4, Filter Flag](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#filter-flag)
- [Core specification v1.0-rc4, Data Retrieval Issues](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-data-retrieval-issues)
- [HTTP binding v1.0-rc4, Pagination](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#pagination)