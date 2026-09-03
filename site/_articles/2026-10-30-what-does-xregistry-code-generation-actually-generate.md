---
title: "What Does xRegistry Code Generation Actually Generate?"
description: "xrcg creates complete SDK-like projects with messaging code, schema-derived data classes, build metadata, tests, and documentation."
permalink: /blog/what-does-xregistry-code-generation-actually-generate/
series_order: 29
perspective: Code-generation output
status: Publication draft
drafted: 2026-09-03
due: 2026-10-30
date: 2026-10-30 16:00:00 +0200
published: false
reading_time: 6 minutes
previous_slug: what-can-xregistry-codegen-build
previous_title: What Can xRegistry Codegen Build?
next_slug: how-does-xregistry-codegen-resolve-references
next_title: How Does xRegistry Codegen Resolve References?
---

`xrcg` produces a project, not a snippet pasted into an existing application. The Codegen site describes generated output as messaging clients, schema-derived data classes, build files with dependencies, integration tests, language-idiomatic project structure, and documentation.

That output makes a contract usable sooner, but it is still source code. Build it, inspect its dependency versions, configure its credentials, and run its tests in the same way as any other dependency-bearing project.

## Generation has explicit inputs

[`xrcg generate`](https://github.com/xregistry/codegen/blob/main/docs/commands/generate.md) accepts definitions from a local JSON or YAML file or a URL, and can limit output to a Message Group or Endpoint. The selected language and style determine the output; a project name and output directory locate it for the application team.

Generation does not prove a broker is reachable or a payload is compatible with every consumer. It turns declared catalog data into a concrete project that can be built and tested for those facts.

## Telemetry becomes a typed producer project

The [Fabrikam Motorsports Event Hubs example](https://xregistry.io/codegen/gallery/ts-eh-fabrikam-producer/) starts with an Avro telemetry Channel event. Its schema includes a channel enum, optional car, session, and lap IDs, a sample count and frequency, a timestamp range, and an array of measured values. The generated TypeScript output contains separate data and producer packages, TypeScript configuration, package manifests, tests, and a README.

The xRegistry Message binds the CloudEvent identity and URI-template values to the Schema that supplies the payload:

{% capture telemetry_message_input %}
```json
"net.fabrikam.telemetry.channel": {
  "envelope": "CloudEvents/1.0",
  "envelopemetadata": {
	"type": { "value": "net.fabrikam.telemetry.channel" },
	"source": { "value": "fza://{tenantid}/{carId}" },
	"subject": { "value": "{channelId}" }
  },
  "dataschemauri": "#/schemagroups/net.fabrikam.telemetry/schemas/net.fabrikam.telemetry.channel"
}
```
{% endcapture %}
{% include generated-output.html title="xRegistry input: telemetry Message" content=telemetry_message_input %}

That schema's `Channel` record becomes a generated TypeScript class, preserving its fields and serializer:

{% capture telemetry_model_output %}
```typescript
@jsonObject
export class Channel {
	@jsonMember(String)
	public ChannelId: ChannelType;
	@jsonMember(Number)
	public SampleCount: number;
	@jsonMember(Number)
	public Frequency: number;
	@jsonArrayMember(Number)
	public Data: number[];

	public toByteArray(contentTypeString: string): Uint8Array { /* ... */ }
}
```
{% endcapture %}
{% include generated-output.html title="Generated TypeScript output: Channel model" content=telemetry_model_output %}

The generated producer turns the Message name, schema type, and URI-template placeholders into its public method:

{% capture telemetry_producer %}
```typescript
async sendChannel(
	data: FabrikamMotorsportsData.FabrikamMotorsportsData_Net_Fabrikam_Telemetry_Channel,
	tenantid: string,
	carId: string,
	channelId: string,
	contentType: string = 'application/json'
): Promise<void> {
	const cloudEvent = new CloudEvent({
		type: 'net.fabrikam.telemetry.channel',
		source: `fza://${tenantid}/${carId}`,
		subject: `${channelId}`,
		data: data
	});
}
```
{% endcapture %}
{% include generated-output.html title="Generated TypeScript output: Message-specific producer method" content=telemetry_producer %}

The application owns the values and calls the generated client:

{% capture telemetry_application_call %}
```typescript
const producer = new TelemetryProducer(eventHubClient);
const channel = Channel.createInstance();

await producer.sendChannel(
	channel,
	'northwind',
	'car-24',
	'engine-rpm'
);

await producer.close();
```
{% endcapture %}
{% include generated-output.html title="Application code: construct the model and call the generated producer" content=telemetry_application_call %}

The gallery also shows the ordinary operational code a team still owns: creating the Azure Event Hubs client, choosing Azure Identity for production, partitioning related events, handling failures, and closing the producer. The [gallery](https://xregistry.io/codegen/gallery/) makes the generated file trees visible alongside the catalogs that produced them.

## Primary sources

- **Implementation:** [What xRegistry Codegen produces](https://xregistry.io/codegen/)
- **Example:** [Fabrikam Motorsports to TypeScript Event Hubs producer](https://xregistry.io/codegen/gallery/ts-eh-fabrikam-producer/)
- **Implementation:** [`xrcg generate` command documentation](https://github.com/xregistry/codegen/blob/main/docs/commands/generate.md)
