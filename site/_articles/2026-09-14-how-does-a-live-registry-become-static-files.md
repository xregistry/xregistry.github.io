---
title: "How Does a Live Registry Become Static Files?"
description: "The xRegistry reference client's download command turns a live registry into a static directory tree that can be reviewed, built, and hosted without leaving the server running."
permalink: /blog/how-does-a-live-registry-become-static-files/
series_order: 9
perspective: Server tooling and static distribution
status: Publication draft
drafted: 2026-09-03
due: 2026-09-14
date: 2026-09-14 16:00:00 +0200
published: false
reading_time: 8 minutes
previous_slug: running-an-xregistry-server-behind-a-reverse-proxy
previous_title: Running an xRegistry Server Behind a Reverse Proxy
next_slug: how-much-of-the-graph-should-a-client-read
next_title: How Much of the Graph Should a Client Read?
---

A live registry is useful for selective reads and controlled updates. A documentation site, a code generator, or a release artifact often needs something different: a fixed copy that can be checked into a build, reviewed, and served from ordinary static hosting. The [xRegistry reference client](https://github.com/xregistry/server/blob/master/README.md) provides `xr download` to make that copy.

The command is a bridge between a registry API and a static directory tree. It does not turn static files into a live registry. The result is a snapshot, and someone must run the process again when the registry changes.

## Downloading is a materialization step

The [`xr download` command](https://github.com/xregistry/server/blob/master/docs/xr_help.md#L413-L418) reads a registry and writes a static representation to a directory. In its smallest form, a build can use a command like this:

```sh
xr download ./registry-site
```

The command needs a target registry, supplied through the client's server setting, environment, or configuration. The exact authentication and URL setup belong to the deployment. The useful point is that the artifact is now a directory rather than a process with a database connection.

That difference matters in several ordinary workflows:

- A documentation build can link directly to schemas, messages, and endpoint descriptions.
- A code-generation job can use one fixed input while the live registry continues to change.
- A release can retain the contract view that was available when it was built.
- A static host can publish a read-only registry without running the API server.

The [Core specification's registry views](https://github.com/xregistry/spec/blob/main/core/spec.md#design-registry-views) establish the important boundary. API, single-document, and multiple-document views are projections of one registry model. `xr download` is reference-server tooling that produces one static projection; it is not a new model or a general protocol requirement.

## A build can treat the registry as an input

Consider a project that owns a live contract registry and publishes developer documentation. Its build can perform four separate steps:

1. Read the selected registry state.
2. Download the static tree into the build workspace.
3. Generate documentation or client inputs from that tree.
4. Publish the resulting files through a static host.

Each step has a visible input and output. That makes the workflow easier to reproduce than a generator that quietly calls a production registry while it runs.

The approach is especially useful when a build needs a reviewable record. The downloaded files can be retained as a release artifact or compared with a prior export. They still need normal handling for sensitive metadata. A static copy is easier to distribute, which means it is also easier to distribute too widely.

## Static hosting changes the operational contract

The same client also offers [`xr serve DIR`](https://github.com/xregistry/server/blob/master/docs/xr_help.md#L350-L359), a simple HTTP file server for a directory. It is useful for inspecting a downloaded tree locally, but it does not make the directory equivalent to a full registry service.

A static host generally cannot perform registry writes, evaluate authorization policy, negotiate dynamic responses, or expose server-specific operational features. It serves the files that were built. Readers should therefore use a static tree when they need a portable, read-only view and use an API server when they need current data or mutations.

The split gives build tools a stable artifact while leaving live-registry responsibilities with the API service.

## Decide what snapshot means

Before publishing static registry files, decide these questions explicitly:

1. Which registry URL and revision does the build read?
2. How are credentials supplied without entering the output directory?
3. Where will the downloaded tree be retained or reviewed?
4. How does a changed registry trigger a new build?
5. Which readers need the static view, and which need a live API?

The answers turn `xr download` from a convenient command into a repeatable publication boundary. A later article examines a public example in which SchemaStore uses the server as a short-lived build step to produce a static site.

## Primary sources

- **Implementation:** [xRegistry server README](https://github.com/xregistry/server/blob/master/README.md)
- **Implementation:** [`xr download` command reference](https://github.com/xregistry/server/blob/master/docs/xr_help.md#L413-L418)
- **Implementation:** [`xr serve` command reference](https://github.com/xregistry/server/blob/master/docs/xr_help.md#L350-L359)
- **Normative:** [Core specification, Registry Views](https://github.com/xregistry/spec/blob/main/core/spec.md#design-registry-views)