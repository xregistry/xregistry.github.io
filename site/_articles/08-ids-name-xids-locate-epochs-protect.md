---
title: "IDs Name, XIDs Locate, Epochs Protect"
description: "xRegistry IDs, XIDs, and epochs solve different problems: local naming, registry-wide addressing, and detection of conflicting writes."
permalink: /blog/ids-name-xids-locate-epochs-protect/
series_order: 8
perspective: Identity and concurrency
status: Publication draft
drafted: 2026-08-24
due: 2026-09-11
date: 2026-09-11 16:00:00 +0200
published: false
reading_time: 9 minutes
previous_slug: how-much-of-the-graph-should-a-client-read
previous_title: How Much of the Graph Should a Client Read?
next_slug: is-this-write-a-replacement-a-patch-or-an-import
next_title: Is This Write a Replacement, a Patch, or an Import?
---

One identifier can end up doing three jobs in a distributed system. A friendly name becomes a database key, then a URL, then a revision token. A rename, move, or concurrent update then breaks an assumption that the design did not state.

xRegistry does not use one value for all three jobs. An entity ID names the entity within its parent. An XID identifies its place across the Registry. An epoch says whether the entity is still in the state a writer previously observed.

In JSON, these values may look similar. They answer three different questions: “which thing?”, “where in this registry?”, and “which state of that thing?”

## Three values, three scopes

The core specification defines IDs, XIDs, and epochs as common attributes with separate constraints and lifecycles.

| Value | Question answered | Scope | Lifecycle |
| --- | --- | --- | --- |
| `<SINGULAR>id` | Which sibling entity? | Unique within the parent | Required and immutable |
| `xid` | Which entity in this Registry? | Unique across the Registry | Server-generated, required, immutable |
| `epoch` | Has this entity changed? | State of one entity | Server-controlled and increasing |

None replaces another. An epoch of `12` does not identify an entity. A Resource ID does not identify its Group. An XID identifies an entity, but does not tell a writer whether an earlier representation remains current.

## IDs are local

The [`<SINGULAR>id` rules](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#singularid-id-attribute) require an ID to be unique, case-insensitively, within its parent. Lookup is nevertheless case-sensitive: a request using the wrong case MUST be treated as not found. IDs are immutable and between 1 and 128 characters, with a constrained character set.

The attribute name reflects the entity type. A Registry uses `registryid`, a Schema Resource uses `schemaid`, and every Version uses `versionid`. The generic term is “ID,” but serialized data remains explicit about what is being named.

Consider two paths:

```text
/schemagroups/payments/schemas/common
/schemagroups/shipping/schemas/common
```

Both Resources can have `schemaid: "common"` because each is scoped by a different Schema Group. Within `payments`, however, `common` and `COMMON` cannot be two sibling IDs, even though lookup preserves case.

Case-insensitive uniqueness prevents siblings that differ only by case. Case-sensitive lookup keeps the exact identifier as part of the contract. Retain IDs exactly as returned instead of normalizing them.

Local scope lets teams use short domain names without creating globally unique strings in every collection. The parent provides the rest of the identity. An ID by itself is not a portable registry reference. Logging only `common` drops the parent context needed to find it.

## XIDs preserve the hierarchy

The [`xid` attribute](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#xid-attribute) is a case-sensitive, server-generated relative URL from the Registry root. It MUST be unique across the Registry, begin with `/`, remain immutable, and use valid Group and Resource types from the model. Its path is the hierarchy leading to the entity.

```text
/endpoints/ep1
/schemagroups/myschemas/schemas/app.json/versions/v1.0
```

“Across the Registry” sets the boundary. An XID is not globally unique across every deployment on the Internet. Combining it with the Registry base URL, as `self` does, adds the deployment context. Within a document, the XID still names the same Registry-relative entity even when `self` is a JSON Pointer.

```json
{
  "schemaid": "common",
  "xid": "/schemagroups/payments/schemas/common",
  "self": "https://registry.example/schemagroups/payments/schemas/common$details"
}
```

In this example, `schemaid` names the Resource among sibling Schemas. `xid` gives its Registry-relative path. `self` gives a retrieval URL in API view and may carry protocol details such as HTTP's `$details` suffix.

XIDs are also typed model values. The [core type rules](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#data-types) let an attribute of type `xid` declare a target model type. A registry can check that a reference has the shape of the expected entity type, although a syntactically valid XID may be a dangling reference.

An XID keeps the entity's path in the Registry. A log, relationship, or exported document can store `/schemagroups/payments/schemas/common` without storing the service host name.

## Epochs identify state, not things

The [`epoch` attribute](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#epoch-attribute) is a required, read-only unsigned integer. Each update to the associated entity MUST set it to a new value greater than its current value. Even an empty patch acts as a touch and advances the epoch.

The specification does not require increments of exactly one. During one write, an implementation may update the value once or more than once. Clients can rely on ordering, not arithmetic. Epoch `43` is newer than `41`, but any number of writes may have occurred between them.

An update or delete may include the epoch previously read by the client:

```http
PATCH /endpoints/orders
Content-Type: application/json

{
  "epoch": 7,
  "description": "Production order events"
}
```

If the current entity epoch is no longer `7`, the server MUST generate `mismatched_epoch`. If the value is absent or `null`, no epoch check is performed. On an HTTP delete, where there is normally no entity body, the core [Epoch Flag](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#epoch-flag) supports the equivalent shape:

```http
DELETE /endpoints/orders?epoch=7
```

In v1.0-rc4, [`mismatched_epoch`](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#mismatched_epoch) has code `400 Bad Request`. Do not assume that the server uses `409 Conflict` or conditional HTTP headers for optimistic concurrency.

Use the epoch as a compare-before-write token. Read the entity, keep its epoch, and send that value with the write. After a mismatch, retrieve the current state before deciding whether to retry, merge, or abandon the change. Resubmitting the old representation can overwrite a newer change.

## Epoch propagation is structural

Epochs belong to entities, so the rules must say how nested changes affect them.

When an entity owns an xRegistry collection, adding or removing a child MUST advance the parent's epoch. Modifying an existing child alone MUST NOT advance the parent's epoch. A Resource's epoch lives in its Meta entity and advances when Meta attributes change or when a Version is added or removed. Changing an existing Version does not, by itself, advance the Resource epoch.

Suppose a Group has epoch `20` and contains a Resource at epoch `4`:

| Operation | Group epoch | Resource epoch |
| --- | --- | --- |
| Change a Resource Meta attribute | MUST NOT change solely for that reason | Resource Meta epoch MUST increase |
| Change an existing Version attribute through a Resource representation | MUST NOT change solely for that reason | Resource Meta epoch MUST NOT change solely for that reason; the Version epoch MUST increase |
| Add a new Resource to the Group | MUST increase | New Resource gets its server value |
| Add a Version to the Resource | No change required solely for that nested addition | MUST increase |
| Update an existing Version | No change required solely for that update | MUST NOT change solely for that reason |

The Registry does not have one global revision counter. Each entity records its own update state. Parent epochs track collection membership, not every change to a descendant.

The pinned [resolved full-model sample](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/sample-model-full.json) defines `xid` as type `xid` and `epoch` as an unsigned, required, read-only attribute at relevant entity levels. It shows how these rules appear in resolved model data. A server's counter allocation strategy remains an implementation detail.

## Practical consequences

Preserve IDs exactly and include the parent context when an ID leaves its collection. Use XIDs for Registry-relative relationships and `self` for an API URL that can be retrieved at once. Send epochs in edit workflows and handle mismatches explicitly.

Do not infer one from another when the protocol provides it. Parsing an ID out of `self` loses explicit boundaries. Treating `modifiedat` as a concurrency token replaces a monotonic rule with timestamp comparison. Using an XID as a revision key causes stale representations to look current because entity identity did not change.

A cache can use an XID as the key for all observed states of one entity. The pair `(xid, epoch)` can identify one observed state for conflict detection. That pair is a client technique, not a new xRegistry identifier. An epoch has meaning only with its entity.

For batch operations, check each serialized entity. The epoch check applies to the entity whose representation contains the value. Checking a Group epoch does not protect updates to all existing descendants. The parent propagation rules cover only the changes stated above.

IDs, XIDs, and epochs remain separate because they have different scopes and lifecycles. Substituting one for another discards information the protocol exposes explicitly.

## Primary sources

- **Normative:** [Core specification v1.0-rc4, ID Attribute](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#singularid-id-attribute)
- **Normative:** [Core specification v1.0-rc4, XID Attribute](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#xid-attribute)
- **Normative:** [Core specification v1.0-rc4, Epoch Attribute](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#epoch-attribute)
- **Normative:** [Core specification v1.0-rc4, Epoch Flag](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#epoch-flag)
- **Normative:** [Core specification v1.0-rc4, Mismatched Epoch](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/spec.md#mismatched_epoch)
- **Normative:** [HTTP binding v1.0-rc4, Creating or Updating Entities](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/http.md#creating-or-updating-entities)
- **Observed:** [Resolved full-model sample at the pinned revision](https://github.com/xregistry/spec/blob/d2433a8c726ab096303bd943a4fc6691925f7910/core/sample-model-full.json)
