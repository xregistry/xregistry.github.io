---
title: "Versioning Is Five Separate Questions"
description: "xRegistry separates specification version, Resource identity, Version identity, default selection, and compatibility policy instead of hiding them behind one version string."
permalink: /blog/versioning-is-five-separate-questions/
series_order: 14
perspective: Versioning policy
status: Publication draft
drafted: 2026-08-24
due: 2026-09-25
date: 2026-09-25 16:00:00 +0200
published: false
reading_time: 9 minutes
previous_slug: what-does-the-xregistry-cli-add-to-the-api
previous_title: What Does the xRegistry CLI Add to the API?
next_slug: which-schema-did-this-message-mean
next_title: Which Schema Did This Message Mean?
---

“Use version 2” is not enough instruction for a system that manages contracts. It could mean the xRegistry specification version, a logical contract family, one exact document, the currently selected default, or a compatibility promise. xRegistry keeps those answers separate, which lets a team change a contract without losing track of what actually changed.

## The five questions

| Question | xRegistry mechanism | What it controls |
| --- | --- | --- |
| Which specification shapes this document? | `specversion` | Interpretation of xRegistry semantics |
| Which logical contract is this? | Resource ID and XID | Stable contract identity |
| Which concrete revision is this? | `versionid` and `ancestorid` | Addressable document and lineage |
| Which revision is selected by default? | `defaultversionid` | Indirect Resource reads |
| What changes remain within this contract? | `compatibility`, plus lifecycle metadata | Evolution policy |

Combining any two answers creates ambiguity. A new xRegistry specification release does not require new schema Resource IDs. Moving a default does not create a Version. A larger `versionid` does not prove compatibility.

## 1. Which specification shapes the document?

The [`specversion` attribute](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#specversion-attribute) identifies the xRegistry Core specification version used by a Registry. Its value is not the version of any registered schema, message, or endpoint.

This value tells registry producers and consumers which format and core rules apply to entities, attributes, and views.

```json
{
  "specversion": "1.0-rc4",
  "registryid": "commerce-contracts"
}
```

Use `specversion` as a protocol-version selector, not as a content release number. Test interoperability when it changes. The change does not require new identities for every stored contract.

## 2. Which logical contract is this?

A Resource identifies a logical contract across concrete revisions. For example, a Schema Resource can represent `com.example.order-created.v1`, while a Message Resource can represent one recognizable wire message.

Resource IDs are scoped to their parent Group, while the server-generated [`xid`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#xid-attribute) identifies an entity across the Registry. Resource identity remains distinct from Version identity.

The extension specifications can narrow when identity must change. The Schema Registry requires breaking schema changes to create a new Resource. The Message Registry recommends a new message definition when metadata changes the on-wire message.

Resource identity says which revisions callers can treat as one contract family. Lexical sorting and build numbers cannot make that decision.

## 3. Which concrete revision is this?

Each Resource contains one or more Versions. A [`versionid`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#versionid-attribute) identifies a concrete Version within its Resource. `ancestorid` records lineage and allows branches without cycles.

```text
/schemagroups/orders/schemas/order-created/versions/1
/schemagroups/orders/schemas/order-created/versions/2
```

These URLs address documents directly. The identifiers need not be semantic versions, and their order does not establish ancestry. `ancestorid` records the ancestry.

Pin a Version when an artifact must be reproducible: generated code, validation bundles, retained event data, or release evidence. A direct Version reference answers “exactly which document?” even after defaults move.

## 4. Which revision is selected by default?

A Resource has a [`defaultversionid`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#defaultversionid-attribute). In API metadata view without the `doc` flag, Resource serialization includes attributes from the default Version. Document view removes that duplicated information. For a Resource that carries a document, reading the Resource document without a Version path selects the default Version.

Default selection is an indirection:

<figure class="article-diagram">
  <img src="/assets/images/blog/default-version-resolution.svg" alt="The order-created Schema Resource resolves through defaultversionid 2 to Version 2.">
  <figcaption>A Resource's default pointer selects a Version without changing the identity or lineage of any Version.</figcaption>
</figure>

Moving the pointer changes what an indirect read returns. It does not rename Version `1`, alter its lineage, or create Version `3`.

Defaults work for “current approved revision” workflows. They do not record which Version a build used. Build systems may resolve a default during development. Released outputs must record the concrete Version they consumed when reproducibility is required.

## 5. What changes remain within this contract?

The [`compatibility` attribute](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#compatibility-attribute) states an expected relationship among a Resource's Versions. Core defines directional and transitive strategies but leaves format-specific comparison rules to the relevant domain. If the attribute is absent, the registry makes no compatibility claim.

Lifecycle is related but separate. [`deprecated`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#deprecated-attribute) can tell consumers that an entity should no longer be selected for new use. It does not erase the entity or make a successor compatible.

Compatibility answers “Can these revisions remain one logical contract under this policy?” Deprecation answers “Do new callers keep choosing this entity?”

A review must record both decisions. First decide whether the candidate belongs inside the Resource. Then decide whether it becomes the default and whether an older Resource or Version becomes deprecated. Each decision has its own field in the model.

## One change, five answers

Suppose a team adds an optional field to a JSON Schema and its declared rules classify the change as backward-compatible.

1. `specversion` remains `1.0-rc4` because xRegistry semantics did not change.
2. The Schema Resource ID remains stable because this is the same logical contract.
3. A new Version receives its own `versionid` and points to its ancestor.
4. Reviewers decide separately whether `defaultversionid` moves to it.
5. The compatibility policy justifies keeping the revision inside the Resource.

Now suppose a required field changes type and the policy classifies it as breaking. Questions 1 and 3 still have answers, but question 2 changes: the document starts a new Resource. Its first Version can be `1`. The new Resource ID records the contract change instead of placing all meaning in a major Version number.

## A practical review matrix

Before approving a change, record five explicit statements:

```text
Specification: interpreted as xRegistry Core 1.0-rc4
Resource:      same contract / new contract, because ...
Version:       ID ..., ancestor ...
Default:       remains ... / moves to ..., because ...
Policy:        compatibility result ..., lifecycle action ...
```

This matrix replaces “bump the version” with five recorded decisions. It also gives generators and release tools enough information to choose between following a default and pinning a concrete revision.

## Primary sources

- **Normative:** [Core specification v1.0-rc4, `specversion`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#specversion-attribute)
- **Normative:** [Core specification v1.0-rc4, Resource and Version entities](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-resource-and-version-entities)
- **Normative:** [Core specification v1.0-rc4, `versionid`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#versionid-attribute)
- **Normative:** [Core specification v1.0-rc4, `defaultversionid`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#defaultversionid-attribute)
- **Normative:** [Core specification v1.0-rc4, `compatibility`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#compatibility-attribute)
- **Normative:** [Schema Registry specification v1.0-rc4, Versioning](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/schema/spec.md#13-versioning)