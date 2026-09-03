---
title: "What Can xRegistry Codegen Build?"
description: "The Codegen gallery shows how xrcg combines a catalog, language, protocol, and application role into generated messaging projects or API descriptions."
permalink: /blog/what-can-xregistry-codegen-build/
series_order: 28
perspective: Code-generation capabilities
status: Publication draft
drafted: 2026-09-03
due: 2026-10-28
date: 2026-10-28 16:00:00 +0200
published: false
reading_time: 7 minutes
previous_slug: what-is-xregistry-codegen
previous_title: What Is xRegistry Codegen?
next_slug: what-does-xregistry-code-generation-actually-generate
next_title: What Does xRegistry Code Generation Actually Generate?
---

The [xRegistry Codegen gallery](https://xregistry.io/codegen/gallery/) is the best map of the tool's public surface. Each example combines a catalog with a language, protocol, and producer or consumer role.

The current gallery includes Kafka, Azure Event Hubs, MQTT, and AMQP projects, plus AsyncAPI and OpenAPI output. Sample catalogs range from ERP events to motorsports telemetry and IoT devices. Browse [a Python Kafka producer](https://xregistry.io/codegen/gallery/py-kafka-contoso-producer/), [a TypeScript Event Hubs producer](https://xregistry.io/codegen/gallery/ts-eh-fabrikam-producer/), [a Python MQTT client](https://xregistry.io/codegen/gallery/py-mqtt-lightbulb/), or [an AsyncAPI definition](https://xregistry.io/codegen/gallery/asyncapi-contoso-consumer/) before selecting a template.

## Pick the role first

A style is not only a transport label. A producer, consumer, client, and function handler have different public APIs and operational responsibilities. Select the role that matches the application, then select a language maintained by its team.
apply 
The available-template list is release-specific. A gallery example is evidence of one supported combination, not a claim that every language and protocol can be mixed freely.

## Choose the output by the work to be done

Use the gallery to start from the integration role, not the source language. The [Python Kafka producer](https://xregistry.io/codegen/gallery/py-kafka-contoso-producer/) is for an application that publishes a catalog's Messages. The [Python MQTT client](https://xregistry.io/codegen/gallery/py-mqtt-lightbulb/) combines publishing and dispatch for a device-facing protocol. The [TypeScript Event Hubs producer](https://xregistry.io/codegen/gallery/ts-eh-fabrikam-producer/) targets typed telemetry publication. The [Contoso ERP AsyncAPI output](https://xregistry.io/codegen/gallery/asyncapi-contoso-consumer/) targets a contract document for tools and readers rather than a runtime client.

The catalog is the common input; a language and style select the kind of result. That result can be a package another application imports, a handler surface an application implements, or a document another tool consumes. The following articles examine the generated TypeScript project, preprocessing of shared definitions, and the template choices that make those outputs different.

## Primary sources

- **Implementation:** [xRegistry Codegen gallery](https://xregistry.io/codegen/gallery/)
- **Example:** [Contoso ERP to AsyncAPI consumer specification](https://xregistry.io/codegen/gallery/asyncapi-contoso-consumer/)
- **Implementation:** [xRegistry Codegen available templates](https://xregistry.io/codegen/)
