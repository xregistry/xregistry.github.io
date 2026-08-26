---
title: "Where a Schema Version Stops Being the Same Schema"
description: "xRegistry treats compatible revisions as Versions of one Schema Resource and requires a new Resource when a change breaks the selected compatibility contract."
permalink: /blog/where-a-schema-version-stops-being-the-same-schema/
series_order: 12
perspective: Schema evolution
status: Publication draft
drafted: 2026-08-24
date: 2027-01-27
published: false
reading_time: 8 minutes
previous_slug: which-schema-did-this-message-mean
previous_title: Which Schema Did This Message Mean?
next_slug: a-message-definition-is-both-a-template-and-a-filter
next_title: A Message Definition Is Both a Template and a Filter
---

A version number tells you which version came later. It does not tell a producer whether old consumers can read new data or whether both documents still describe the same contract.

xRegistry records these facts in the entity hierarchy. A Schema Resource represents one logical schema. Its Versions are concrete schema documents linked by lineage and, when declared, a compatibility policy. A breaking change starts a new Resource instead of adding another Version.

A Version revises an existing contract. A new Resource changes the contract's identity.

## A Resource identifies the logical schema

The [core specification defines a Resource as an entity holding one or more Versions](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-resource-and-version-entities). One Version is the default and can be reached through the Resource. Every Version remains directly addressable through the Versions collection.

The [Schema Registry specification adds a rule](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/schema/spec.md#221-schema): a Schema Resource groups revisions of the same logical schema. Its Versions must follow its compatibility rules. A breaking change must create a new Schema Resource.

<figure class="article-diagram">
  <img src="/assets/images/blog/schema-resource-families.svg" alt="The com.example.orders Schema Group contains a v1 Resource with Versions 1, 2, and 3, plus a separate v2 Resource with Version 1.">
  <figcaption>Compatible revisions remain Versions of one Resource; a breaking successor starts another Resource.</figcaption>
</figure>

The first three documents revise one contract. The second Resource is its successor because the new schema is not compatible with that contract.

Semantic-version strings in filenames do not record this relationship. The Resource answers “which contract family?” The Version answers “which revision of that family?”

## Compatibility is a declared relationship

The core `compatibility` attribute states the expected relationship among a Resource's Versions.

| Strategy | Relationship |
| --- | --- |
| `backward` | Compatible with the next-oldest Version |
| `backward_transitive` | Compatible with all older Versions |
| `forward` | Compatible with the next-newest Version |
| `forward_transitive` | Compatible with all newer Versions |
| `full` | Both directions with adjacent Versions |
| `full_transitive` | Both directions across all Versions |

The core does not define compatibility for JSON Schema, Protobuf, Avro, XSD, or any other format. Rules for each format define it.

Under the [core compatibility rules](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#compatibility-attribute), absence of `compatibility` means the registry makes no compatibility statement and the server must not perform compatibility checking. Changing the attribute applies the new policy to all Versions and must fail if existing Versions cannot conform.

A successful write does not prove compatibility. The Resource may have no policy, or the implementation may not validate that schema format.

Choose the least strict policy that still protects the consumers, then define its rules for the selected schema format. A policy name is not enough without format rules that can be tested.

## A concrete evolution

Suppose Version `1` of an order schema requires `orderId` and numeric `total`. Version `2` adds optional `currency`:

```json
{
  "schemaid": "com.example.order-created.v1",
  "versionid": "2",
  "ancestorid": "1",
  "format": "JsonSchema/draft-07",
  "schema": {
    "type": "object",
    "properties": {
      "orderId": { "type": "string" },
      "total": { "type": "number" },
      "currency": { "type": "string" }
    },
    "required": ["orderId", "total"]
  }
}
```

Whether this is backward-compatible depends on the applicable JSON Schema rules. If those rules classify it as compatible, xRegistry records the revision under the existing Resource.

Now replace numeric `total` with an object containing `amount` and `currency`. If the applicable policy classifies that as breaking, the document cannot become Version `3` merely because `3` sorts after `2`.

The Schema Registry specification requires a new Resource and [recommends a major-version marker in `schemaid`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/schema/spec.md#42-schema-resources), such as `com.example.order-created.v2`. The old Resource can be marked `deprecated` to direct readers to its successor. Deprecation marks the old Resource for retirement. It does not make the two Resources compatible.

## Lineage is not compatibility

Versions also carry `ancestorid`. The [lineage rules](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#ancestorid-attribute) require a root Version to name itself and later Versions to identify an existing ancestor without forming a cycle.

<figure class="article-diagram">
  <img src="/assets/images/blog/version-lineage.svg" alt="Version 1 branches to Versions 2 and 3, while Version 4 descends from Version 2.">
  <figcaption>Lineage records ancestry and can branch; it does not itself claim compatibility.</figcaption>
</figure>

Lineage says where a Version came from. Compatibility says which operations can work across Versions. A descendant can break a proposed compatibility policy. Validation that depends on history must follow `ancestorid` instead of guessing from lexical or numeric order.

The [schema specification's Protobuf example](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/schema/spec.md#43-schema-formats) records a chain through `ancestorid` while retaining concrete documents under one Schema Resource.

## The default Version is not the whole history

A Resource has a default Version. Reading the Resource document without selecting a Version returns that default. Callers can use it when they want the registry's current choice.

It does not eliminate explicit Version references. Stored data, generated clients, and released artifacts may depend on the exact document used at creation time. The [Schema Registry versioning overview](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/schema/spec.md#13-versioning) notes that several publisher and schema Versions commonly coexist.

Use the Resource reference for the current compatible default. Use a Version reference when work must use one exact document. Moving a default changes what callers receive, but it must not change the meaning of historical data.

Before accepting a schema revision, ask:

1. Which Resource claims it as another iteration of one logical schema?
2. What compatibility policy applies?
3. Does the candidate satisfy that policy along its `ancestorid` path?
4. If yes, will it become the default Version?
5. If no, which Resource ID names the successor?
6. Will the previous Resource be deprecated?

## Primary sources

- **Normative:** [Core specification v1.0-rc4, Resource and Version entities](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-resource-and-version-entities)
- **Normative:** [Core specification v1.0-rc4, `compatibility`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#compatibility-attribute)
- **Normative:** [Core specification v1.0-rc4, `ancestorid`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#ancestorid-attribute)
- **Normative:** [Schema Registry specification v1.0-rc4, Versioning](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/schema/spec.md#13-versioning)
- **Normative:** [Schema Registry specification v1.0-rc4, Schema Resources](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/schema/spec.md#42-schema-resources)