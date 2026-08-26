---
title: "What Does CloudEvents Leave Unsaid?"
description: "CloudEvents defines a portable event envelope; xRegistry Message and Endpoint metadata add payload, routing, and deployment contracts around it."
permalink: /blog/what-does-cloudevents-leave-unsaid/
series_order: 14
perspective: Layered event contracts
status: Publication draft
drafted: 2026-08-25
date: 2027-02-24
published: false
reading_time: 8 minutes
previous_slug: a-message-definition-is-both-a-template-and-a-filter
previous_title: A Message Definition Is Both a Template and a Filter
next_slug: from-protocol-address-to-operational-contract
next_title: From Protocol Address to Operational Contract
---

A CloudEvent can tell a consumer what happened, where it came from, and how to interpret its event context. It does not try to be a catalog of every broker, topic, payload policy, and deployed consumer involved in delivering that event.

That is intentional layering, not a missing feature.

xRegistry can describe the layers around a CloudEvent without changing the CloudEvents envelope. Message Definitions describe recognizable message contracts. Schema Resources describe payload shapes. Endpoint Resources connect those contracts to protocol addresses and roles.

## The envelope establishes portable event context

CloudEvents defines required context attributes including `id`, `source`, `specversion`, and `type`. It also defines how event data and optional context attributes are represented.

Consider this event:

```json
{
  "specversion": "1.0",
  "id": "7d8fbb83",
  "source": "/boilers/B-17",
  "type": "WaterBoiler.TemperatureUpdate",
  "datacontenttype": "application/json",
  "data": {
    "temperature": 73.4
  }
}
```

A CloudEvents implementation can parse its context consistently. A consumer can use `type` and `source` to decide whether the event is relevant. The envelope also permits a `dataschema` URI for the data schema.

The event alone does not tell a deployment tool which MQTT broker carries it, which topic template applies, which Schema Resource owns its payload policy, or which consumers are configured to receive it.

## A protocol binding is not a deployed address

CloudEvents protocol bindings define how an event maps to transports such as HTTP, Kafka, or MQTT. A binding explains representation rules for the protocol.

It does not identify a particular production broker:

```text
mqtts://broker.example.com
```

It also does not choose a topic, queue, consumer group, QoS setting, or authorization procedure for one deployment.

xRegistry Endpoint metadata can describe those operational details. The Endpoint extension associates an address and role with Message Groups. A producer Endpoint can state which messages it emits. A subscriber Endpoint can state which messages it expects to receive.

The Endpoint remains metadata. It does not prove that the broker is healthy, that credentials are valid, or that an event was delivered.

## A Message Definition adds matching rules

xRegistry Message Definitions separate envelope, protocol, and payload metadata. For a CloudEvent, a definition can constrain context attributes in several ways.

The Water Boiler contract can fix `type` to `WaterBoiler.TemperatureUpdate` and describe `source` as a template that varies by boiler. It can associate the payload with a JSON Schema Resource and add MQTT-specific metadata.

That definition serves two directions:

- a producer can use it as a template for creating a valid message;
- a consumer can use its constraints to test whether an incoming message matches.

xRegistry does not require one universal matching engine. The definition records machine-readable constraints from which tools can implement matching appropriate to their protocol and environment.

## Payload format and payload policy are separate

`datacontenttype: application/json` says how to parse the event data. A schema reference says which shape the parsed value should have. A Schema Resource can add Version identity, default selection, format details, and compatibility policy around that shape.

CloudEvents' `dataschema` attribute can locate a schema, but CloudEvents does not define an xRegistry hierarchy or decide whether a URI follows a moving default Version. Those are registry concerns.

This separation lets the same CloudEvents envelope work with JSON Schema, Avro, Protobuf, or another payload system. xRegistry records the format-specific contract without changing CloudEvents.

## Compare two event deployments

The xRegistry samples include contrasting scenarios:

| Concern | Water Boiler | Wind Generator |
| --- | --- | --- |
| Envelope | CloudEvents | CloudEvents |
| Transport | MQTT | Kafka |
| Payload schema | JSON Schema | Avro |
| Routing | MQTT topic template | Kafka topic and consumer settings |
| Registry links | Endpoint, Message, and Schema entities | Endpoint, Message, and Schema entities |

CloudEvents gives both scenarios a common event context. It does not erase their transport and payload differences. The registry graph makes those differences discoverable.

The same Message and Endpoint extensions can also describe protocol-native messages that are not CloudEvents. The layering is not limited to one envelope standard.

## Keep descriptions and runtime proof apart

A complete registry record can answer:

- which event contexts define the Message;
- which schema governs the payload;
- which protocol metadata applies;
- which Endpoint role and address are configured;
- which Message Group the Endpoint accepts or produces.

It cannot, by description alone, prove:

- that the Endpoint is reachable now;
- that the caller is authorized;
- that every producer follows the Message Definition;
- that a consumer processed a particular event;
- that delivery guarantees were met.

Those facts come from runtime systems and observations.

## The layers answer different questions

CloudEvents answers “what is this event and how is its context represented?” A Message Definition answers “which values and payload contract make this a recognized message?” An Endpoint answers “where and in which role is that message expected to move?”

None of the layers replaces the others. Together, they let a tool move from a portable event envelope to a concrete operational contract without asking CloudEvents to become a deployment catalog.

## Primary sources

- [CloudEvents 1.0.2, Context Attributes](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#context-attributes)
- [xRegistry CloudEvents specification v1.0-rc4, CloudEvents Registry](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/cloudevents/spec.md#cloudevents-registry)
- [Message specification v1.0-rc4, Message Metadata](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#message-metadata)
- [Message specification v1.0-rc4, Context Attributes](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#context-attributes)
- [Endpoint specification v1.0-rc4, Endpoint Registry Model](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#endpoint-registry-model)