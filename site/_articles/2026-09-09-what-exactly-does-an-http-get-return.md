---
title: "What Exactly Does an HTTP GET Return?"
description: "An xRegistry GET can return registry metadata, a domain document, a collection, a redirect, or a requested projection depending on the target and Resource model."
permalink: /blog/what-exactly-does-an-http-get-return/
series_order: 7
perspective: HTTP representations
status: Publication draft
drafted: 2026-08-25
due: 2026-09-09
date: 2026-09-09 16:00:00 +0200
published: false
reading_time: 8 minutes
previous_slug: how-does-a-client-find-a-registry
previous_title: How Does a Client Find a Registry?
next_slug: running-an-xregistry-server-behind-a-reverse-proxy
next_title: Running an xRegistry Server Behind a Reverse Proxy
---

When a client requests a schema URL, it may need the schema document for validation or the registry record that describes its Versions and lifecycle. Returning one when the caller expects the other is an integration bug waiting to happen. xRegistry's HTTP binding makes that choice explicit for document-bearing Resources.

Suppose a boiler registry contains this Schema Resource:

```text
/schemagroups/boilers/schemas/Temperature
```

A validator wants the JSON Schema bytes. A registry browser wants the Schema's description, Version list, default selection, and references. Those clients should not have to parse one response and guess which part is the document.

## The Resource model controls the basic choice

A Resource type with `hasdocument: true` can carry a domain-specific document in each Version. For that type, the Resource URL addresses the document selected by the Resource's default Version.

```http
GET /schemagroups/boilers/schemas/Temperature
```

The body is the schema document, with its document media type. It is not an xRegistry JSON wrapper around the schema.

The `$details` suffix asks for xRegistry metadata instead:

```http
GET /schemagroups/boilers/schemas/Temperature$details
```

That response can describe the Resource, identify its default Version, expose its Meta and Versions URLs, and carry extension attributes defined by the model.

For a Resource type with `hasdocument: false`, there is no separate domain document. A plain Resource GET returns the Resource's JSON metadata, and `$details` is treated as absent. Endpoint definitions are a useful example: their roles, addresses, and message associations are modeled attributes rather than a second hidden file.

## A Resource GET follows the default

The Resource URL does not permanently identify one set of bytes. It resolves through `defaultversionid`.

If Version `2` is the default today, the Resource GET returns Version `2`'s document. If an administrator later selects Version `3`, the same Resource URL returns Version `3`.

A reproducible consumer should retrieve the concrete Version URL:

```text
/schemagroups/boilers/schemas/Temperature/versions/2
```

The distinction is policy expressed through the URL. A Resource URL means “follow the selected current Version.” A Version URL means “use this exact revision.”

The response may include `Content-Location` to identify the concrete Version selected for a Resource document. That is different from `Location`, which is used for cases such as creation and redirects.

## The document may live elsewhere

A Version can point to externally stored content through its Resource URL attribute. In that case, retrieving the document does not copy the external bytes into the registry response.

The HTTP binding returns `303 See Other`, an empty body, and the external URL in `Location`. The redirect tells the client where the document lives while preserving the registry metadata and identity around it.

This matters for large artifacts, controlled document stores, and content that already has an authoritative location. The registry can catalog the object without becoming its byte store.

A client still needs a redirect and trust policy. Following an external URL may cross an origin, require different credentials, or reach content with a different availability promise.

## Metadata can travel in headers

When the body is reserved for a domain document, selected Resource and default-Version metadata can appear in HTTP headers. `Content-Type` represents the document's `contenttype`. Other scalar metadata can use `xRegistry-*` headers.

This lets a client stream or parse the document while still learning which Version it received. It also keeps the document bytes exact. An empty document remains a zero-length body rather than becoming an empty JSON string inside a wrapper.

No-code and static servers may have limited control over response headers. Clients should not assume that every possible metadata header is present when the document itself is available.

## Collections and owners are different targets

The registry root, a Group, and a collection each answer different questions.

```text
/                                      Registry
/schemagroups/boilers                  one Group
/schemagroups/boilers/schemas          Schema collection
/schemagroups/boilers/schemas/Temperature  one Resource
```

A root GET returns Registry metadata. It normally represents child collections through URLs and counts rather than embedding every descendant. A collection GET returns a map keyed by entity ID. An entity GET returns that entity in the representation appropriate to its model and request.

This separation gives clients a bounded way to navigate. A tool looking for one schema need not download every Group and Resource first.

## Flags change projection, not identity

Supported request flags can change how much content is serialized and in which view. `inline` can include selected child collections. `doc` can request document-view serialization. `binary` affects binary representation. Filters and sorting can shape collection results.

These flags do not create a different registry entity. They request a different projection of the addressed data.

Capabilities remain important. A client must not assume that every deployment supports every flag. A static projection may serve plain entity and document paths but cannot evaluate a dynamic filter.

## Ask what the client needs

Before issuing a GET, a client should answer four questions:

1. Is the target an owner, collection, Resource, Meta entity, or Version?
2. Does the Resource type carry a document?
3. Does the client want the selected default or a pinned Version?
4. Which optional projection flags does the deployment support?

With those answers, the response stops being surprising. The URL selects the entity, the model says whether a document exists, the path form distinguishes content from metadata, and supported flags choose the projection.

## Primary sources

- [HTTP binding v1.0-rc4, Resource Metadata versus Resource Document](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#resource-metadata-vs-resource-document)
- [HTTP binding v1.0-rc4, Serializing Resource Documents](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#serializing-resource-domain-specific-documents)
- [HTTP binding v1.0-rc4, GET Resource](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#get-groupsgidresourcesrid)
- [HTTP binding v1.0-rc4, GET Registry](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#get-)
- [Core specification v1.0-rc4, Resource Metadata versus Resource Document](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#resource-metadata-vs-resource-document)