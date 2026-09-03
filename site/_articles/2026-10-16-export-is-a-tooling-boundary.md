---
title: "Export Is a Tooling Boundary"
description: "xRegistry export turns a live metadata graph into portable input for generators, documentation, configuration, review, and reproducible builds."
permalink: /blog/export-is-a-tooling-boundary/
series_order: 23
perspective: Tooling and provenance
status: Publication draft
drafted: 2026-08-24
due: 2026-10-16
date: 2026-10-16 16:00:00 +0200
published: false
reading_time: 9 minutes
previous_slug: who-tells-tools-that-the-registry-changed
previous_title: Who Tells Tools That the Registry Changed?
next_slug: how-does-schemastore-publish-a-registry-without-running-one
next_title: How Does SchemaStore Publish a Registry Without Running One?
---

A generator needs a stable input it can store with a build, review in a pull request, or hand to another tool. It does not need an API response shaped for interactive browsing. xRegistry's `GET /export` produces a document view of the registry; it is portable input for generators, not an SDK, web page, or broker configuration by itself.

## One graph, three acquisition modes

The [core specification's registry views](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-registry-views) describe a single-document view, an API view, and a multiple-document view. They project the same Group, Resource, and Version hierarchy differently.

A generator can therefore acquire xRegistry metadata in three broad ways:

| View | Typical acquisition | Useful property |
| --- | --- | --- |
| Document | Read one JSON file | Bounded, portable input |
| API | Traverse registry URLs | Selective and potentially current data |
| Static multiple-document | Follow files and links | Read-only distribution without an application server |

In API view, a client can begin at `/`, follow `/messagegroups/WaterBoiler.Events`, then retrieve a message and its schema. That is useful when the client needs only part of a large graph. In document view, those collections can be inlined into one object. In a static tree, equivalent records can be published as separately addressable files.

A build tool must convert all three input modes into the same internal graph if it supports all three.

## What `GET /export` guarantees

In the HTTP binding, [`GET /export`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#get-export) MUST be an alias for:

```http
GET /?doc&inline=*,capabilities,modelsource
Accept: application/json
```

If `/export` is supported, it MUST NOT support HTTP update methods. The endpoint exists as shorthand for retrieving the entire Registry as one document and for servers, including static “no-code” servers, that cannot process query parameters. Supported request flags MAY be supplied. An explicit `inline` value overrides the default.

The response is input for other tools. The [`doc` flag](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#doc-flag) applies document-view serialization rules, including removal of information duplicated between a Resource and its default Version. The default inline set also includes `capabilities` and `modelsource`, but not the resolved `model`. An offline tool that needs the full resolved model must request and bundle `model`, or reconstruct it by combining `modelsource` with the applicable core and extension definitions and resolving its include and import directives.

A tool can retrieve the export with a normal HTTP request:

```sh
curl --fail --silent --show-error \
  -H 'Accept: application/json' \
  https://registry.example.com/export \
  --output registry.xreg.json
```

## From export to an artifact graph

Return to the pinned Water Boiler contract from the previous article. Its paths provide concrete generator inputs:

```text
/endpoints/WaterBoiler.Producer
/messagegroups/WaterBoiler.Events/messages/WaterBoiler.TemperatureUpdate
/schemagroups/WaterBoiler/schemas/
  WaterBoiler.TemperatureUpdateEventData/versions/1
```

A tool can follow the endpoint to the message group, a message's `dataschemauri` to a Schema Resource, and that Resource to Version `1`. It can keep those source paths with the generated artifacts.

The two JSON Schemas can produce language-specific data types or validator bundles. For example, `TemperatureUpdateEventData` can produce fields for `boilerId`, `temperature`, and `timestamp`. The generator must keep the schema's rules: `temperature` is a JSON number, `timestamp` is an integer, and additional properties are allowed. It must not generate an `on | off` enum because the Status schema gives those values only as examples.

The message definitions can also produce messaging constants and adapters, such as topic templates, QoS values, and retain settings. Generated code must require callers to supply `boilerId` because the export has no runtime device identifier. It must also keep a topic template separate from a client connection or publication.

A renderer can turn the graph into an endpoint-to-message-to-schema catalog with source links for every table row. A graph-derived page can fail its build when a reference no longer resolves. Display machine constraints separately from descriptions so readers do not confuse “e.g., on/off” with an enforced enum.

Endpoint URIs, protocols, and protocol options can provide non-secret application settings or deployment templates. The generated settings still need deployment checks. Registry metadata can describe an endpoint without proving reachability, and credentials must come from a secret system rather than an export.

The xRegistry specification does not require any of these outputs. Its default export supplies a portable graph, capabilities, and `modelsource`. Each generator must define and test its own behavior and obtain the resolved model information it needs.

## A reproducible generation pipeline

A repeatable pipeline records its input document, selected versions, and generator configuration.

Record an input manifest beside generated artifacts. At minimum, capture:

- the retrieval URI and selected view
- the exact export bytes or a content digest such as SHA-256
- the generator name and immutable version
- generator options and target language or renderer
- identifiers and Version paths used for each output
- external references that were followed, with their resolved digests
- validation results and the model against which validation ran.

A generated file can contain a short link to this manifest instead of a vague “generated, do not edit” banner. The manifest records which registry entity and generator invocation produced each output.

Identical inputs must produce identical build outputs. Sort map keys before iteration, do not embed the wall-clock time in artifacts, choose line endings explicitly, and compare outputs byte for byte in continuous integration. If generation depends on a timestamp, network response, or platform default, record that dependency. Without that record, the build is not reproducible.

xRegistry IDs are case-sensitive, and Resource and Version identities are distinct in the core model. A generator cannot lowercase identifiers for convenience or collapse all Versions into one anonymous schema. Target-language name conversion can be necessary, but the generator must keep the original `xid` or path in a source map that records which registry entity produced each file.

## Default Versions and moving references

Reference resolution can change the effective build input.

In the Water Boiler sample, each `dataschemauri` ends at a Schema Resource:

```text
/schemagroups/WaterBoiler/schemas/WaterBoiler.StatusChangeEventData
```

It does not end at `/versions/1`. A Resource read represents its default Version. If that default changes in a mutable registry, two generation runs can resolve the same Resource URI to different content even when the message definition did not change.

During a build, resolve every Resource reference to a concrete Version and record both paths. If a release requires repeatable input, fail the build when an external or mutable reference cannot be pinned by content digest or immutable Version URI. Authors can still use Resource references, but the build must record the Version selected for each one.

External URIs add another boundary. An export can contain a reference whose target is not in the document. Saving the root export does not preserve that target. A reproducible bundle needs to vendor permitted dependencies, record immutable remote identifiers, or retain verified content digests. Otherwise, “same export” can still mean different effective input.

The manifest must also state how it calculates digests. A digest of the raw HTTP response covers the bytes retrieved. A digest of normalized JSON covers the selected canonical representation. Normal JSON reserialization is not a normative xRegistry canonical form.

## Static publication is still a projection

This website's pinned [`tools/buildsite` script](https://github.com/xregistry/xregistry.github.io/blob/2efb795b0f0bf0cef0effa7b087d079b3c3f0a9e/tools/buildsite) loads specification files into the reference server and uses `xr download` to produce the published `xreg/` directory. The result is a static, API-shaped tree with collection indexes, resource content, Version content, metadata details, capabilities, and an export document.

The script moves registry metadata through an API service into static artifacts, but the specification does not require this process. Unless `XR_SPEC` is supplied, the script clones the specification repository's current default branch. It does not place the imported source commit into every generated artifact. Pin the source revision in a release pipeline and publish it in a manifest.

Static output works well for documentation sites and release bundles because it can be cached, inspected, and hosted without a mutable registry service. API view supports selective discovery and updates. Document view provides a fixed interchange and build input. Export converts the API view into that document view.

## Record what the tool used

`GET /export` gives tools a portable graph, but repeatable output still depends on pinned references, recorded generator settings, and digests for every resolved input. Each toolchain must record the graph it read, the rules it applied, and the files it produced.

## Primary sources

- **Normative:** [Core specification v1.0-rc4, Registry Views](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-registry-views)
- **Normative:** [Core specification v1.0-rc4, Doc Flag](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#doc-flag)
- **Normative:** [Core specification v1.0-rc4, No-Code Servers](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-no-code-servers)
- **Normative:** [HTTP binding v1.0-rc4, `GET /export`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#get-export)
- **Non-normative context:** [Primer v1.0-rc4, Representations](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/primer.md#8-representations)
- **Observed input:** [Water Boiler sample at `d2433a8c`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/cloudevents/samples/scenarios/waterboiler-mqtt5-jsons07.xreg.json)
- **Observed implementation:** [Website build script at `2efb795b`](https://github.com/xregistry/xregistry.github.io/blob/2efb795b0f0bf0cef0effa7b087d079b3c3f0a9e/tools/buildsite)