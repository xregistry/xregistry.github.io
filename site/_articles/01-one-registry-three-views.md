---
title: "One Registry, Three Views"
description: "xRegistry keeps one metadata graph usable as an API, a portable document, and a static file tree by treating representation as a projection choice."
permalink: /blog/one-registry-three-views/
series_order: 1
perspective: Core model
status: Publication draft
drafted: 2026-08-24
due: 2026-08-26
date: 2026-08-26 16:00:00 +0200
published: true
reading_time: 7 minutes
next_slug: where-a-schema-version-stops-being-the-same-schema
next_title: Where a Schema Version Stops Being the Same Schema
---

A registry does not need to live only behind a running service to be useful.
The practical workflow is straightforward: developers build the metadata that
goes with their modules as part of the codebase: schemas, event definitions,
abstract endpoint definitions, and other contract data, all already organized
in document-form registries. Local tooling works against those copies directly.

When a module is deployed, that metadata is published into the registry so that
other developers, coding agents, modules, and systems can find and use it.

xRegistry is built for this workflow: the API, the document, and the file tree
are projections of one registry model.

That shared registry can be a service that implements the full
xRegistry API, or a read-only static file server that is organized by the
xRegistry structural conventions. This makes it simple and inexpensive to
publish a complete metadata model alongside any service.

The registry is the entity graph. An HTTP API, one JSON document, and a
directory of JSON files are three views of that graph.

Protocol bindings are separate from the core specification. HTTP is the initial
default binding, but the model is not tied to HTTP. The same registry can be
projected through another protocol. A proposal already exists for a native
binding for the industrial OPC UA protocol.

## Three projections, one hierarchy

The [core specification defines three registry views](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-registry-views):

1. A **single-document view** can inline nested entities for local tools or document storage.
2. An **API view** exposes entities through separate reads and links that clients can follow.
3. A **multiple-document view** stores entities independently while removing duplicated information.

Each view keeps the same hierarchy. A registry contains Group collections. Each Group contains Resource collections. A Resource contains one or more Versions. The projection decides which children are inlined, which URLs are relative, and whether default-Version fields are duplicated. All three views use the same metadata model.

Consider a Schema Resource at this xRegistry identifier:

```text
/schemagroups/com.example.telemetry/schemas/reading
```

In an API response, its `self` value is an absolute retrieval URL. In a document that contains the entity, `self` becomes a JSON Pointer such as `#/schemagroups/com.example.telemetry/schemas/reading`. The [normative `self` rules](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#self-attribute) make that difference explicit.

The form of the reference tells a tool where to find the target. A relative reference points to content in the same document. An absolute reference tells an API client where to retrieve it.

## Projection is separate from capability

A server does not need to support every CRUD operation to implement xRegistry.

The [no-code server design](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-no-code-servers) makes many operations and advanced flags optional. A read-only static host can expose useful registry content without supporting filtering, inlining, or writes. Clients can read the registry's capabilities instead of guessing from its URLs.

These are separate questions:

| Question | Where the answer lives |
| --- | --- |
| What entity types exist? | The registry model |
| How are entities related? | The Group, Resource, Version hierarchy and typed references |
| How is this response projected? | Document, API, or multiple-document view rules |
| Which operations are available here? | The advertised capabilities |

A static mirror and a mutable service can carry the same kinds of metadata while offering different operations. xRegistry-shaped URLs alone do not promise write support, filtering, or server-side validation.

## The repository shows the static case

This website uses the static approach. Its generated [`xreg/`](https://github.com/xregistry/xregistry.github.io/tree/2efb795b0f0bf0cef0effa7b087d079b3c3f0a9e/xreg) tree serves specification content in an API-shaped directory. A schema document can sit beside its `$details` metadata and collection indexes. The site's [`tools/buildsite`](https://github.com/xregistry/xregistry.github.io/blob/2efb795b0f0bf0cef0effa7b087d079b3c3f0a9e/tools/buildsite) script generates that tree with the reference server and publishes the result as files.

The build script is an implementation example, not a specification requirement. It clones the specification repository's current default branch, but the generated tree does not record which commit it used. A production export pipeline can make builds repeatable by pinning and recording that commit.

## From files to a service and back

The [HTTP binding's `GET /export` operation](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#get-export) provides a document projection of the registry. The core specification also designs document-view responses so they can be used in requests. Together, those rules support a practical loop:

<figure class="article-diagram">
  <img src="/assets/images/blog/metadata-lifecycle.svg" alt="Five-stage metadata lifecycle: author metadata in files, review it with code, load it into a registry, discover or update it through an API, and export a portable document.">
  <figcaption>The same metadata moves through authoring, review, service publication, API use, and portable export.</figcaption>
</figure>

Each stage can use the view that fits its work. A project can keep reviewable metadata beside its source code, publish it for runtime discovery, and export it for another tool without translating between unrelated formats.

Tools must preserve identifiers, hierarchy, default-Version meaning, and references as they move between views. A file with similar fields is not automatically an xRegistry document.

## What to carry forward

xRegistry can publish the same contract through different deployment forms. The next question is when a contract needs a new identity. Compatible schema revisions can remain Versions of one Resource. A breaking change starts a new Resource.

## Primary sources

- **Normative:** [Core specification v1.0-rc4, Registry Views](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-registry-views)
- **Normative:** [Core specification v1.0-rc4, No-Code Servers](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-no-code-servers)
- **Normative:** [Core specification v1.0-rc4, Doc Flag](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#doc-flag)
- **Normative:** [HTTP binding v1.0-rc4, GET /export](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#get-export)
- **Observed:** [xRegistry website build script at `2efb795b`](https://github.com/xregistry/xregistry.github.io/blob/2efb795b0f0bf0cef0effa7b087d079b3c3f0a9e/tools/buildsite)