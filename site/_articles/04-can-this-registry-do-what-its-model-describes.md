---
title: "Can This Registry Do What Its Model Describes?"
description: "The model describes valid registry data, while capabilities describe which optional behavior a particular xRegistry deployment makes available."
permalink: /blog/can-this-registry-do-what-its-model-describes/
series_order: 4
perspective: Deployment capabilities
status: Publication draft
drafted: 2026-08-25
due: 2026-09-02
date: 2026-09-02 16:00:00 +0200
published: false
reading_time: 7 minutes
previous_slug: the-model-is-part-of-the-program
previous_title: The Model Is Part of the Program
next_slug: how-does-a-client-find-a-registry
next_title: How Does a Client Find a Registry?
---

Two registries can describe the same schema contract while offering very different operations. One may be read-only; another may validate compatibility or allow model changes. xRegistry separates the model, which says what the data means, from capabilities, which say what this deployment actually lets a client do.

## The same model can support different deployments

Consider two registries that expose the same schema model.

The first is a service used by a development team. It accepts writes, supports filtering, validates selected schema formats, and allows administrators to update `modelsource`.

The second is a static website generated from an export. It serves the same kinds of Groups, Resources, Versions, and schema documents. It cannot process a `PATCH`, evaluate a filter, or run a compatibility check because there is no registry application behind the files.

The metadata can still be useful in both places. A client can inspect the model, follow references, and retrieve documents from either deployment. What differs is the set of operations each deployment can perform.

xRegistry permits this difference deliberately. The [no-code server design](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-no-code-servers) allows useful read-only projections without requiring every server feature.

## Four similar questions have different answers

The registry exposes several descriptions that clients can easily confuse:

| Question | Where to look |
| --- | --- |
| Which entity and attribute types exist? | `model` |
| Which custom definitions were supplied? | `modelsource`, when available |
| Which optional features are enabled now? | `capabilities`, when exposed |
| Which capability values can this server be configured to use? | `capabilitiesoffered`, when exposed |

The first two describe data semantics. The second two describe deployment behavior and configuration.

For example, the model may define `schemagroups` and a Schema Resource with a `format` attribute. This tells a generic tool how Schema entities are shaped. It does not prove that the deployment accepts writes to those collections. It also does not prove that the server understands every named schema format well enough to validate its documents.

## A modeled validation rule may be disabled

Resource model definitions include controls such as `validateformat`, `validatecompatibility`, and `strictvalidation`. These settings describe validation behavior for that Resource type. Their defaults matter: validation is not implied merely because a Resource carries a format or compatibility value.

A client therefore cannot reason as follows:

```text
This Resource has format = JSON Schema
therefore the server validated the document as JSON Schema
```

The first statement may be visible registry data. The second requires evidence that the applicable model enables validation and that the operation completed successfully under those rules.

Even then, successful registry validation says something specific: the document met the validation behavior implemented for that format and configuration. It does not prove that every producer emits valid instances or that every consumer handles them correctly.

## Optional flags need negotiation

The HTTP binding defines request flags for features such as filtering, inlining, sorting, and selecting document forms. Some operations and flags are optional so that implementations can match their environment.

A capable client should not discover support by sending an elaborate request and hoping for the intended interpretation. It should inspect the available capability information and handle unsupported behavior explicitly.

Suppose a registry explorer wants to retrieve one message and inline its referenced schema. It has three possible paths:

1. Ask the server to inline the relationship when the relevant capability is enabled.
2. Retrieve the message and follow the reference with another request.
3. Report that the operation is unavailable if the deployment exposes neither form.

The data relationship remains the same in all three cases. Capability negotiation changes how the client obtains it.

## Offered is not the same as enabled

`capabilities` and `capabilitiesoffered` serve different readers.

Enabled capabilities tell an ordinary client what it can use. Offered capabilities tell configuration tooling which values the server can support. A server might offer several configuration choices while enabling only one of them for the current registry.

This is similar to a database engine supporting several consistency modes while one database is configured for a particular mode. Software operating on the database needs the active setting. Software configuring the database may also need the available choices.

The HTTP binding makes the capability endpoints conditional. A client must also handle deployments that do not expose them. Absence is not permission to assume every optional feature.

## Descriptions do not grant authority

Capabilities describe protocol behavior. They do not replace authentication or authorization.

A registry may advertise write support while denying a particular caller permission to write. It may support model updates while reserving them for administrators. It may expose an Endpoint Resource containing authorization guidance without issuing the credentials needed to use that endpoint.

These are separate checks:

| Check | What it establishes |
| --- | --- |
| Model | The proposed data has a recognized shape |
| Capability | The deployment supports the requested kind of operation |
| Authorization | This caller may perform that operation |
| Operation result | This particular request succeeded or failed |

Skipping any one of them creates a different class of error.

## Design clients for graceful reduction

Optional behavior is most useful when clients can reduce their demands.

A registry browser can render known entities from the model even when filtering is unavailable. A generator can follow references itself when server-side inlining is unavailable. A static registry can remain a useful discovery surface even though it cannot accept updates.

This does not mean that clients should imitate every missing server feature. Large-scale filtering or compatibility validation may be too expensive or impossible without server support. The client should state the limitation instead of presenting a partial result as complete.

Read the model to understand the data, read capabilities to choose operations, and treat successful authorization and execution as separate evidence.

## Primary sources

- **Normative:** [Core specification v1.0-rc4, No-Code Servers](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#design-no-code-servers)
- **Normative:** [Core model specification v1.0-rc4, Resource validation controls](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/model.md#resourcesstringvalidateformat)
- **Normative:** [HTTP binding v1.0-rc4, Registry Capabilities](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#registry-capabilities)
- **Normative:** [HTTP binding v1.0-rc4, Feature flags](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#flags)