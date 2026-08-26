---
title: "Following the Water Boiler Contract Graph"
description: "One xRegistry sample shows how references connect endpoints, message definitions, and schemas without claiming that any boiler or broker ran."
permalink: /blog/following-the-water-boiler-contract-graph/
series_order: 16
perspective: Contract graph
status: Publication draft
drafted: 2026-08-24
due: 2026-09-30
date: 2026-09-30 16:00:00 +0200
published: false
reading_time: 8 minutes
previous_slug: from-protocol-address-to-operational-contract
previous_title: From Protocol Address to Operational Contract
next_slug: who-tells-tools-that-the-registry-changed
next_title: Who Tells Tools That the Registry Changed?
---

The Water Boiler scenario in the xRegistry repository shows how to follow references from an endpoint to its data contract. The small sample declares two MQTT endpoints, one message group, two messages, and two versioned JSON Schemas.

It does not show a running water boiler. It contains contract metadata, not runtime results.

## The graph at a glance

The pinned [Water Boiler sample](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/cloudevents/samples/scenarios/waterboiler-mqtt5-jsons07.xreg.json) contains three top-level collections: `endpoints`, `messagegroups`, and `schemagroups`. Its reference graph can be summarized without adding an application architecture:

<figure class="article-diagram">
  <img src="/assets/images/blog/water-boiler-contract-graph.svg" alt="Water Boiler Producer and Consumer Endpoints reference one message group containing TemperatureUpdate and StatusChange messages, each linked to its payload Schema Resource.">
  <figcaption>The connectors represent references in the registry document, not runtime delivery, subscriptions, or successful exchanges.</figcaption>
</figure>

The lines in this diagram represent references in the file. They do not represent sent data, subscriptions, or successful exchanges.

The [core resource model](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#registry-model) organizes registry data as Groups, Resources, and Versions. The schema and message extensions supply concrete Group and Resource types, while the endpoint extension defines endpoint metadata. References let those independently modeled records form a graph.

## Start at the endpoints

The sample declares `WaterBoiler.Producer` with `usage: ["producer"]` and `WaterBoiler.Consumer` with `usage: ["consumer"]`. Both select `MQTT/5.0`. Both contain the same endpoint URI, `mqtt://mqttbroker1.example.com:1883`, under `protocoloptions.endpoints`. Both reference exactly one message group:

```json
"messagegroups": [
  "/messagegroups/WaterBoiler.Events"
]
```

The names and descriptions do not fully agree. `WaterBoiler.Producer` is described as a “Producer endpoint for water boiler commands,” while the referenced group is named `WaterBoiler.Events` and contains temperature and status event definitions. `WaterBoiler.Consumer` is described as a consumer endpoint for water boiler events. The document has no command message definition, so these names cannot define a command path.

The endpoint specification defines `producer`, `consumer`, and `subscriber` as endpoint usage roles. It also defines [`messagegroups`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#messagegroups) as an array of URIs referring to message definition groups. Consequently, the two endpoint records declare different roles against the same set of message definitions.

Preserve the declared roles and flag the conflicting names for review. A graph reader cannot invent a command message, reverse a direction, or decide which description is wrong.

An operator would need more information. The sample contains no DNS result for the example host, broker handshake, credential, client identifier, or deployment result. The `.example.com` hostname is for documentation, and the file says nothing about reachability. Because `protocoloptions.deployed` is omitted, its default value is `true`. The metadata therefore describes the endpoints as live and expected to be available, but it does not prove that they were deployed or reachable.

## Follow the message-group edge

The shared URI leads to `/messagegroups/WaterBoiler.Events`.

That group has the description “Events for water boiler operations,” sets `protocol` to `MQTT/5.0`, and contains two message resources:

| Message | Topic template | Quality of service (QoS) | Retain | Schema reference |
| --- | --- | ---: | --- | --- |
| `WaterBoiler.TemperatureUpdate` | `waterboiler/{boilerId}/temperature` | `1` | `false` | `WaterBoiler.TemperatureUpdateEventData` |
| `WaterBoiler.StatusChange` | `waterboiler/{boilerId}/status` | `1` | `false` | `WaterBoiler.StatusChangeEventData` |

Each full schema reference begins `/schemagroups/WaterBoiler/schemas/`. Each message also declares `dataschemaformat: "JSONSchema/Draft-07"`.

The message specification's [MQTT binding](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#mqtt) defines protocol options including `topic_name`, `qos`, and `retain`. Its [`dataschemauri` definition](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#dataschemauri) gives a message definition a URI reference to its data schema. These fields define the contract. They do not record MQTT packets.

The `{boilerId}` token connects routing vocabulary to payload vocabulary by name: both schemas contain a required `boilerId` property. The names correspond, but the sample does not state a runtime rule that compares the topic token with the payload value. It also provides no example MQTT publication in which they match.

The schema URIs identify Schema Resources, not explicit Version paths. Neither ends in `/versions/1`. A Resource URI can select its default Version, while a Version URI identifies one concrete Version. In this sample each schema contains only Version `1`, but the references remain unversioned.

## Arrive at the schema versions

The `WaterBoiler` schema group contains two Schema Resources, and each has one Version named `1`.

`WaterBoiler.TemperatureUpdateEventData/versions/1` embeds a Draft 7 JSON Schema for an object with three required properties:

```json
{
  "boilerId": { "type": "string" },
  "temperature": { "type": "number" },
  "timestamp": { "type": "integer" }
}
```

Its descriptions call `temperature` a current reading in Celsius and `timestamp` an event timestamp. The schema does not encode a Celsius unit, a temperature range, or a timestamp unit and epoch.

`WaterBoiler.StatusChangeEventData/versions/1` similarly requires `boilerId` as a string, `status` as a string, and `timestamp` as an integer. The status description says “e.g., on/off,” but there is no JSON Schema `enum`. A validator can enforce “string.” This document alone cannot enforce that the string is `on` or `off`.

Neither embedded schema declares `additionalProperties: false`. A generator or validator cannot treat the examples as closed object definitions unless another documented policy requires it. The sample also has no compatibility results, instance-validation results, or example payloads.

The [schema registry specification](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/schema/spec.md) defines Schema Resources and their Versions as registry-managed schema documents. The JSON Schema document itself supplies the payload constraints. Descriptive prose and machine-enforced keywords are not interchangeable.

## A repeatable reading method

For another xRegistry scenario, use the same sequence:

1. Inventory the top-level collections actually present.
2. Begin with a concrete endpoint and record its role, protocol, and references.
3. Resolve each `messagegroups` URI before discussing messages.
4. For each message, record protocol options and follow its schema reference.
5. Distinguish Resource references from explicit Version references.
6. Separate machine constraints from names and descriptions.
7. Check runtime data before making an operational claim.

This sequence follows the references without treating the document as a system trace. In the Water Boiler sample, the paths lead from endpoint intent to message metadata and then to schema constraints.

## Primary sources

- **Observed:** [Water Boiler MQTT 5.0 and JSON Schema Draft 7 sample at `d2433a8c`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/cloudevents/samples/scenarios/waterboiler-mqtt5-jsons07.xreg.json)
- **Normative:** [Core specification v1.0-rc4, Registry Model](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#registry-model)
- **Normative:** [Endpoint specification v1.0-rc4, Usage](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#usage)
- **Normative:** [Endpoint specification v1.0-rc4, Message Groups](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#messagegroups)
- **Normative:** [Message specification v1.0-rc4, Data Schema URI](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#dataschemauri)
- **Normative:** [Message specification v1.0-rc4, MQTT](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/message/spec.md#mqtt)
- **Normative:** [Schema Registry specification v1.0-rc4](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/schema/spec.md)