---
title: "Is This Write a Replacement, a Patch, or an Import?"
description: "PUT, PATCH, and POST express different omission and collection semantics in xRegistry, while import is a workflow built from those operations."
permalink: /blog/is-this-write-a-replacement-a-patch-or-an-import/
series_order: 9
perspective: Write semantics
status: Publication draft
drafted: 2026-08-25
due: 2026-09-14
date: 2026-09-14 16:00:00 +0200
published: false
reading_time: 9 minutes
previous_slug: ids-name-xids-locate-epochs-protect
previous_title: IDs Name, XIDs Locate, Epochs Protect
next_slug: versioning-is-five-separate-questions
next_title: Versioning Is Five Separate Questions
---

A registry write can add one description, replace an entity, create a Version, or copy a set of collections from another registry. Those operations may carry similar JSON, but they do not have the same meaning.

The dangerous case is an omitted attribute. Does omission mean “leave it alone” or “remove it”? The answer depends on the HTTP method and target.

Before sending a write, a client needs to decide whether it is describing a complete new state, a partial change, or a collection operation.

## PUT describes the replacement state

An entity `PUT` creates the entity when it does not exist or replaces its mutable state when it does. Omitted mutable attributes are deleted, subject to required attributes and defaults.

Suppose a Schema Resource has this metadata:

```json
{
  "description": "Boiler temperature payload",
  "labels": {
    "owner": "controls",
    "stage": "production"
  }
}
```

A replacement that omits `description` does not mean “keep the old description.” It asks for a state without that mutable value. The server then applies model rules, including required fields and defaults.

This makes `PUT` suitable when the client has constructed the complete intended representation. It is risky when a user edited only the fields visible on one small form.

## PATCH names the attributes to change

An entity `PATCH` changes the attributes present in the request. Omitted attributes remain unchanged. An explicit `null` asks to delete a mutable attribute when the model permits deletion.

To change only the description, the client can send:

```json
{
  "description": "Temperature readings emitted by production boilers"
}
```

The labels remain as they were because the request did not name them.

Nested objects need care. Including a nested object or map generally supplies its complete replacement value; `PATCH` does not imply an arbitrary recursive merge at every level. Sending only one label inside `labels` can replace the map rather than preserve invisible entries.

The client should read the model and operation rules instead of importing merge-patch assumptions from another API.

## Document bytes are not patch documents

For a Resource type with `hasdocument: true`, the Resource URL addresses domain content. xRegistry does not define byte-level patching of an arbitrary schema, image, archive, or text file.

Metadata updates go through the Resource's `$details` form. A client can patch the description or other mutable registry attributes there without pretending that a JSON patch document can edit Protobuf or binary content.

To change the domain document, the client writes a complete document according to the applicable Resource and Version operation. Creating a new Version is often the right lifecycle choice when content changes.

## POST depends on its target

HTTP folklore often reduces `POST` to “create.” xRegistry uses it more precisely.

Posting to a Resource creates a new Version. That operation does not partially update the Resource:

```text
POST /schemagroups/boilers/schemas/Temperature
```

Posting an entity map to a collection applies complete entity serializations as create-or-update operations. Existing collection members omitted from the request are not deleted merely because they were absent.

Collection `PATCH` is different again: it applies partial updates to the keyed entities named in the map.

The method therefore cannot be interpreted without the target path. `POST` to a Resource and `POST` to a collection are related write mechanisms, not one universal create-only rule.

## One bad child rejects the request

xRegistry HTTP processing is atomic at the request level. If one part of a multi-entity write fails validation, the server rejects the request rather than preserving a partial graph.

Imagine a client posting three Schema Resources. Two are valid. The third lacks a required attribute. A partially applied result would leave the source and target registries disagreeing in a way that is difficult to recover. Atomic failure lets the client correct the set and retry.

Atomicity does not remove concurrency concerns. The client still needs the right Resource or Version epoch when updating observed state.

## Import is a workflow, not another verb

The RC4 HTTP binding does not define a separate `IMPORT` method. Importing registry content means retrieving a suitable document projection and applying it with ordinary writes.

For example, a client can retrieve selected collections:

```text
GET /?collections&inline=schemagroups.*&doc
```

It can then `POST` the resulting `schemagroups` map to a target Registry. The `collections` flag helps focus the document on nested collections rather than Registry attributes.

Imported state may contain values that belong to the source deployment. The `ignore` flag can suppress selected fields such as epochs when the specification permits it. This should be narrow and deliberate. `ignore=*` can discard more identity or lifecycle information than the operator intended.

IDs also remain meaningful during import. Copying content is not permission to invent new identities unless the chosen operation and ignore rules explicitly allow it.

## Choose from intent, not convenience

The safest decision table is short:

| Intent | Operation shape |
| --- | --- |
| Replace one entity's mutable state | Entity `PUT` |
| Change named attributes only | Entity or collection `PATCH` |
| Create a new Resource Version | `POST` to the Resource |
| Create or update complete entities in a collection | Collection `POST` |
| Copy exported collections | Export or document view followed by normal writes |

The payload may look similar across these operations. Omission semantics, target path, nested values, epochs, and atomic validation give each one its meaning.

## Primary sources

- [HTTP binding v1.0-rc4, Creating or Updating Entities](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#creating-or-updating-entities)
- [Core specification v1.0-rc4, Updating Nested Registry Collections](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#updating-nested-registry-collections)
- [Core specification v1.0-rc4, Collections Flag](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#collections-flag)
- [Core specification v1.0-rc4, Ignore Flag](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#ignore-flag)
- [HTTP binding v1.0-rc4, POST Registry](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#post-)