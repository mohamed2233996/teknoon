// scripts/import-lesson.ts
// npm install cheerio turndown node-fetch

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
turndown.use(gfm);

const SITE_ORIGIN = "https://harmash.com";


async function downloadImage(url: string, destDir: string): Promise<string> {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = path.extname(new URL(url).pathname) || ".png";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(path.join(destDir, filename), buf);
  return filename;
}

export async function importLesson(url: string, category: string, slug: string) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const pageContent = $(".page-content");
  if (pageContent.length === 0) throw new Error("مفيش .page-content، الصفحة اتغيرت شكلها");

  // العنوان بره الـ articles، بناخده لوحده
  const title = pageContent.find("h1").first().text().trim();

  // بنشيل الحاجات اللي مش عايزينها قبل ما نلم كل الـ articles
  pageContent.find("style, script, #shortcuts, button, #customModal").remove();

  const articles = pageContent.find("article").toArray();
  if (articles.length === 0) throw new Error("مفيش article جوه page-content");

  const imagesDir = path.join(process.cwd(), "public", "content-images", category, slug);
  const publicPrefix = `/content-images/${category}/${slug}`;

  let combinedHtml = "";

  for (const el of articles) {
    const $article = $(el);

    // نزّل كل صورة جوه الـ article ده محليًا
    const imgs = $article.find("img").toArray();
    for (const img of imgs) {
      const src = $(img).attr("src");
      if (!src) continue;
      const absoluteUrl = new URL(src, SITE_ORIGIN).toString();
      try {
        const filename = await downloadImage(absoluteUrl, imagesDir);
        $(img).attr("src", `${publicPrefix}/${filename}`);
        $(img).removeAttr("loading"); // مش لازمة في MDX
      } catch (e) {
        console.warn("فشل تحميل الصورة:", absoluteUrl, e);
      }
    }

    combinedHtml += $.html($article) + "\n";
  }

  const markdown = turndown.turndown(combinedHtml);

  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
source: "${url}"
source_site: "هرمش (harmash.com)"
imported_at: "${new Date().toISOString()}"
---

`;

  const contentDir = path.join(process.cwd(), "content", category);
  fs.mkdirSync(contentDir, { recursive: true });
  fs.writeFileSync(path.join(contentDir, `${slug}.mdx`), frontmatter + markdown);

  console.log(`✅ ${slug} اتحفظ (${articles.length} قسم، ${imagesDir} فيها الصور)`);
}

importLesson(
  "https://harmash.com/tutorials/javascript/overview",
  "javascript",
  "overview"
).catch(console.error);
