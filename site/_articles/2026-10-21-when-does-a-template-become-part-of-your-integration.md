---
title: "When Does a Template Become Part of Your Integration?"
description: "xrcg templates map portable catalog metadata to local language, runtime, naming, and project-layout decisions, so teams should review and version them deliberately."
permalink: /blog/when-does-a-template-become-part-of-your-integration/
series_order: 31
perspective: Code-generation templates
status: Publication draft
drafted: 2026-09-03
due: 2026-10-21
date: 2026-10-21 16:00:00 +0200
published: false
reading_time: 7 minutes
previous_slug: how-does-xregistry-codegen-resolve-references
previous_title: How Does xRegistry Code Generation Resolve References?
next_slug: 
next_title: 
---

A catalog can declare a message and an Endpoint, but it does not choose a package layout, runtime library, or naming convention. Those choices belong to the `xrcg` template. Once a team customizes a template, that template becomes an integration input alongside the catalog.

The [template-authoring documentation](https://github.com/xregistry/codegen/blob/main/docs/authoring_templates.md) describes per-language and per-style template directories, shared includes, Jinja templates, metadata, filename macros, and filters. `xrcg generate` can load a custom template directory and `key=value` template arguments; custom templates override built-in templates.

## Keep contract and rendering decisions separate

Keep message identity, schemas, protocol metadata, and endpoint roles in the catalog. Keep package layout, library calls, formatting, and local configuration conventions in templates. A reviewer can then tell whether a changed generated file reflects a contract change or a generator customization.

Pin the generator version, retain a representative catalog, and build generated projects in continuous integration. The documented template interface is useful, but every template helper is still tooling behavior rather than an xRegistry document-format requirement.

## Trace template settings to generated files

The template's `_templateinfo.json` determines project-level output names. The documented template syntax makes the input-to-output relationship reviewable:

{% capture template_info_input %}
```json
{
  "main_project_name": "{project_name|pascal}Producer",
  "data_project_name": "{project_name|snake}_data",
  "data_project_dir": "{project_name~schemas}"
}
```
{% endcapture %}
{% include generated-output.html title="Template input: project naming rules" content=template_info_input %}

For `--projectname ContosoEvents`, those rules produce the main project name `ContosoEventsProducer`, the data project name `contoso_events_data`, and the data directory `ContosoEvents/schemas`. Similarly, a filename template such as `{projectname}.yml.jinja` becomes `ContosoEvents.yml`. Those files are generated output; the naming rules are template-owned integration policy.

The gallery is useful for choosing a built-in starting point, but the earlier articles cover the generated MQTT and Event Hubs APIs themselves. Here, inspect the template's project metadata and filenames before customizing them. Start with the output closest to the integration you need, then customize only the policy the catalog cannot express, such as package layout or an approved runtime wrapper.

## Primary sources

- **Implementation:** [`xrcg` template-authoring documentation](https://github.com/xregistry/codegen/blob/main/docs/authoring_templates.md)
- **Implementation:** [`xrcg generate` command documentation](https://github.com/xregistry/codegen/blob/main/docs/commands/generate.md)
- **Examples:** [xRegistry Codegen gallery](https://xregistry.io/codegen/gallery/)
