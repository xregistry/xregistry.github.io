---
title: "Running an xRegistry Server Behind a Reverse Proxy"
description: "Run the xRegistry reference server in a container, expose it through a reverse proxy, and treat authentication and trusted identity headers as deployment policy rather than registry metadata."
permalink: /blog/running-an-xregistry-server-behind-a-reverse-proxy/
series_order: 8
perspective: Server deployment and authentication
status: Publication draft
drafted: 2026-09-03
due: 2026-09-11
date: 2026-09-11 16:00:00 +0200
published: false
reading_time: 8 minutes
previous_slug: what-exactly-does-an-http-get-return
previous_title: What Exactly Does an HTTP GET Return?
next_slug: how-does-a-live-registry-become-static-files
next_title: How Does a Live Registry Become Static Files?
---

A registry server is not only a JSON API. It is a service that needs a database, an HTTPS boundary, and a clear answer to who may read or change contract metadata. The [xRegistry reference server quick start](https://github.com/xregistry/server/blob/master/docs/quick_start.md) runs the service and an embedded MySQL database in one container. A production deployment normally puts that container behind a reverse proxy that owns public TLS and authentication.

The [reference-server installation guide](https://github.com/xregistry/server/blob/master/docs/installation.md) says its built-in authentication guidance is still work in progress. That makes the boundary important: a reverse proxy can authenticate callers, but authorization decisions require an explicit policy and a trusted way to pass identity to the registry service.

## Start with a container for local work

The documented quick start runs the combined image and exposes port `8080`:

```sh
docker run -ti -p 8080:8080 ghcr.io/xregistry/xrserver-all --samples
```

This is a useful way to explore sample registries. The combined image includes the API server and an embedded MySQL database. The [installation options](https://github.com/xregistry/server/blob/master/docs/installation.md) also distinguish an `xrserver` image, which needs an external MySQL database, from the combined `xrserver-all` image.

For a shared deployment, do not make the container's published port the public API by default. Bind it to an internal network or host interface and place a reverse proxy in front of it. The proxy becomes the public entry point for HTTPS, certificates, request limits, and authentication.

## Give the proxy two jobs

A reverse proxy should have two distinct responsibilities:

1. Terminate TLS and route requests for the registry host name to the internal server.
2. Authenticate the caller before forwarding a request to the server.

Authentication proves who made the request. It does not decide what that identity may do. A deployment must define which identities may read registry data, update a model, create a Version, or delete an entity. Keep that policy visible in the proxy configuration, an authorization component, or both.

The proxy also needs a narrow trust boundary. Remove any identity headers received from the public client, then add headers only after successful authentication. Otherwise, a caller could send a header that looks like a trusted user or role. Restrict direct network access to the registry container so a caller cannot bypass the proxy and inject those headers.

## Do not confuse Endpoint authorization metadata with access control

The Endpoint extension can describe how clients obtain authorization for an endpoint. That metadata helps a client understand an integration contract. It does not authenticate a caller to the registry API itself, and it must not hold runtime credentials.

The same distinction applies to the registry service. The reverse proxy protects access to registry data. The registry data may separately describe authorization requirements for the endpoints that it catalogs. These are different security decisions with different owners.

## Keep state outside the disposable server process

The [`xrserver` command reference](https://github.com/xregistry/server/blob/master/docs/xrserver_help.md) documents database host, port, user, password, and reset options. Those settings are operational inputs, not content to put into a Registry document.

For a production service, supply database credentials through the platform's secret mechanism, use durable database storage, and test backup and recovery. Treat `--recreatedb` and related reset options as build or development tools unless a controlled recovery procedure explicitly calls for them.

## A deployment shape

The request path is:

```text
client -> HTTPS reverse proxy -> authenticated internal request -> xRegistry server -> MySQL
```

The proxy handles the internet-facing concerns. The server interprets the xRegistry model and persists registry state. MySQL retains that state across container replacement. A separate policy decides which authenticated identities can perform which operations.

This approach does not make authentication part of the xRegistry specification, and it does not claim that every proxy integrates the same way. It gives operators a defensible default until the reference server's own authentication guidance is complete.

## Primary sources

- **Implementation:** [xRegistry server quick start](https://github.com/xregistry/server/blob/master/docs/quick_start.md)
- **Implementation:** [xRegistry server installation options](https://github.com/xregistry/server/blob/master/docs/installation.md)
- **Implementation:** [`xrserver` command reference](https://github.com/xregistry/server/blob/master/docs/xrserver_help.md)
- **Normative:** [Endpoint Registry specification, authorization metadata](https://github.com/xregistry/spec/blob/main/endpoint/spec.md#protocoloptionsauthorization)