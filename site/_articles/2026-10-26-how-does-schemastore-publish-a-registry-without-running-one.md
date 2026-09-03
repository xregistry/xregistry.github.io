---
title: "How Does SchemaStore Publish a Registry Without Running One?"
description: "SchemaStore uses the xRegistry reference server as a temporary build tool: load a clean registry, download a static tree, and publish the files after the process exits."
permalink: /blog/how-does-schemastore-publish-a-registry-without-running-one/
series_order: 24
perspective: Static-site case study
status: Publication draft
drafted: 2026-09-03
due: 2026-10-26
date: 2026-10-26 16:00:00 +0200
published: false
reading_time: 8 minutes
previous_slug: export-is-a-tooling-boundary
previous_title: Export Is a Tooling Boundary
next_slug: can-a-client-traverse-a-million-entry-registry
next_title: Can a Client Traverse a Million-Entry Registry?
---

A static website does not need a registry server to remain online after the site is built. SchemaStore's build integration uses the xRegistry reference server as a temporary compiler: create a clean registry, load the model and source data, download a static representation, then remove the container.

This is SchemaStore's build integration, not a required xRegistry publication pattern. It is valuable because every step is visible and because the output can be hosted as files.

## The script builds a disposable registry

The script starts `ghcr.io/xregistry/xrserver-all` with a repository mount, exposes port `8080`, and passes `--recreatedb`. It then waits until `http://localhost:8080` returns `200 OK` before continuing.

The clean state is intentional. The build begins from the repository's declared input rather than prior server state. That is appropriate for a reproducible site build and unsuitable for a shared registry whose accumulated data must survive.

One detail is worth reading literally: although the comment says “start or reuse,” the script exits when the named container is already running. It does not reuse it.

## Model, then source data

Next, the script downloads `model.json` from the xRegistry specification repository and runs `/xr model update` in the container. It then runs `/xr import` against SchemaStore's `registry.json`.

The order matters. The model tells the server which extension attributes and entity types it can interpret before it receives the registry data that uses them. The script checks the model-update command's result. It does not immediately check the import command's result, an observed property of this script rather than a general recommendation for build automation.

## Downloaded files outlive the process

The script runs `/xr download --index index.json` into a temporary directory in the container, packs that directory into a tar archive, copies the archive to the host export directory, extracts it, and deletes the archive. Finally it stops and removes the container.

The published artifact is therefore the downloaded tree, not the database or server process. A static host can serve that tree after the build container has gone away. Rebuilding it requires rerunning the import and download path with the selected inputs.

The readiness loop has no explicit timeout. In a production build pipeline, timeout, cleanup on failure, and checks for every consequential command are useful safeguards. They do not alter the central strategy: use the live server only long enough to validate and materialize static registry content.

## Why this pattern is useful

The build assigns separate roles to the server and the static host. The server interprets and materializes registry data. The static host distributes a known result. The first job can run in a controlled build environment; the second can remain simple and inexpensive.

The output is still only as current as the last build. A team needs a trigger for source or model changes, and it needs to decide whether the deployed tree is public. Static distribution makes metadata easy to consume, so publishing rules still matter.

## Primary sources

- **Observed implementation:** SchemaStore build integration, reviewed 2026-09-03
- **Implementation:** [`xr download` reference](https://github.com/xregistry/server/blob/master/docs/xr_help.md#L413-L418)
- **Normative:** [Core specification, Registry Views](https://github.com/xregistry/spec/blob/main/core/spec.md#design-registry-views)