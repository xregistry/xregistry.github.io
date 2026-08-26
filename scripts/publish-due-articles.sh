#!/usr/bin/env bash

set -euo pipefail

articles_dir="${1:-_articles}"
today="${PUBLISH_DATE:-$(date +%F)}"

if [[ ! "$today" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "Invalid publication date: $today" >&2
  exit 1
fi

published=0

while IFS= read -r -d '' article; do
  front_matter="$(sed -n '1,/^---[[:space:]]*$/p' "$article")"
  publication_date="$(printf '%s\n' "$front_matter" | sed -n 's/^date:[[:space:]]*//p' | head -n 1 | tr -d '\r')"

  if [[ -z "$publication_date" ]]; then
    continue
  fi

  if [[ ! "$publication_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "Invalid date in $article: $publication_date" >&2
    exit 1
  fi

  if [[ "$publication_date" > "$today" ]]; then
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