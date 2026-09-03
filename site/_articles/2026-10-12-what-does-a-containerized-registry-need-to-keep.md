---
title: "What Does a Containerized Registry Need to Keep?"
description: "A registry container is only one part of this reference implementation's deployment: its MySQL-backed state, credentials, backups, and reset behavior need separate operational decisions."
permalink: /blog/what-does-a-containerized-registry-need-to-keep/
series_order: 21
perspective: Server deployment
status: Publication draft
drafted: 2026-09-03
due: 2026-10-12
date: 2026-10-12 16:00:00 +0200
published: false
reading_time: 7 minutes
previous_slug: following-the-water-boiler-contract-graph
previous_title: Following the Water Boiler Contract Graph
next_slug: who-tells-tools-that-the-registry-changed
next_title: Who Tells Tools That the Registry Changed?
---

Starting a registry in a container is quick. The deployment question is which state must survive container replacement. The xRegistry reference server is a MySQL-backed implementation, so its registry contents, database lifecycle, credentials, and backups need explicit treatment.

MySQL is not an xRegistry requirement. The [server design document](https://github.com/xregistry/server/blob/master/DESIGN.md) distinguishes implementation choices from the protocol's observable behavior. Another implementation can make different storage decisions and still conform to the same registry model.

## A server process is not the registry's lifetime

The reference server documents MySQL as an implementation choice. For an operator, that means a server restart and a database reset are different events. A short-lived container can be appropriate for a build. A shared registry needs durable storage and a recovery plan.

Before treating a container as a service, decide:

- where database data persists;
- how backups are taken and restored;
- how client and database credentials are supplied and rotated;
- who may reset or migrate the database; and
- how an update is tested before it changes the shared registry.

Those choices are ordinary service operations, but contract metadata can affect every generator and integration that depends on it. Losing the registry means losing more than a web application cache.

## Images simplify packaging, not operations

The [installation options](https://github.com/xregistry/server/blob/master/docs/installation.md) and [quick start](https://github.com/xregistry/server/blob/master/docs/quick_start.md) use container images for local setup. A combined image can be convenient when a build needs both the server and `xr` for a short task. It does not make persistence, database access, or credentials disappear.

Treat the project's [quick start](https://github.com/xregistry/server/blob/master/docs/quick_start.md) as a useful development path, then make the production decisions visible in deployment configuration and runbooks.

## Keep destructive actions deliberate

A clean database is useful when a build imports known source data and exports a disposable artifact. It is dangerous when users expect their edits to remain. Do not copy reset options from a build into a persistent deployment without verifying their behavior for the selected image version.

The next tooling article shows this boundary in a real build: SchemaStore starts a clean reference-server container, materializes static files, and then removes the container. That works because the registry is build input, not long-lived shared state.

## Primary sources

- **Implementation:** [xRegistry server design document](https://github.com/xregistry/server/blob/master/DESIGN.md)
- **Implementation:** [installation options](https://github.com/xregistry/server/blob/master/docs/installation.md)
- **Implementation:** [quick start](https://github.com/xregistry/server/blob/master/docs/quick_start.md)