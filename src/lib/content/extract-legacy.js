function decodeEntities(input) {
  return input
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function ensureTagMatches(block, tagName) {
  const regex = new RegExp(`<${tagName}>\\s*([\\s\\S]*?)\\s*<\\/${tagName}>`, "g");
  return [...block.matchAll(regex)].map((match) => decodeEntities(match[1] ?? "")).filter(Boolean);
}

function stripTags(input) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDate(legacyUrl) {
  const match = legacyUrl.match(/^\/(\d{4})\/(\d{2})\/(\d{2})\//);

  if (!match) {
    throw new Error(`Invalid legacy URL: ${legacyUrl}`);
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

function extractSlug(legacyUrl) {
  const trimmed = legacyUrl.replace(/^\/|\/$/g, "");
  const segments = trimmed.split("/");
  return decodeURIComponent(segments[segments.length - 1] ?? "legacy-post");
}

function excerptFromHtml(html) {
  const plain = stripTags(html.replace(/<a id="more"><\/a>/g, " "));
  return plain.slice(0, 140).trim();
}

function inferTopic(categories, tags) {
  return categories[0] ?? tags[0] ?? "未分类研究";
}

function normalizeBody(html) {
  return html
    .replace(/<a id="more"><\/a>/g, "")
    .replace(/<script[^>]*type="math\/tex[^"]*"[^>]*>([\s\S]*?)<\/script>/gi, '<pre class="legacy-math"><code>$1</code></pre>')
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br>/g, "<br />")
    .replace(/<hr>/g, "<hr />")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

function capture(block, pattern) {
  const match = block.match(pattern);
  return match?.[1] ? decodeEntities(match[1]) : "";
}

export function parseLegacyEntries(xml) {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

  return entries
    .map((match) => {
      const block = match[1] ?? "";
      const legacyUrl = capture(block, /<url>\s*([\s\S]*?)\s*<\/url>/);
      const title = capture(block, /<title>\s*([\s\S]*?)\s*<\/title>/) || extractSlug(legacyUrl);
      const body = normalizeBody(capture(block, /<content[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/content>/));
      const categoriesBlock = capture(block, /<categories>([\s\S]*?)<\/categories>/);
      const tagsBlock = capture(block, /<tags>([\s\S]*?)<\/tags>/);
      const categories = ensureTagMatches(categoriesBlock, "category");
      const tags = ensureTagMatches(tagsBlock, "tag");

      if (!legacyUrl || !body) {
        return null;
      }

      return {
        title,
        legacyUrl,
        legacySlug: extractSlug(legacyUrl),
        pubDate: extractDate(legacyUrl),
        categories,
        tags,
        description: excerptFromHtml(body),
        body,
        topic: inferTopic(categories, tags)
      };
    })
    .filter(Boolean);
}

export function toFrontmatter(entry) {
  const lines = [
    "---",
    `title: ${JSON.stringify(entry.title)}`,
    `description: ${JSON.stringify(entry.description)}`,
    `pubDate: ${entry.pubDate}`,
    `legacyUrl: ${JSON.stringify(entry.legacyUrl)}`,
    `legacySlug: ${JSON.stringify(entry.legacySlug)}`,
    `categories: [${entry.categories.map((item) => JSON.stringify(item)).join(", ")}]`,
    `tags: [${entry.tags.map((item) => JSON.stringify(item)).join(", ")}]`,
    'source: "legacy"',
    `topic: ${JSON.stringify(entry.topic)}`,
    "---",
    ""
  ];

  return lines.join("\n");
}
