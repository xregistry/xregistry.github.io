---
title: "From Protocol Address to Operational Contract"
description: "xRegistry endpoint roles connect network addresses to message contracts and discovery metadata without claiming runtime availability or delivery."
permalink: /blog/from-protocol-address-to-operational-contract/
series_order: 15
perspective: Endpoint model
status: Publication draft
drafted: 2026-08-24
due: 2026-09-28
date: 2026-09-28 16:00:00 +0200
published: false
reading_time: 8 minutes
previous_slug: what-does-cloudevents-leave-unsaid
previous_title: What Does CloudEvents Leave Unsaid?
next_slug: following-the-water-boiler-contract-graph
next_title: Following the Water Boiler Contract Graph
---

An address such as `mqtt://broker.example.com/boiler` is only a place to connect. It does not tell a client which role to take, which messages belong there, how they are encoded, or whether the address is a live deployment or a reusable template. xRegistry Endpoint metadata supplies that contract context without claiming runtime health, delivery, or authorization.

## An Endpoint is a top-level contract

The [Endpoint Registry specification defines endpoints](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#endpoints) for unidirectional asynchronous information flows: events, streams, queues, and publish/subscribe interactions. Unlike schemas and messages, an Endpoint is an xRegistry Group-level construct. There are no groups of endpoints. Each Endpoint can carry its own message definitions or refer to message groups elsewhere.

As a Group-level construct, an Endpoint names where a client interacts with a system. It is not a versioned document in another collection.

| Contract question | Endpoint metadata |
| --- | --- |
| What may a client do? | `usage` |
| Which wire protocol applies? | `protocol` and `protocoloptions` |
| Which envelope is used? | `envelope` and `envelopeoptions` |
| Which messages belong here? | `messagegroups` or inlined `messages` |
| Is this a deployment or a template? | `protocoloptions.deployed` |
| Which related endpoints can I inspect? | `channel` |

A URI gives a client an address. An Endpoint also states the client's role and the messages used at that address. Message definitions can link to payload schemas, and a shared channel value can link related endpoints.

## Roles are named from the client interaction

The `usage` field is easy to read backwards.

The [`usage` attribute](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#usage) describes roles that a client can act in when communicating with the Endpoint:

- A `producer` Endpoint accepts messages pushed to it. The client is the producer, even when the address belongs to a broker queue or the receiving application.
- A `consumer` Endpoint offers messages for a client to pull or otherwise consume from it.
- A `subscriber` Endpoint manages subscription interest that causes messages to become available or to be delivered elsewhere. It configures the subscription rather than carrying the messages.

This naming follows the client relationship with the Endpoint, not ownership of the host. A queue input is therefore a `producer` Endpoint: producers send to it. The queue output is a `consumer` Endpoint: consumers receive from it. In direct HTTP delivery, the receiving target still implements the accepting end of the `producer` relationship.

`usage` is required and is an array with at least one value. The specification permits `["subscriber", "consumer"]` only for MQTT 3.1.1, MQTT 5.0, AMQP 1.0, or NATS, where one protocol interface can establish interest and receive messages. HTTP and Kafka must model those roles as separate Endpoint entities. A `producer` role cannot be combined with another role.

This rule prevents one record from combining unrelated broker interactions. Each client interaction gets its own contract.

## One channel, two perspectives

Consider a queue with one contract for sending and another for receiving:

```json
{
  "specversion": "1.0-rc4",
  "registryid": "orders-registry",
  "endpoints": {
    "orders-in": {
      "endpointid": "orders-in",
      "usage": ["producer"],
      "channel": "orders",
      "protocol": "AMQP/1.0",
      "protocoloptions": {
        "endpoints": [{ "uri": "amqps://broker.example.com/orders" }],
        "deployed": true
      },
      "messagegroups": ["/messagegroups/orders"]
    },
    "orders-out": {
      "endpointid": "orders-out",
      "usage": ["consumer"],
      "channel": "orders",
      "protocol": "AMQP/1.0",
      "protocoloptions": {
        "endpoints": [{ "uri": "amqps://broker.example.com/orders" }],
        "deployed": true
      },
      "messagegroups": ["/messagegroups/orders"]
    }
  }
}
```

This excerpt focuses on extension attributes. A fully materialized API or document view also carries the xRegistry core metadata required for that view.

Endpoints with the same non-empty [`channel`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#channel) value must have some relationship, but the specification does not define that relationship. Endpoints with different values may still be related. The field is correlation metadata, not a topology language.

The `channel` value tells a discovery client, generator, or reviewer which Endpoints to inspect together. It does not say that one Endpoint feeds another, specify request/reply causality, or define a processing pipeline. The model does not describe those exchange patterns.

## Message links make the address navigable

An Endpoint may inline messages and may use [`messagegroups`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#messagegroups) to refer to reusable message definition groups. A reference beginning with `/` is an XID within the same registry. An absolute URI points to a message group in an external registry, and the server stores that URI without resolving it.

A link does not guarantee that its target exists, remains available, or is accessible to a particular caller. When a client can follow it, the discovery path becomes useful:

<figure class="article-diagram">
  <img src="/assets/images/blog/endpoint-contract-path.svg" alt="Discovery path from an Endpoint through usage and protocol, preferred network address, message group, message definition, and payload schema.">
  <figcaption>Following references turns a protocol address into a navigable path through the operational contract.</figcaption>
</figure>

The [message lookup guidance](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#messages) strongly recommends aligning `messageid` with a runtime semantic identifier such as CloudEvents `type`. It also acknowledges cases where direct lookup is impossible, such as parallel JSON and XML serializations with the same semantic type. Resolving those cases is left to implementations.

The pinned [Sparkplug B scenario](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/cloudevents/samples/scenarios/mqtt-sparkplugB.xreg.json) uses Endpoint definitions to model an MQTT convention rather than one deployed broker address. Its roles, protocol settings, messages, and schemas are useful before deployment-specific values are supplied. This sample does not add requirements to the specification.

## Addresses carry protocol shape

[`protocoloptions.endpoints`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#protocoloptionsendpoints) is an ordered array of network addresses, preferred address first. HTTP, AMQP, MQTT, and NATS entries carry an absolute `uri`. Kafka instead carries a `bootstrap.servers` array because Kafka clients discover the cluster from a bootstrap list rather than target one destination URI.

The protocol selector controls which options are meaningful. If one networked entity supports multiple protocols, each protocol Endpoint must be declared separately, even when protocols share a port. One address can therefore participate in several distinct contracts.

A client can select an Endpoint by role and message contract, then read the address according to the declared protocol. A host name alone does not provide those contract details.

## What the contract does not promise

The model makes a limited set of claims.

When [`protocoloptions.deployed`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#protocoloptionsdeployed) is true, the metadata represents a live Endpoint expected to be available for communication. The overview qualifies reachability by network scope. When false, the definition is a template that needs external deployment configuration. If omitted, the attribute defaults to true.

Authorization metadata describes acceptable mechanisms and where authorization is obtained. [Runtime credentials and deployment-specific values](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#protocoloptionsauthorization) are supplied separately. The field must not be used as credential configuration.

None of this is a health probe. `deployed: true` does not confirm current reachability, DNS correctness, permission for this caller, message retention, ordering, delivery latency, or successful processing. A message-group reference does not guarantee that every runtime message conforms. Producer conformance requirements state the contract that messages must satisfy. Observability and enforcement show whether a running system satisfies it.

Endpoint metadata answers “How do I interact with this endpoint?” Monitoring, credentials, policy enforcement, and protocol acknowledgements answer “Can I interact with it now, and what happened?”

## Primary sources

- **Normative:** [Endpoint Registry specification v1.0-rc4, Overview and Endpoints](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#overview)
- **Normative:** [Endpoint Registry specification v1.0-rc4, `usage`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#usage)
- **Normative:** [Endpoint Registry specification v1.0-rc4, `channel`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#channel)
- **Normative:** [Endpoint Registry specification v1.0-rc4, addresses and authorization](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#protocoloptionsendpoints)
- **Normative:** [Endpoint Registry specification v1.0-rc4, message groups and messages](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/endpoint/spec.md#messagegroups)
- **Observed:** [CloudEvents Sparkplug B scenario at `d2433a8c`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/cloudevents/samples/scenarios/mqtt-sparkplugB.xreg.json)
