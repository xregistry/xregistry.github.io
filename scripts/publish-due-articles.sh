#!/usr/bin/env bash

set -euo pipefail

articles_dir="${1:-site/_articles}"
today="${PUBLISH_DATE:-$(date +%F)}"

if [[ ! "$today" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "Invalid publication date: $today" >&2
  exit 1
fi

published=0

while IFS= read -r -d '' article; do
  front_matter="$(sed -n '1,/^---[[:space:]]*$/p' "$article")"
  due_date="$(printf '%s\n' "$front_matter" | sed -n 's/^due:[[:space:]]*//p' | head -n 1 | tr -d '\r')"
  publication_timestamp="$(printf '%s\n' "$front_matter" | sed -n 's/^date:[[:space:]]*//p' | head -n 1 | tr -d '\r')"

  if [[ -z "$due_date" ]]; then
    continue
  fi

  if [[ ! "$due_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "Invalid due date in $article: $due_date" >&2
    exit 1
  fi

  if [[ ! "$publication_timestamp" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}[[:space:]]16:00:00[[:space:]][+-][0-9]{4}$ ]]; then
    echo "Invalid publication timestamp in $article: $publication_timestamp" >&2
    exit 1
  fi

  if [[ "${publication_timestamp:0:10}" != "$due_date" ]]; then
    echo "Due date and publication timestamp differ in $article" >&2
    exit 1
  fi

  if [[ "$due_date" > "$today" ]]; then
    continue
  fi

  if ! printf '%s\n' "$front_matter" | grep -q '^published:[[:space:]]*false[[:space:]]*$'; then
    continue
  fi

  awk '
    BEGIN { in_front_matter = 0; front_matter_ended = 0 }
    NR == 1 && /^---[[:space:]]*$/ { in_front_matter = 1 }
    in_front_matter && !front_matter_ended && /^published:[[:space:]]*false[[:space:]]*$/ {
      sub(/false[[:space:]]*$/, "true")
    }
    in_front_matter && NR > 1 && /^---[[:space:]]*$/ {
      front_matter_ended = 1
    }
    { print }
  ' "$article" > "$article.tmp"
  mv "$article.tmp" "$article"

  echo "Published $article"
  published=$((published + 1))
done < <(find "$articles_dir" -maxdepth 1 -type f -name '*.md' -print0 | sort -z)

echo "Published $published article(s) for $today."