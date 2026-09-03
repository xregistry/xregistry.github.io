---
title: "Who Tells Tools That the Registry Changed?"
description: "xRegistry change events describe graph mutations, while deployments remain responsible for delivery, subscription, replay, and recovery."
permalink: /blog/who-tells-tools-that-the-registry-changed/
series_order: 17
perspective: Registry change events
status: Publication draft
drafted: 2026-08-25
due: 2026-10-02
date: 2026-10-02 16:00:00 +0200
published: false
reading_time: 8 minutes
previous_slug: following-the-water-boiler-contract-graph
previous_title: Following the Water Boiler Contract Graph
next_slug: export-is-a-tooling-boundary
next_title: Export Is a Tooling Boundary
---

A generator that repeatedly exports an entire registry just to discover one changed schema wastes work and cannot easily identify the cause. The xRegistry events working draft describes the meaning of registry-mutation events so a tool can invalidate a cache or rebuild affected output. It is a draft, and it deliberately does not define the broker, subscription API, retention, replay, or delivery guarantees.

## One interaction can change several entities

Creating one Schema Version changes more than the new Version entity.

Suppose a client creates:

```text
/schemagroups/boilers/schemas/Temperature/versions/4
```

The interaction produces a Version creation event and a Resource update event because the Resource's Version collection changed. Depending on the operation and event rules, it can also produce parent notifications. Consumers must not assume that every write produces Group and Registry events.

The relevant events can include:

- the Version creation;
- the Resource update, because its Version collection changed;
- a Group update, where the event rules call for a parent notification;
- the Registry update, where the event rules call for the parent notification.

This is useful for consumers at different levels. A generator interested in the exact Schema Version can react to the Version event. A registry browser caching Group summaries can refresh when it receives a Group event.

Treating the entire interaction as only “one schema changed” would hide the collection and parent state that other tools expose.

## Type, source, and subject locate the meaning

The change event type follows this pattern:

```text
io.xregistry.<entity>.<action>
```

The entity and action vocabularies distinguish events such as Version creation, Resource update, and Group deletion.

The event `source` is the absolute Registry root URL. The `subject` is the affected entity's XID. While the entity exists, combining the Registry root and XID gives a location from which a consumer can retrieve current state.

A deletion event is different. Its subject can name an entity that no longer exists, so retrieval may return not found. Consumers that need deleted content must keep prior state or rely on deployment-specific event enrichment. The standard event meaning does not promise a tombstone copy of the entity.

## Correlation groups one initiating interaction

One write can emit several events. The optional `xregcorrelationid` attribute lets a producer mark events that came from the same initiating interaction.

When used, all events from that interaction share the value. A consumer can group the notifications that the interaction produced instead of treating them as unrelated changes.

Correlation does not provide global ordering. It also does not promise exactly-once delivery. Those properties depend on the delivery system and consumer design.

## Changed names are hints, not a patch

For update events, optional `data.changed` can list the names of attributes that changed. It identifies fields, not old and new values.

A cache can use that list to decide whether its derived output is affected. If only `description` changed, a binary artifact generator may not need to rebuild. If `defaultversionid` changed, a generator that follows Resource defaults probably does.

The field is optional. A producer may omit it for privacy, security, or implementation reasons. Created and deleted events do not use it. Consumers must be able to retrieve current state or perform broader invalidation when changed names are unavailable.

## Event meaning does not define delivery

The specification leaves several operational questions to the deployment:

- How does a consumer register interest?
- Which broker or protocol carries events?
- How long are events retained?
- Can a consumer replay from a checkpoint?
- What ordering is preserved?
- How are duplicates represented?
- How does a consumer recover after missing events?

This separation allows a registry implementation to use Kafka, Event Hubs, MQTT, webhooks, or another mechanism. It also means a client cannot discover a universal event stream merely from the existence of the event definitions.

A deployment should document these operational choices next to its registry service.

## Build consumers for invalidation and reconciliation

A generator can combine events with periodic reconciliation:

1. Take an initial export and record a checkpoint from the deployment's event system.
2. Consume change events after that checkpoint.
3. Use entity type, action, subject, and changed names to invalidate affected output.
4. Group events by correlation ID when available.
5. Retrieve current entities rather than treating events as complete entity state.
6. Reconcile periodically or after a checkpoint gap.

The last step matters because the xRegistry event definition does not guarantee transport retention or delivery. Event-driven invalidation reduces unnecessary work. Reconciliation repairs missed or ambiguous state.

## These are control-plane events

Registry change events report changes to the contract graph. They are not the business events cataloged by that graph.

A Water Boiler Temperature Update says that a boiler temperature changed. A Schema Version creation event says that registry metadata changed. Both may use CloudEvents serialization, but their subjects and operational purposes are different.

Keeping that boundary clear prevents a business-event consumer from accidentally subscribing to registry administration events, and it prevents tooling from treating production telemetry as registry change notification.

The registry can tell tools what changed. The deployment still has to deliver that statement reliably enough for its consumers.

## Primary sources

- [Core specification v1.0-rc4, Design Events](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-events)
- [Corrected Events draft, Overview](https://github.com/xregistry/spec/blob/015095e7090e2e2f646db36a18d9183ecae4506c/core/events.md#overview)
- [Corrected Events draft, Event Definition](https://github.com/xregistry/spec/blob/015095e7090e2e2f646db36a18d9183ecae4506c/core/events.md#event-definition)
- [Corrected Events draft, Entity Events](https://github.com/xregistry/spec/blob/015095e7090e2e2f646db36a18d9183ecae4506c/core/events.md#entity-events)
- [Corrected Events draft, Sample xRegistry Interactions](https://github.com/xregistry/spec/blob/015095e7090e2e2f646db36a18d9183ecae4506c/core/events.md#sample-xregistry-interactions)