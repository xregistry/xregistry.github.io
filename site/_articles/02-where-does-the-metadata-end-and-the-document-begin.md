---
title: "Where Does the Metadata End and the Document Begin?"
description: "An xRegistry Resource can identify a logical object, describe its lifecycle, retain concrete Versions, and carry content without mixing those jobs together."
permalink: /blog/where-does-the-metadata-end-and-the-document-begin/
series_order: 2
perspective: Resources and documents
status: Publication draft
drafted: 2026-08-25
due: 2026-08-28
date: 2026-08-28 16:00:00 +0200
published: false
reading_time: 8 minutes
previous_slug: one-registry-three-views
previous_title: One Registry, Three Views
next_slug: the-model-is-part-of-the-program
next_title: The Model Is Part of the Program
---

Someone asks for “the order schema,” but the answer could mean the current JSON file, a specific released revision, or the contract that survives all of its revisions. Those are different things, and a registry must not blur them. xRegistry separates stable identity, lifecycle metadata, concrete Versions, and document content so a tool can ask for exactly what it needs.

## Start with one logical file

The xRegistry core samples include a small document-store model. It defines `dirs` as a Group type and `files` as a Resource type. A directory Groups related files. Each file Resource can have Versions, and those Versions can carry file content.

Suppose a directory contains a file named `safety-policy.json`. The Resource path identifies the logical file:

```text
/dirs/factory-a/files/safety-policy.json
```

That path is useful even after the content changes. A link to the Resource means “this file across its lifecycle,” not “the exact bytes published on Tuesday.”

This distinction appears throughout xRegistry. A Schema Resource represents one evolving schema identity. An Endpoint Resource represents one evolving endpoint identity. Their Versions represent particular states of those objects.

## A Resource has two visible layers

In the [core entity hierarchy](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#registry-entities), a Resource is represented through two related entities:

- The **Resource entity** presents the Resource together with attributes from its default Version.
- The **Resource Meta entity** contains the Resource-level metadata and the collection of Versions.

This is why the API can offer both a convenient current view and the information needed to inspect the full history.

The Resource view is not another stored revision. It is a projection. When the default Version changes, Version-level attributes shown through the Resource view change with it. Resource-level attributes, such as the Resource identity and Resource epoch, belong to Meta.

That gives a client three useful targets:

| Client intent | Entity to use |
| --- | --- |
| Work with the selected current state | Resource |
| Inspect lifecycle metadata or enumerate Versions | Resource Meta |
| Pin one concrete state | Version |

Choosing among them is part of the contract. A tool that needs reproducible input should not silently replace an exact Version with whichever Version is currently the default.

## The document is content, not metadata

A Resource type's [`hasdocument`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/model.md#resourcesstringhasdocument) setting tells clients whether its Versions can carry a document. The document may be JSON, text, a schema language, or binary content. It is separate from the xRegistry attributes that describe the Version.

For a document-bearing Resource, a client may want either:

- the domain document, such as a JSON Schema or Protobuf definition; or
- the xRegistry metadata, such as its Version ID, description, format, epoch, and references.

The HTTP binding provides different retrieval forms for those jobs. A normal Resource or Version retrieval can return the domain document, while metadata-oriented forms expose the xRegistry entity. The exact response also depends on request flags and media negotiation. A client should make its intent explicit instead of assuming that every `GET` returns registry JSON.

For a Resource type with `hasdocument: false`, the Version has attributes but no separate domain document. An endpoint definition is a useful example: its protocol, role, address, and message associations are modeled as attributes. There is no additional endpoint file hidden behind those attributes.

## Defaults are pointers, not copies

A Resource can have several Versions and select one as its default. The default is important because the Resource view projects Version-level values from that selected Version.

Imagine three file Versions:

```text
v1  original policy
v2  adds a review date
v3  draft replacement
```

The Resource can keep `v2` as its default while `v3` is reviewed. A client following the Resource gets the selected current contract. A client following the `v3` Version gets the draft's exact state. A client inspecting Meta can see both and determine which one is the default.

No content has to be duplicated to express this. The default selection controls the projection.

## Resource and Version epochs protect different state

Meta and Version separation also matters during updates. The Resource epoch protects Resource-level state, including changes to the set of Versions and default selection. Each Version has its own epoch for that Version's state.

Updating a description on one Version is not the same operation as changing which Version is the default. A client that remembers only one generic revision token loses that distinction.

This becomes especially important for tools that read, edit, and write registry content. They need to send the epoch for the entity they intend to change, not whichever epoch happened to appear nearby in a larger response.

## References reveal the intended stability

Other registry entities can refer to either a Resource or a Version. The choice communicates update policy.

A reference to a Resource follows its default Version. That is useful when the owner wants consumers to track the selected current contract. A reference to a Version pins one exact state. That is useful for reproducible generation, audit records, or contracts that must not move when a default changes.

Neither choice is universally correct. The important point is that the graph records the choice instead of hiding it in prose.

## One object, four responsibilities

The layers are easier to remember when each has one job:

| Layer | Responsibility |
| --- | --- |
| Resource | Stable identity and convenient default-Version projection |
| Meta | Resource-level state, Version collection, and default selection |
| Version | One concrete revision and its Version-level metadata |
| Document | The domain content carried by a document-bearing Version |

This separation is not extra ceremony. It lets a client ask whether it wants an identity, lifecycle information, a concrete revision, or the content itself.

The next time a registry URL appears to identify “a schema” or “a file,” the useful question is more precise: does the client need the logical Resource, its Meta entity, an exact Version, or the Version's document?

## Primary sources

- **Normative:** [Core specification v1.0-rc4, Registry Entities](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#registry-entities)
- **Normative:** [Core specification v1.0-rc4, Resources and Resource Meta](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#resources)
- **Normative:** [Core model specification v1.0-rc4, `hasdocument`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/model.md#resourcesstringhasdocument)
- **Normative:** [HTTP binding v1.0-rc4, Retrieving Resources](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#retrieving-resources)
- **Observed:** [Core document-store sample at the pinned revision](https://github.com/xregistry/spec/tree/d2433a8c726ab096303bd943a4fc6691925f7910/core/samples)