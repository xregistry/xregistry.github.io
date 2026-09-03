---
title: "What Is xRegistry Codegen?"
description: "The xrcg tool turns xRegistry message and endpoint definitions into SDK-like messaging projects for selected languages and protocols."
permalink: /blog/what-is-xregistry-codegen/
series_order: 27
perspective: Code-generation overview
status: Publication draft
drafted: 2026-09-03
due: 2026-10-26
date: 2026-10-26 16:00:00 +0200
published: false
reading_time: 6 minutes
previous_slug: what-survives-when-http-disappears
previous_title: What Survives When HTTP Disappears?
next_slug: what-can-xregistry-codegen-build
next_title: What Can xRegistry Codegen Build?
---

[xRegistry Codegen](https://xregistry.io/codegen/) is practical tooling for teams that already have an xRegistry catalog. Its `xrcg` command turns the catalog's Messages, Schemas, and Endpoints into an SDK-like project for a chosen language and messaging style.

It is not part of the xRegistry protocol and it does not replace a broker, deployment configuration, or integration testing. It gives those activities a useful starting point: generated clients, schema-derived types, build files, tests, and project documentation.

## From catalog to project

A basic generation command supplies a definition, target language, style, project name, and output directory:

{% capture codegen_command %}
```sh
xrcg generate --language py --style kafkaproducer \
  -d https://raw.githubusercontent.com/xregistry/codegen/main/samples/message-definitions/inkjet.xreg.json \
  --output ./output --projectname PrinterEvents
```
{% endcapture %}
{% include generated-output.html title="Documented Python Kafka quick start" content=codegen_command %}

The catalog supplies contract facts. The selected template supplies implementation choices such as the broker library, source layout, and language conventions. Keep both inputs under review: either can change the generated result.

## One Message, one Schema, one generated type

The [Lightbulb MQTT example](https://xregistry.io/codegen/gallery/py-mqtt-lightbulb/) makes the input-to-output relationship concrete. First, the xRegistry **Message** declares the CloudEvent type and selects its data contract with `dataschemauri`:

{% capture lightbulb_message_input %}
```json
"Fabrikam.Lumen.TurnedOn": {
  "envelope": "CloudEvents/1.0",
  "envelopemetadata": {
    "type": { "value": "Fabrikam.Lumen.TurnedOn" },
    "source": { "value": "{tenantid}/{deviceid}" }
  },
  "dataschemaformat": "Avro/1.11.1",
  "dataschemauri": "#/schemagroups/Fabrikam.Lumen/schemas/Fabrikam.Lumen.TurnedOnEventData"
}
```
{% endcapture %}
{% include generated-output.html title="xRegistry input: the TurnedOn Message" content=lightbulb_message_input %}

That URI selects the xRegistry **Schema** below. The example's full schema also declares `color`, `colorTemperature`, and `powerConsumption`; this excerpt shows the record name, two fields, and its enum:

{% capture lightbulb_schema_input %}
```json
"Fabrikam.Lumen.TurnedOnEventData": {
  "format": "Avro/1.11.1",
  "schema": {
    "type": "record",
    "name": "TurnedOnEventData",
    "fields": [
      { "name": "tenantid", "type": "string" },
      { "name": "deviceid", "type": "string" },
      { "name": "switchSource", "type": {
        "type": "enum", "name": "SwitchSource",
        "symbols": ["PhysicalSwitch", "AppSwitch", "VoiceSwitch"]
      }},
      { "name": "brightness", "type": "int" }
    ]
  }
}
```
{% endcapture %}
{% include generated-output.html title="xRegistry input: the TurnedOnEventData Schema" content=lightbulb_schema_input %}

For the Python MQTT template, that schema becomes `turnedoneventdata.py`; the enum becomes `switchsource.py`. These lines are quoted from the generated model:

{% capture lightbulb_model_output %}
```python
@dataclass_json(undefined=Undefined.EXCLUDE)
@dataclass
class TurnedOnEventData:
    tenantid: str = dataclasses.field(kw_only=True)
    deviceid: str = dataclasses.field(kw_only=True)
    switchSource: SwitchSource = dataclasses.field(kw_only=True)
    brightness: int = dataclasses.field(kw_only=True)
```
{% endcapture %}
{% include generated-output.html title="Generated Python output: TurnedOnEventData" content=lightbulb_model_output %}

The template also generates the client method for this particular Message. Notice how the Message name becomes `publish_fabrikam_lumen_turned_on`, the Schema becomes its `data` parameter type, and the Message's CloudEvent metadata is used to build `attributes`:

{% capture lightbulb_client_output %}
```python
async def publish_fabrikam_lumen_turned_on(
  self, _id: str, tenantid: str, deviceid: str,
  data: lightbulb_data.fabrikam.lumen.TurnedOnEventData,
  topic: Optional[str] = None,
  content_type: str = "application/json"
) -> None:
  attributes = {
    "id": _id,
    "type": "Fabrikam.Lumen.TurnedOn",
    "source": "{tenantid}/{deviceid}".format(
      tenantid=tenantid, deviceid=deviceid
    ),
    "datacontenttype": "application/json"
  }
  byte_data = data.to_byte_array(content_type)
```
{% endcapture %}
{% include generated-output.html title="Generated Python output: Message-specific MQTT client method" content=lightbulb_client_output %}

The application then supplies values and calls the generated client. This last step is application code, not generated output:

{% capture lightbulb_application_call %}
```python
import paho.mqtt.client as mqtt

from lightbulb_data import SwitchSource, TurnedOnEventData
from lightbulb_mqtt_client.client import FabrikamLumenMqttClient

mqtt_client = mqtt.Client(client_id="lightbulb-controller")
client = FabrikamLumenMqttClient(mqtt_client, content_mode="structured")
await client.connect("mqtt.example.com", 1883)

data = TurnedOnEventData(
  tenantid="northwind",
  deviceid="bulb-17",
  switchSource=SwitchSource.AppSwitch,
  brightness=800,
  color="#ffffff",
  colorTemperature=2700,
  powerConsumption=8.5,
)

await client.publish_fabrikam_lumen_turned_on(
  _id="5a1f1f72-3e42-4ab6-b358-4c548e1bd7d9",
  tenantid=data.tenantid,
  deviceid=data.deviceid,
  data=data,
)

await client.disconnect()
```
{% endcapture %}
{% include generated-output.html title="Application code: construct the model and call the generated client" content=lightbulb_application_call %}

The relationship is deliberate and inspectable: `Fabrikam.Lumen.TurnedOn` identifies the event, its `dataschemauri` identifies `Fabrikam.Lumen.TurnedOnEventData`, and that record's name, fields, and enum emerge as the Python class and its `SwitchSource` dependency. The generated client turns those contract details into a typed publishing method. Broker address, client lifecycle, credentials, and application behavior remain the team's code.

That is the useful promise of code generation: a device-event catalog becomes a project whose names and types describe the actual integration work. Browse the [full gallery](https://xregistry.io/codegen/gallery/) to compare it with ERP, telemetry, and API-description examples.

## Primary sources

- **Implementation:** [xRegistry Codegen home and gallery](https://xregistry.io/codegen/)
- **Example:** [Lightbulb to Python MQTT client](https://xregistry.io/codegen/gallery/py-mqtt-lightbulb/)
- **Implementation:** [`xrcg generate` command documentation](https://github.com/xregistry/codegen/blob/main/docs/commands/generate.md)
