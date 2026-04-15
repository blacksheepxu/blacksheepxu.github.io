function decodeEntities(input, { trim = true } = {}) {
  const decoded = input
    .replace(/&#x([0-9a-f]+);/gi, (_, value) => String.fromCodePoint(parseInt(value, 16)))
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(parseInt(value, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

  return trim ? decoded.trim() : decoded;
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

function decodeCodeBlock(codeHtml) {
  return decodeEntities(
    codeHtml
      .replace(/<\/span>/gi, "")
      .replace(/<span[^>]*>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n"),
    { trim: false }
  )
    .replace(/\r\n/g, "\n")
    .replace(/\n+$/g, "");
}

function normalizeLegacyCodeBlocks(html) {
  return html.replace(/<figure class="([^"]*\bhighlight\b[^"]*)">([\s\S]*?)<\/figure>/gi, (figure, className, innerHtml) => {
    const classTokens = className.split(/\s+/).filter(Boolean);
    const language = classTokens.find((token) => token !== "highlight") ?? "text";
    const codeMatch = innerHtml.match(/<td class="code">\s*<pre>([\s\S]*?)<\/pre>\s*<\/td>/i);

    if (!codeMatch) {
      return figure;
    }

    const code = decodeCodeBlock(codeMatch[1] ?? "");
    return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
  });
}

function normalizeBody(html) {
  const normalizedHtml = html
    .replace(/<a id="more"><\/a>/g, "")
    .replace(/<br\s*\/?>/gi, "<br />")
    .replace(/<hr\s*\/?>/gi, "<hr />")
    .replace(/<script[^>]*type="math\/tex[^"]*"[^>]*>([\s\S]*?)<\/script>/gi, '<pre class="legacy-math"><code>$1</code></pre>')
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<pre class="legacy-math"><code>([\s\S]*?)<\/code><\/pre>/gi, (_, math) => {
      return `<pre class="legacy-math"><code>${decodeEntities(math, { trim: false })}</code></pre>`;
    })
    .replace(/<div class="table-container">([\s\S]*?)<\/div>/gi, "$1")
    .replace(/\r\n/g, "\n")
    .trim();

  return normalizeLegacyCodeBlocks(normalizedHtml).trim();
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
