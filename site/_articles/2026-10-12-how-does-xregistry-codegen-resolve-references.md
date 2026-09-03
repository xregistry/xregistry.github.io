---
title: "How Does xRegistry Codegen Resolve References?"
description: "xrcg follows documented aliases and base-message references so templates consume effective catalog definitions rather than isolated fragments."
permalink: /blog/how-does-xregistry-codegen-resolve-references/
series_order: 30
perspective: Code-generation reference resolution
status: Publication draft
drafted: 2026-09-03
due: 2026-10-12
date: 2026-10-12 16:00:00 +0200
published: false
reading_time: 6 minutes
previous_slug: what-does-xregistry-code-generation-actually-generate
previous_title: What Does xRegistry Code Generation Actually Generate?
next_slug: when-does-a-template-become-part-of-your-integration
next_title: When Does a Template Become Part of Your Integration?
---

Real catalogs reuse information. `xrcg` documents two ways it prepares that information before templates render it: aliases can point a local resource name at a canonical same-type resource, and `basemessageurl` can let one Message inherit common metadata from another.

The tool resolves those references so a template consumes an effective definition. That is implementation behavior of `xrcg`, not a rule imposed on every xRegistry client.

## Reuse without losing the source catalog

The [alias-resolution documentation](https://github.com/xregistry/codegen/blob/main/docs/alias_resolution.md) describes how `xref` aliases are processed before validation and rendering. The [base-message documentation](https://github.com/xregistry/codegen/blob/main/docs/basemessage_resolution.md) describes merging a base Message into a derived one and detecting circular inheritance.

These mechanisms reduce repeated metadata. They do not turn a catalog relationship into a runtime delivery relationship, and they do not prove the resulting code will connect to a broker. Validate the definition and build the generated project after changing a shared reference.

For example, the documented `basemessageurl` sample declares only the specialized type on its derived Message:

{% capture base_message_input %}
```json
"BaseDeviceEvent": {
	"envelopemetadata": {
		"source": { "value": "/devices/{deviceid}" },
		"datacontenttype": { "value": "application/json" }
	}
},
"SensorEvent": {
	"basemessageurl": "/messagegroups/devices/messages/BaseDeviceEvent",
	"envelopemetadata": {
		"subject": { "value": "/sensors/{sensorid}" }
	}
},
"TemperatureSensorEvent": {
	"basemessageurl": "/messagegroups/devices/messages/SensorEvent",
	"envelopemetadata": {
		"type": { "value": "com.example.device.sensor.temperature" }
	}
}
```
{% endcapture %}
{% include generated-output.html title="xRegistry input: base and derived Messages" content=base_message_input %}

`xrcg` resolves the inheritance before it renders a template. The effective definition supplied to a template has the specialized type together with the inherited metadata:

{% capture resolved_message_output %}
```json
"TemperatureSensorEvent": {
	"envelopemetadata": {
		"type": { "value": "com.example.device.sensor.temperature" },
		"subject": { "value": "/sensors/{sensorid}" },
		"source": { "value": "/devices/{deviceid}" },
		"datacontenttype": { "value": "application/json" }
	}
}
```
{% endcapture %}
{% include generated-output.html title="Effective definition passed to the template" content=resolved_message_output %}

This is not generated application code. It is the complete Message definition from which any selected client or specification template generates output. The important boundary is timing: inheritance disappears before rendering, so a template sees one coherent Message and application code never has to reconstruct the base definition.

## Keep reuse reviewable

Review the shared base Message with the same care as a public type. A change to its source template, content type, or schema selection can change every derived Message passed into generation. Use `xrcg validate` and build a representative generated project after such changes; the [gallery](https://xregistry.io/codegen/gallery/) is useful for comparing template outputs, but it is not a substitute for validating a team's own catalog.

## Primary sources

- **Implementation:** [`xrcg` alias resolution](https://github.com/xregistry/codegen/blob/main/docs/alias_resolution.md)
- **Implementation:** [`xrcg` base-message resolution](https://github.com/xregistry/codegen/blob/main/docs/basemessage_resolution.md)
- **Example:** [Contoso ERP catalog to AsyncAPI](https://xregistry.io/codegen/gallery/asyncapi-contoso-consumer/)
