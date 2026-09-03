---
title: "What Does the xRegistry CLI Add to the API?"
description: "The reference implementation's xr command makes registry operations usable in build scripts while leaving the xRegistry model and HTTP contract unchanged."
permalink: /blog/what-does-the-xregistry-cli-add-to-the-api/
series_order: 13
perspective: Server tooling and automation
status: Publication draft
drafted: 2026-09-03
due: 2026-10-07
date: 2026-10-07 16:00:00 +0200
published: false
reading_time: 7 minutes
previous_slug: is-this-write-a-replacement-a-patch-or-an-import
previous_title: Is This Write a Replacement, a Patch, or an Import?
next_slug: versioning-is-five-separate-questions
next_title: Versioning Is Five Separate Questions
---

An API can be correct and still be awkward to use in a build script. A script needs repeatable commands, file input, clear output, and a way to select its target without rebuilding HTTP requests by hand. The xRegistry reference implementation includes `xr`, a command-line client for that work.

`xr` is not part of the xRegistry protocol. It is a convenience surface provided by this implementation, which its [README describes as work in progress](https://github.com/xregistry/server/blob/master/README.md). The registry model and API remain the contract; the CLI makes them easier to compose in automation.

## Commands map work into scripts

The [`xr` command reference](https://github.com/xregistry/server/blob/master/docs/xr_help.md) groups common registry work into commands including `create`, `get`, `update`, `set`, `delete`, `import`, `download`, `model`, and `serve`.

That lets a script state its intent directly:

```sh
xr model update @model.json
xr import -d @registry.json
xr download ./registry-site
```

The exact commands and options are implementation behavior, not portable xRegistry syntax. They are still useful because a build can inspect, log, and test each step separately.

## Input can come from files, URLs, or a pipeline

Automation rarely keeps all registry data in a command line. The CLI accepts model content directly, from a file or URL with `@FILE` or `@URL`, and from standard input with `@-` for [`xr model update`](https://github.com/xregistry/server/blob/master/docs/xr_help.md#L329-L337). Similar patterns let scripts keep large JSON documents under version control rather than embedded in shell code.

That convenience needs normal operational discipline. A URL is an input dependency. A pipeline needs error handling. A file may contain data that should not become a build log. The CLI removes repetitive request construction; it does not decide those policies.

## Target and credentials are deployment choices

The client can select a registry server through `--server`, `XR_SERVER`, or its configuration. Its configuration can also add headers to client requests, as documented in the [configuration reference](https://github.com/xregistry/server/blob/master/docs/xr_help.md#L420-L442).

This is useful for a local container, a test environment, and a protected production service. It also means scripts must keep credentials out of repository files and static output. The server address and headers are operational configuration, not attributes of a schema or message contract.

## When to use `xr`

Use `xr` when a script needs to manage or materialize registry data. Use the API directly when an application needs library-level control over requests, authentication, retries, or response handling. Neither choice changes the xRegistry entities that Articles 1 through 10 describe.

The CLI is a useful adapter between a registry and ordinary build tooling. It should remain just that.

## Primary sources

- **Implementation:** [xRegistry server README](https://github.com/xregistry/server/blob/master/README.md)
- **Implementation:** [`xr` command reference](https://github.com/xregistry/server/blob/master/docs/xr_help.md)
- **Implementation:** [`xr model update` input reference](https://github.com/xregistry/server/blob/master/docs/xr_help.md#L329-L337)