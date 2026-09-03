---
title: "The Model Is Part of the Program"
description: "An xRegistry model defines entity shapes, extension attributes, constraints, and validation rules so tools can understand a registry."
permalink: /blog/the-model-is-part-of-the-program/
series_order: 4
perspective: Model-driven contracts
status: Publication draft
drafted: 2026-08-24
due: 2026-09-21
date: 2026-09-21 16:00:00 +0200
published: false
reading_time: 9 minutes
previous_slug: where-does-the-metadata-end-and-the-document-begin
previous_title: Where Does the Metadata End and the Document Begin?
next_slug: can-this-registry-do-what-its-model-describes
next_title: Can This Registry Do What Its Model Describes?
---

A tool that only knows how to read JSON still needs to know which JSON it is looking at. Is this a schema, a message, an endpoint, or an allowed extension? xRegistry publishes that information as a machine-readable model, so browsers, validators, and generators can discover the registry's shape instead of carrying every domain type in their code.

## The registry describes its own shape

The [model specification defines the Registry model](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/model.md#registry-model) as the definition of the Groups, Resources, attributes, and permitted changes to specification-defined attributes that a Registry instance supports. The specification explicitly says this information is intended for tooling that does not know the Registry structure in advance.

The model has three layers:

| Model layer | What it declares | Example question it answers |
| --- | --- | --- |
| Registry | Top-level attributes and Group types | Does this registry have `schemagroups` or a custom `catalogs` collection? |
| Group type | Group attributes, Resource types, and constraints | Which Resources can appear here, and what Group policy applies? |
| Resource type | Version policy, document behavior, and Resource, Meta, and Version attributes | Does this Resource carry a document? Can clients choose Version IDs? |

The hierarchy is Registry, Groups, Resources, and Versions. Registry data contains the entities. Model data defines which entities and values are valid.

The pinned [author-supplied sample model](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/sample-model.json) defines a custom registry with a `dirs` Group type and a `files` Resource type in a small JSON object. The corresponding [resolved full model](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/sample-model-full.json) adds core attributes and collections. These files show the source model and the resolved model. They do not require every implementation to build the resolved model in the same way.

## Model source in, resolved model out

xRegistry distinguishes `modelsource` from `model`. The names are close, but their jobs are different.

The [`modelsource` attribute](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#modelsource-attribute) represents customizations or extensions supplied on top of the base xRegistry model. The [`model` attribute](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#model-attribute) is the complete, read-only description of specification-defined and extension-defined Groups, Resources, and attributes.

The [retrieval rules](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/model.md#retrieving-the-registry-model) call `modelsource` a semantic subset of `model`. In the HTTP binding, `GET /model` is mandatory, while `GET /modelsource` and `PUT /modelsource` are optional. Clients must check whether the server allows model changes.

An illustrative `modelsource` might look like this:

```json
{
  "groups": {
    "catalogs": {
      "singular": "catalog",
      "attributes": {
        "environment": {
          "type": "string",
          "enum": ["development", "production"],
          "strict": true,
          "required": true
        }
      },
      "constraints": {
        "artifacts.environment": { "equals": "environment" }
      },
      "resources": {
        "artifacts": {
          "singular": "artifact",
          "hasdocument": false,
          "maxversions": 1,
          "attributes": {
            "environment": { "type": "string", "required": true },
            "kind": {
              "type": "string",
              "enum": ["library", "service"],
              "strict": true,
              "required": true
            }
          }
        }
      }
    }
  }
}
```

This example declares a Group type, a Resource type, two typed Version attributes, and a single-Version policy. It also requires every artifact Version's `environment` to match its catalog's `environment`. The example shows the model language. The specification does not require this catalog.

## Attributes carry behavior

A field list would only describe the data. Attribute definitions also tell software how to process it.

An attribute definition can specify a `type`, scalar `enum`, whether the enum is `strict`, whether a value is `required` or `readonly`, a `default`, nested object attributes, array or map item definitions, and conditional sibling attributes through `ifvalues`. The [attribute rules](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/model.md#attributes) assign processing semantics to those declarations.

| Declaration | Consequence |
| --- | --- |
| `required: true` | A non-null value MUST exist after processing. The client need not supply it if the server supplies a default. |
| `readonly: true` | The server controls the value. Supplied values are generally ignored, with defined exceptions such as IDs and epochs. |
| `enum` plus `strict: true` | Values outside the set MUST produce an error. |
| `ifvalues` | A scalar value activates additional sibling attribute definitions. |
| `*` attribute | Undefined extension names are accepted at that level according to its type. Without `*`, unknown runtime attributes produce an error. |

The model's `immutable` marker has a strict limit. It is reserved for server-controlled, specification-defined attributes and MUST NOT be used for extension attributes. A custom model can require and type an extension attribute, but it cannot apply every core lifecycle rule to that attribute.

Extensions can add domain terms without changing the protocol's identity rules.

## Constraints connect levels

Attributes validate values in one entity. Group constraints apply rules across a Group.

A Group type's [`constraints` map](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/model.md#groupsstringconstraints) can provide a Group-specific `default`, narrow an attribute's allowed `enum`, or require a Resource attribute to `equal` a Group attribute. These constraints apply to all Versions of all Resources in Group instances and MUST produce `constraint_failure` when violated. They may narrow Resource rules. They MUST NOT broaden them.

The Resource definition adds more rules. `maxversions`, `setversionid`, `hasdocument`, and `versionmode` control the Version lifecycle and document form. `validateformat`, `validatecompatibility`, and `strictvalidation` control whether and how the server validates documents and declared compatibility. Validation switches default to `false`. A client must read the model. Storing a format does not mean the registry validates it.

## Capabilities answer a different question

The model says what data means. Capabilities say what this server currently offers.

The HTTP binding defines `GET /capabilities` for enabled features and `GET /capabilitiesoffered` for the values a mutable server can offer. The latter endpoint is conditional. The [capability operations](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#registry-capabilities) distinguish whether model updates are enabled, which flags are available, and which specification versions are supported.

| Question | Read this |
| --- | --- |
| What entity and attribute types exist? | `GET /model` |
| What domain customizations produced that model? | `GET /modelsource`, if available |
| Which operations and flags are enabled? | `GET /capabilities`, if exposed |
| Which settings could this server enable? | `GET /capabilitiesoffered`, if exposed |

Clients need both sets of information. “Schemas exist” does not mean “schema writes are enabled.” “A format attribute exists” does not mean “the server validates that format.” The model describes the data and its rules. Capabilities describe the operations that the server supports.

## What tools can infer

With the resolved model, tools can use declared rules instead of guessing from names. A generic explorer can list Group and Resource types. A form generator can choose controls from types and strict enums. A validator can find missing required values. A client can follow typed XID targets. A migration tool can compare model definitions and find a new required field.

The specification defines the model rules, but it does not provide these tools. Each tool must implement the rules, inspect capabilities before using operations, and keep descriptions separate from enforced rules.

The model stores domain metadata with the rules for reading it. Conforming software uses the model as input and can inspect it to discover the registry's structure.

## What to carry forward

Model data gives tools types, boundaries, and constraints. Typed XID attributes and cross-references then link one part of the registry to another. The next article explains how messages use those links to connect metadata with payload schemas.

## Primary sources

- **Normative:** [Core model specification v1.0-rc4, Registry Model](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/model.md#registry-model)
- **Normative:** [Core model specification v1.0-rc4, Attributes](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/model.md#attributes)
- **Normative:** [Core model specification v1.0-rc4, Group Constraints](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/model.md#groupsstringconstraints)
- **Normative:** [Core model specification v1.0-rc4, Retrieving and Updating Models](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/model.md#retrieving-the-registry-model)
- **Normative:** [Core specification v1.0-rc4, Model Attribute](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#model-attribute)
- **Normative:** [HTTP binding v1.0-rc4, Registry Model](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#registry-model)
- **Observed:** [Core sample model at the pinned revision](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/sample-model.json)