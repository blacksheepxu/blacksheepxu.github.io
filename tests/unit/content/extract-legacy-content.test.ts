import { describe, expect, it } from "vitest";
import { parseLegacyEntries, toFrontmatter } from "../../../src/lib/content/extract-legacy";

const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
<search>
  <entry>
    <title>第一篇博客</title>
    <url>/2019/11/21/%E7%AC%AC%E4%B8%80%E7%AF%87%E5%8D%9A%E5%AE%A2/</url>
    <content><![CDATA[<h1>标题</h1><p>正文内容</p><a id="more"></a><p>后续内容</p>]]></content>
    <categories><category>Todo</category></categories>
    <tags><tag>创建</tag><tag>操作</tag></tags>
  </entry>
</search>`;

describe("parseLegacyEntries", () => {
  it("parses legacy entries from Hexo search xml", () => {
    const entries = parseLegacyEntries(sampleXml);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.legacyUrl).toBe("/2019/11/21/%E7%AC%AC%E4%B8%80%E7%AF%87%E5%8D%9A%E5%AE%A2/");
    expect(entries[0]?.legacySlug).toBe("第一篇博客");
    expect(entries[0]?.pubDate).toBe("2019-11-21");
    expect(entries[0]?.categories).toEqual(["Todo"]);
    expect(entries[0]?.tags).toEqual(["创建", "操作"]);
    expect(entries[0]?.body).not.toContain('<a id="more"></a>');
  });

  it("generates frontmatter for mdx output", () => {
    const [entry] = parseLegacyEntries(sampleXml);
    const frontmatter = toFrontmatter(entry!);
    expect(frontmatter).toContain('title: "第一篇博客"');
    expect(frontmatter).toContain('source: "legacy"');
    expect(frontmatter).toContain('categories: ["Todo"]');
  });

  it("fails fast on invalid legacy URLs", () => {
    const invalidXml = sampleXml.replace(
      "/2019/11/21/%E7%AC%AC%E4%B8%80%E7%AF%87%E5%8D%9A%E5%AE%A2/",
      "/invalid/url/"
    );

    expect(() => parseLegacyEntries(invalidXml)).toThrow("Invalid legacy URL");
  });

  it("normalizes legacy math scripts into safe HTML", () => {
    const mathXml = `<?xml version="1.0" encoding="utf-8"?>
<search>
  <entry>
    <title>数学文章</title>
    <url>/2019/12/01/math/</url>
    <content><![CDATA[<p>公式</p><script type="math/tex; mode=display">\\mathcal{L}</script>]]></content>
    <categories><category>Math</category></categories>
    <tags><tag>公式</tag></tags>
  </entry>
</search>`;

    const [entry] = parseLegacyEntries(mathXml);
    expect(entry?.body).toContain('<pre class="legacy-math"><code>\\mathcal{L}</code></pre>');
  });

  it("converts legacy Hexo highlight blocks into fenced code blocks", () => {
    const codeXml = `<?xml version="1.0" encoding="utf-8"?>
<search>
  <entry>
    <title>代码文章</title>
    <url>/2020/02/01/code/</url>
    <content><![CDATA[<p>示例</p><figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">1</span><br /><span class="line">2</span><br /></pre></td><td class="code"><pre><span class="line"><span class="keyword">import</span> torch</span><br /><span class="line">config = &#123;<span class="string">"x"</span>: <span class="number">1</span>&#125;</span><br /></pre></td></tr></table></figure>]]></content>
    <categories><category>Pytorch</category></categories>
    <tags><tag>code</tag></tags>
  </entry>
</search>`;

    const [entry] = parseLegacyEntries(codeXml);
    expect(entry?.body).toContain("```python");
    expect(entry?.body).toContain('import torch');
    expect(entry?.body).toContain('config = {"x": 1}');
    expect(entry?.body).not.toContain('<figure class="highlight python">');
  });
});
