---
title: "What Survives When HTTP Disappears?"
description: "The xRegistry entity model can be projected through another protocol, while HTTP paths, headers, redirects, and status codes are replaced by binding-specific mechanisms."
permalink: /blog/what-survives-when-http-disappears/
series_order: 20
perspective: Protocol-independent model
status: Working-draft analysis
drafted: 2026-08-25
due: 2026-10-09
date: 2026-10-09 16:00:00 +0200
published: false
reading_time: 9 minutes
previous_slug: can-a-client-traverse-a-million-entry-registry
previous_title: Can a Client Traverse a Million-Entry Registry?
---

The first article in this series treated an API, a JSON document, and a static tree as projections of one registry graph. The same separation raises a larger question: what remains when HTTP is not the protocol at all?

xRegistry Core defines Registry, Group, Resource, Meta, Version, model, XID, epoch, default-Version, and document semantics independently of HTTP. A protocol binding maps those concepts to its own addressing and operations.

The repository's OPC UA binding and OpenUSD model are working drafts, not released xRegistry specifications. They are still useful for examining which concepts belong to the model and which belong only to the HTTP binding.

## Identity survives; URL shape does not

An XID identifies an entity relative to a Registry. That relationship can survive in a protocol that does not use HTTP paths.

HTTP adds a `self` URL, collection URLs, `$details`, headers, redirects, and status codes. Those are binding mechanisms. Another protocol can expose the same Registry hierarchy without preserving their literal syntax.

In the OPC UA working draft, a selected Registry root anchors the projection. Nodes expose XIDs and registry attributes. OPC UA NodeIds and browsing locate the nodes within the server's AddressSpace.

The XID remains registry-relative identity. A NodeId is not a replacement global XID, and an OPC UA continuation point is not a stable registry identifier.

## Browsing replaces collection GETs

The draft maps a Registry to a `RegistryType` subtree. Groups appear as `GroupType` folders. Resources and Versions use `ResourceType` file nodes.

An HTTP client retrieves a collection URL. An OPC UA client uses Browse and BrowseNext over the corresponding nodes. Both operations expose membership in the model hierarchy, but their request and continuation mechanics differ.

HTTP pagination links do not survive as strings in OPC UA. Browse continuation points are session-scoped protocol values. A client cannot store one as the identity of a collection or expect to use it outside its OPC UA session.

The collection still exists as a model concept. Only its transport operation changes.

## Read replaces metadata retrieval

HTTP serializes entity attributes into JSON and headers. The OPC UA draft maps registry attributes to properties that clients access with Read.

A generic client still needs the resolved model to understand Group and Resource types, attributes, and constraints. The binding must provide a model-retrieval mechanism, but it does not have to mimic `GET /model` byte for byte.

Epochs, default-Version selection, descriptions, and extension attributes keep their xRegistry meaning. Their OPC UA representation follows the companion information model and binding rules.

## FileTransfer replaces document GETs

For document-bearing Resources, HTTP can return exact document bytes from a Resource or Version URL. The OPC UA draft uses FileTransfer operations such as Open, Read, and Close on Resource file nodes.

The document remains separate from registry metadata. The selected Version still matters. What disappears is the HTTP-specific representation: there is no requirement for `Content-Type`, `Content-Location`, a `303` response, or a `$details` path.

The binding needs equivalent ways to expose content type, external location, and document state where those concepts apply. Equivalent semantics do not require identical wire forms.

## A document view works without a live protocol

The single-document registry view needs no live server. A tool can store it in a file, source repository, package, or object store.

The OPC UA draft describes reconstructing an xRegistry JSON document by browsing the subtree, reading properties, and reading Resource files. An offline tool can then use the same document model that another workflow exported over HTTP.

This is one reason the data model and protocol bindings are separated. Tools can move between live projections and portable documents while preserving hierarchy, identifiers, Versions, and references.

They still need provenance. An exported document should record which endpoint, model, and point in time produced it.

## OpenUSD supplies a domain example

The OpenUSD working draft defines xRegistry Resource types for OpenUSD artifacts. Combined with the OPC UA draft, it provides an industrial scenario:

1. A factory exposes an xRegistry Registry subtree in its OPC UA server.
2. Asset-container Groups organize OpenUSD artifacts.
3. A client resolves an asset through its XID.
4. It reads the selected Version's metadata through OPC UA properties.
5. It reads artifact bytes through FileTransfer.
6. An offline tool exports the subtree as an xRegistry document.

The collection names, identifiers, default-Version selection, and document model can remain recognizable across the projections. HTTP paths and response headers do not.

OpenUSD is a domain model, not another general protocol binding. Both documents are drafts and may change independently before release.

## Protocol independence has a boundary

Separating Core from bindings does not mean every protocol offers identical behavior or performance.

HTTP caching, conditional requests, redirects, media negotiation, and link headers have protocol-specific forms. OPC UA sessions, Browse continuation points, subscriptions, information models, and FileTransfer have their own behavior. A binding has to explain how required xRegistry semantics map and where optional features differ.

Cross-protocol interoperability therefore comes from preserving model meaning, not from pretending that transports are interchangeable.

## The graph is the durable part

When HTTP disappears, the following can remain:

- the Registry, Group, Resource, Meta, and Version hierarchy;
- model-defined attributes and constraints;
- XIDs and typed references;
- Resource and Version epochs;
- default-Version policy;
- the distinction between metadata and documents;
- portable document serialization.

What changes is how a client locates, retrieves, updates, and streams those concepts.

That is the architectural claim demonstrated by the drafts. It is not yet normative production guidance for OPC UA or OpenUSD. The durable center of xRegistry is the metadata graph; each binding gives that graph an operational form.

## Primary sources

- [Core specification v1.0-rc4, Protocol Bindings](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-protocol-bindings)
- [Core specification v1.0-rc4, Registry Views](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-registry-views)
- [Working drafts status](https://github.com/xregistry/spec/blob/99f7a169984aa31a154f983bf29aeb864e594a51/workingdrafts/README.md)
- [OPC UA working draft, Scope](https://github.com/xregistry/spec/blob/5331d12d89dd764e67feedb7ee8e355133587676/workingdrafts/bindings/opcua.md#1-scope)
- [OPC UA working draft, AddressSpace Root and Service Model](https://github.com/xregistry/spec/blob/5331d12d89dd764e67feedb7ee8e355133587676/workingdrafts/bindings/opcua.md#41-addressspace-root-and-service-model)
- [OpenUSD working draft, Relationship to Other xRegistry Specifications](https://github.com/xregistry/spec/blob/5331d12d89dd764e67feedb7ee8e355133587676/workingdrafts/models/openusd/spec.md#12-relationship-to-other-xregistry-specs)