---
title: "A Message Definition Is Both a Template and a Filter"
description: "xRegistry message definitions connect message metadata to payload schemas so producers can build messages and consumers can recognize them."
permalink: /blog/a-message-definition-is-both-a-template-and-a-filter/
series_order: 13
perspective: Message contracts
status: Publication draft
drafted: 2026-08-24
date: 2027-02-10
published: false
reading_time: 9 minutes
previous_slug: where-a-schema-version-stops-being-the-same-schema
previous_title: Where a Schema Version Stops Being the Same Schema
next_slug: what-does-cloudevents-leave-unsaid
next_title: What Does CloudEvents Leave Unsaid?
---

A schema can say that `orderId` is a string. It cannot, by itself, say that a payload represents an order-created event, that its CloudEvents `type` has a fixed value, or that an MQTT binding places it on a particular topic.

Those are message-level concerns. xRegistry connects them in one message definition that can describe a transport-independent envelope, protocol metadata, and a payload schema. Producers use the definition to build messages. Consumers use the same rules to recognize them.

A message definition joins message metadata with a payload contract.

## Templates for producers, filters for consumers

The [Message Registry specification gives message definitions two purposes](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#message-definitions).

For producers, a definition lists envelope attributes, headers, and protocol properties to set. Values can be constants or constrained patterns. For consumers, it gives rules for comparing incoming messages with candidate definitions. Zero matches means no definition recognized the message. One match selects a candidate contract. Multiple matches may require more checks, including payload validation.

The specification does not mandate one matching algorithm. Its [matching guidance](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#message-definition-matching) recommends using CloudEvents metadata for differentiation and aligning `messageid` with CloudEvents `type`.

Registry filtering finds stored definitions. Wire-message matching compares a received message with one or more definitions. A client can cache the first result and test the second process on its own.

## Envelope, protocol, and payload

The [message metadata model](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#message-metadata) permits any combination of envelope, protocol, and payload declarations.

### Envelope

An `envelope` selects a transport-independent metadata convention. The pinned specification predefines `CloudEvents/1.0`. `envelopemetadata` and `envelopeoptions` can fix a CloudEvents `type`, require a `source`, or describe a URI-template such as `/shops/{shopid}`. Producers fill placeholders. Consumers can match the pattern and extract context.

### Protocol

A `protocol` selects protocol-specific metadata, and `protocoloptions` carries constraints for that protocol. The specification covers HTTP, AMQP 1.0, MQTT 3.1.1 and 5.0, Kafka, and NATS.

Protocol metadata is optional. A CloudEvents definition intended for several bindings can remain protocol-neutral. A payload-only definition can also be useful when neither an envelope nor one protocol distinguishes the message.

### Payload

`dataschemaformat` identifies the schema language. `dataschema`, `dataschemauri`, and `dataschemaxid` connect the definition to the payload schema. `datacontenttype` declares its media type.

Inline `dataschema` and `dataschemauri` are mutually exclusive, and either requires `dataschemaformat`. A `dataschemauri` must resolve to a concrete schema object. `dataschemaxid` associates a message with a Schema Resource in the same registry. When supplied with `dataschemauri`, the URI must be that entity's `self` URL.

## A traversable contract

This excerpt defines recognizable CloudEvents metadata and points to one concrete Schema Version:

```json
{
  "messageid": "com.example.order.created.v2",
  "envelope": "CloudEvents/1.0",
  "envelopemetadata": {
    "type": {
      "type": "string",
      "value": "com.example.order.created.v2",
      "required": true
    },
    "source": {
      "type": "uritemplate",
      "value": "/shops/{shopid}",
      "required": true
    }
  },
  "dataschemaformat": "JsonSchema/draft-07",
  "dataschemauri": "/schemagroups/com.example.orders/schemas/com.example.order-created.v2/versions/1",
  "datacontenttype": "application/json"
}
```

For a producer, the definition requires a constant `type`, a templated `source`, and a JSON payload governed by the referenced Version. For a consumer, `type` identifies likely matches, `source` narrows the set, and the schema validates the body after the metadata selects a candidate.

Referencing an explicit Schema Version is appropriate when a message contract must be reproducible. A Resource reference expresses another policy: use the compatible Version currently selected as default. That choice controls whether changing the default affects later validation or generation.

## Message identity has a strict rule

Schema Resources collect compatible Versions. Message definitions use a tighter identity rule.

The [Message Definitions section](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#message-definitions-message-group) says definitions do not contain version history: different message metadata describes different messages. Message Resource types SHOULD set `maxversions` to `1`. A change that alters the on-wire message SHOULD create a new definition with new `type` and `messageid` values. `deprecated` can mark the old definition. A model can use another approach only when it defines an unambiguous way to match incoming messages.

If one `messageid` represented different wire messages, a consumer would need another reliable value to select the right contract.

Correcting a description need not create a new event type. A change to a required envelope attribute, routing property, content type, or payload contract changes the wire message and SHOULD create a new definition. The test is whether a conforming producer or consumer must behave differently on the wire.

## Reuse without copying

Definitions can reuse common declarations through `basemessage`.

A [`basemessage` reference](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#basemessage) can name another message in the same registry by its registry-relative path, called an XID, or an external message by absolute URI. A base message can have its own base, but the chain cannot loop. To build the complete definition, a client SHOULD follow the chain to its end and merge each derived definition while walking back up the chain. The derived value wins when names match.

A protocol-neutral CloudEvents definition can therefore be the base for an MQTT-specific definition that adds protocol options.

Reuse must preserve message identity. A protocol binding for the same logical CloudEvent can use a derived definition. A change in meaning or payload needs a new identity even if inheritance could represent it.

## Discovery is staged

A client rarely needs every definition. It can narrow the set before validating payloads:

1. Find the relevant Message Group.
2. Retrieve candidate definitions.
3. Resolve required `basemessage` and schema references.
4. Match envelope and protocol metadata.
5. Validate or decode the payload with the selected schema.

If the server advertises the optional core Filter capability, a client can narrow candidates:

```http
GET /messagegroups/com.example.orders/messages?filter=envelopemetadata.type.value=com.example.order.created.v2&inline=*
```

[`?filter` support is optional](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#filter-flag). Clients must inspect capabilities. Without server-side filtering, they can retrieve the collection and select candidates locally.

Use stable envelope metadata to identify the definition before the client parses and validates the payload. Schema validation checks the body, not the event identity.

## Primary sources

- **Normative:** [Message Registry specification v1.0-rc4, Message Definitions](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#message-definitions)
- **Normative:** [Message Registry specification v1.0-rc4, Message Metadata](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#message-metadata)
- **Normative:** [Message Registry specification v1.0-rc4, Matching](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#message-definition-matching)
- **Normative:** [Message Registry specification v1.0-rc4, `basemessage`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#basemessage)
- **Normative:** [Core specification v1.0-rc4, Filter Flag](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#filter-flag)