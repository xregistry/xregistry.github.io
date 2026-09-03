---
title: "What Is the xRegistry Server?"
description: "The xRegistry Server is an implementation of the xRegistry specification, with an HTTP API, command-line client, Explorer UI, and container packaging that remain separate from the protocol itself."
permalink: /blog/what-is-the-xregistry-server/
series_order: 2
perspective: Reference implementation
status: Publication draft
drafted: 2026-09-03
due: 2026-09-11
date: 2026-09-11 16:00:00 +0200
published: false
reading_time: 7 minutes
previous_slug: one-registry-three-views
previous_title: One Registry, Three Views
next_slug: where-does-the-metadata-end-and-the-document-begin
next_title: Where Does the Metadata End and the Document Begin?
---

The xRegistry specification defines a model and protocol behavior. It does not give you a process to run. The [xRegistry Server](https://github.com/xregistry/server/blob/master/README.md) is one implementation: an HTTP API server with the `xr` command-line client and a browser-based Explorer. It lets a team create, read, update, and distribute registry data while the specification remains the source of truth for what that data and API mean.

Keeping that separation clear prevents a common mistake. A feature of the server, its Explorer, its Docker image, or its database is not automatically a feature required by xRegistry. The [server design guide](https://github.com/xregistry/server/blob/master/DESIGN.md) states the boundary plainly: the specification governs API behavior, entity relationships, attributes, and protocol details; the server documents implementation choices around them.

## A server and a client

The server accepts xRegistry HTTP requests and persists registry state. The `xr` client makes common operations convenient in a terminal or build script. The [quick start](https://github.com/xregistry/server/blob/master/docs/quick_start.md) also exposes a browser Explorer at `/ui` for inspecting a running registry.

These tools solve different jobs:

- Use the HTTP API when an application needs to work with registry entities.
- Use `xr` when automation needs a command that reads, imports, updates, or downloads registry data.
- Use the Explorer when a person needs to inspect the registry in a browser.

All three work with the same registry model. None changes the meaning of a Group, Resource, Version, XID, or epoch.

## The container choice changes database ownership

The [installation guide](https://github.com/xregistry/server/blob/master/docs/installation.md) documents two relevant images. `xrserver` runs the API server and expects an external MySQL database. `xrserver-all` combines the API server with an embedded MySQL database for a quick start. Both include the `xr` client.

That difference is operational, not conceptual. An embedded database makes it easy to explore sample data locally. A shared service needs an explicit decision about database durability, backup, credentials, and network access. Later articles cover running the service behind a reverse proxy and using it as a short-lived static-site build tool.

## The reference implementation is not the whole standard

The current Core specification on `main` identifies itself as `1.0-rc4`, and the server's installation guide still marks authentication and parts of MySQL configuration as work in progress. Treat the server as a useful implementation with documented limits, not as a complete production recipe.

The server implements the model defined by the specification.

## Primary sources

- **Implementation:** [xRegistry Server README](https://github.com/xregistry/server/blob/master/README.md)
- **Implementation:** [xRegistry Server design guide](https://github.com/xregistry/server/blob/master/DESIGN.md)
- **Implementation:** [xRegistry Server quick start](https://github.com/xregistry/server/blob/master/docs/quick_start.md)
- **Implementation:** [xRegistry Server installation guide](https://github.com/xregistry/server/blob/master/docs/installation.md)
- **Normative:** [xRegistry Core specification, protocol bindings](https://github.com/xregistry/spec/blob/main/core/spec.md#design-protocol-bindings)