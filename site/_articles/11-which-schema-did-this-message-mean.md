---
title: "Which Schema Did This Message Mean?"
description: "Inline schemas, external schema URIs, xRegistry Schema references, Versions, and fragments make different promises about resolution and change."
permalink: /blog/which-schema-did-this-message-mean/
series_order: 11
perspective: Schema references
status: Publication draft
drafted: 2026-08-25
date: 2027-01-13
published: false
reading_time: 8 minutes
previous_slug: versioning-is-five-separate-questions
previous_title: Versioning Is Five Separate Questions
next_slug: where-a-schema-version-stops-being-the-same-schema
next_title: Where a Schema Version Stops Being the Same Schema
---

A message definition that says “the payload uses JSON Schema” has not yet identified a schema.

The schema may be embedded in the Message, stored at an external URL, represented by an xRegistry Schema Resource, pinned to one Version, or selected from a document that contains several named schema objects.

Each form makes a different promise about portability and change.

## Inline content travels with the Message

The Message extension's `dataschema` attribute carries a schema object directly in the Message Definition. `dataschemaformat` identifies its format.

This form keeps the message and payload shape together. A tool that retrieves the Message does not need another network request to obtain the schema.

The trade-off is ownership. If several Messages use the same schema, each inline copy can drift. Updating the shared payload contract means finding every copy or accepting that they are separate contracts.

Inline content works well when the schema is small, specific to one Message, and intentionally versioned with that Message Definition.

## A URI must reach a concrete schema object

`dataschemauri` points to a schema object through a relative or absolute URI. It also requires `dataschemaformat`, and it is mutually exclusive with inline `dataschema`.

The target must be concrete enough for a schema processor. A URI that reaches a file containing several Protobuf messages or an Avro document containing several named types may not identify which object governs the payload.

The URI may therefore need a format-specific selector:

- a JSON Pointer for a definition inside JSON Schema;
- a Protobuf message name;
- an Avro full name;
- another fragment form defined for the schema format.

`dataschemaformat` identifies how to interpret the schema. The payload's `datacontenttype` identifies how to interpret message data. A fragment identifies which schema object inside a document applies. They answer different questions.

## An XID connects the Message to the registry graph

`dataschemaxid` identifies a Schema Resource in the same Registry. It gives generic xRegistry tools a typed, registry-relative relationship instead of leaving them to infer one from an arbitrary URL.

When both `dataschemaxid` and `dataschemauri` are present, the URI must match the referenced entity's `self`. The two values then provide registry identity and a resolvable location for the same target.

An XID is scoped to its Registry. It cannot identify a Schema in another Registry by itself. Cross-registry references require a URI and the client's external-reference policy.

## Resource references move with the default

A URI ending at a Schema Resource selects that Resource's default Version. This is useful when the Message owner wants to follow the schema owner's selected current contract.

The Water Boiler sample uses this style for its Temperature Update schema. If the Schema Resource changes its default, resolving the same Resource URI can produce different schema content.

That may be exactly the intended policy. A Message can follow compatible schema updates without being rewritten. But a build that must be reproducible should record what it resolved: the concrete Version XID, content digest, format, and retrieval time.

Without that record, two builds using the same Message Definition can compile against different defaults.

## Version references pin one revision

A URI ending at a Version selects one exact registry revision:

```text
/schemagroups/boilers/schemas/Temperature/versions/2
```

This is a stronger reproducibility statement. Changing the Resource's default does not change the referenced Version.

Pinning does not guarantee that an external dependency remains reachable forever. Export and generation workflows may still need to capture the schema bytes and digest. The Version identity tells the workflow what it intended to capture.

The choice between Resource and Version is therefore not merely syntax:

| Reference | Update policy |
| --- | --- |
| Schema Resource | Follow its selected default Version |
| Schema Version | Stay on one concrete registry revision |
| External concrete URI | Follow the stability policy of that external location |
| Inline schema | Travel as part of the Message Definition |

## Resolution belongs in the build record

Consider a release build for `WaterBoiler.TemperatureUpdate`:

1. Retrieve the Message Definition.
2. Inspect `dataschemaformat` and the selected reference form.
3. Resolve a Resource reference to its current default Version.
4. Apply any format-specific fragment to select the schema object.
5. Record the concrete Version XID or external URI and content digest.
6. Generate code from the captured schema input.

This process separates authoring policy from build evidence. Authors can choose a moving Resource reference where compatible defaults are useful. The build can still say exactly which Version produced an artifact.

## A schema link is part of the contract

The right reference form depends on ownership and change policy.

Use an inline schema when the payload shape belongs only to the Message. Use a Schema Resource when a shared contract should follow a managed default. Use a Version when exact revision identity matters. Use an external URI when the authoritative schema lives outside the registry, but make the concrete object and trust boundary explicit.

“Uses JSON Schema” is a format statement. A complete payload contract also says which schema object, under which update policy, was meant.

## Primary sources

- [Message specification v1.0-rc4, `dataschema`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#dataschema)
- [Message specification v1.0-rc4, `dataschemauri`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#dataschemauri)
- [Message specification v1.0-rc4, `dataschemaxid`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#dataschemaxid)
- [Schema specification v1.0-rc4, Schema Formats](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/schema/spec.md#43-schema-formats)
- [Water Boiler scenario at the pinned revision](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/cloudevents/samples/scenarios/waterboiler-mqtt5-jsons07.xreg.json)