---
title: "How Does a Client Find a Registry?"
description: "xRegistry discovery starts from a known host, registry URL, or webpage and returns candidate registry roots that a client still needs to inspect."
permalink: /blog/how-does-a-client-find-a-registry/
series_order: 5
perspective: Registry discovery
status: Publication draft
drafted: 2026-08-25
date: 2026-10-21
published: false
reading_time: 7 minutes
previous_slug: can-this-registry-do-what-its-model-describes
previous_title: Can This Registry Do What Its Model Describes?
next_slug: what-exactly-does-an-http-get-return
next_title: What Exactly Does an HTTP GET Return?
---

A client often begins with a product page, service hostname, or API URL rather than a registry root. It knows where the workload lives, but not where its contracts live.

xRegistry defines ways to move from that known web context to one or more candidate registries. It does not define a global search engine for registries. Discovery starts somewhere the client already has reason to trust.

Consider a developer reading this product page:

```text
https://docs.example.com/products/boiler
```

The schemas and message definitions may live at another host:

```text
https://metadata.example.com/boiler-registry
```

The client needs a link between those locations. It also needs to remember that finding a URL is only the first step.

## A webpage can point to its registry

A webpage can advertise an associated registry with a `link` element:

```html
<link
  rel="alternative"
  type="application/xregistry+json"
  href="https://metadata.example.com/boiler-registry">
```

The [`alternative` relation](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#webpage-based-discovery) and media type tell an xRegistry-aware browser extension, coding agent, or documentation tool what the link represents.

This mechanism is useful when contracts belong to a product, documentation set, or developer portal rather than to the webpage's own host. The page owner chooses the association explicitly.

The link identifies a candidate registry location. It does not prove that the registry is reachable, that the current user may read it, or that its model contains the expected contract types.

## A host can advertise several registries

When a client knows a host, it can look for the recommended well-known endpoint:

```text
GET https://metadata.example.com/.well-known/xregistry
```

When supported, the response contains a `registries` array of absolute registry URLs. A host may advertise one registry for product contracts, another for internal operational metadata, and another for a partner-facing catalog.

That makes host discovery a directory, not a selection algorithm. The client still needs to retrieve the candidates and inspect their models, descriptions, and access behavior.

Discovery is also bounded by the host. It does not search DNS, crawl linked sites, or establish a federation protocol.

## A registry can advertise related registries

After finding one registry, a client can also try the optional registry-relative discovery path:

```text
GET https://metadata.example.com/boiler-registry/.xregistry
```

This path is relative to the registry root. It can list the current registry and related registries known to that deployment.

Host-based and registry-based discovery may return the same URL. A client should normalize and deduplicate the results. It should try both mechanisms when appropriate because a static host, reverse proxy, or hosting platform may make only one of them practical.

Related does not mean interchangeable. Two registries may use different models, contain different environments, or require different credentials.

## An API response can identify its root

Once a client is already talking to an xRegistry HTTP endpoint, successful responses should identify the registry root with a link header:

```http
Link: <https://metadata.example.com/boiler-registry>;rel=xregistry-root
```

This is useful when the client entered through a deep Resource URL, a redirect, or a link copied from another tool. The root gives it a stable place from which to interpret registry-relative paths and retrieve the model.

The header is not an internet-wide discovery mechanism. It answers a narrower question: “which registry root owns this response?”

## Discovery produces candidates, not trust

A careful client separates location from evaluation:

1. Collect registry URLs from the webpage, host, known registry, or response header.
2. Normalize and deduplicate them.
3. Retrieve each registry root and resolved model.
4. Check whether the model contains the needed Group and Resource types.
5. Check capabilities before requesting optional operations.
6. Apply the caller's authentication, authorization, and trust policy.

The order matters. A URL from a discovery document is not a registry identity, a security assertion, or proof of relevance. It is a locator supplied by a known context.

For example, a coding agent looking for the contract behind the boiler page may discover three registries. One contains deployment logs, one contains public product schemas, and one is inaccessible. Reading the models lets the agent select the schema registry without guessing from hostnames.

## Discovery should fail plainly

The mechanisms are recommended or optional, so a client must handle their absence. A missing well-known path does not prove that no registry exists. A webpage may provide the only link. A known API response may provide the root header. A user may need to supply a registry URL directly.

The client should also avoid silently choosing the first candidate. When several registries fit, it can present their descriptions or require a configured selection rule. Quietly taking the first URL turns ordering in a discovery document into an accidental policy.

Discovery gets a client to the front door. The registry model, capabilities, and caller policy determine what happens next.

## Primary sources

- [Core specification v1.0-rc4, Host-based Discovery](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#host-based-discovery)
- [Core specification v1.0-rc4, Registry-base Discovery](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#registry-base-discovery)
- [Core specification v1.0-rc4, Webpage-based Discovery](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#webpage-based-discovery)
- [HTTP binding v1.0-rc4, xRegistry Discovery](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#xregistry-discovery)
- [HTTP binding v1.0-rc4, xRegistry Root HTTP Header](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#xregistry-root-http-header)