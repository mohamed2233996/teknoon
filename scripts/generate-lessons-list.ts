// scripts/generate-lessons-list.ts
// npx tsx scripts/generate-lessons-list.ts

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const SITE_ORIGIN = "https://harmash.com";

// أسماء الأقسام زي ما ظاهرة في الموقع (من رابط /tutorials/<category>)
const CATEGORIES = [
  "programming", "sql", "html", "css", "javascript", "react",
  "python", "cplusplus", "java", "javafx", "swing",
  "algorithms-and-data-structure", "english", "english-conversations",
  "computer-fundamentals", "linux", "git",
];

interface LessonRef {
  url: string;
  category: string;
  slug: string;
}

async function getLessonsForCategory(category: string): Promise<LessonRef[]> {
  const res = await fetch(`${SITE_ORIGIN}/tutorials/${category}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const lessons: LessonRef[] = [];
  const seen = new Set<string>();

  // بنلف على كل اللينكات وبنفلتر بس اللي شكلها /tutorials/<category>/<slug>
  $("a[href^='/tutorials/']").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const match = href.match(new RegExp(`^/tutorials/${category}/([a-zA-Z0-9-]+)$`));
    if (!match) return;

    const slug = match[1];
    if (seen.has(slug)) return;
    seen.add(slug);

    lessons.push({
      url: `${SITE_ORIGIN}${href}`,
      category,
      slug,
    });
  });

  return lessons;
}

async function run() {
  const all: LessonRef[] = [];

  for (const category of CATEGORIES) {
    console.log(`⏳ بجيب دروس قسم: ${category}`);
    try {
      const lessons = await getLessonsForCategory(category);
      console.log(`   لقيت ${lessons.length} درس`);
      all.push(...lessons);
    } catch (e) {
      console.error(`❌ فشل في قسم ${category}`, e);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  const fileContent = `// scripts/lessons-list.ts
// اتولد تلقائيًا بواسطة generate-lessons-list.ts بتاريخ ${new Date().toISOString()}

export const LESSONS: { url: string; category: string; slug: string }[] = ${JSON.stringify(all, null, 2)};
`;

  fs.writeFileSync(path.join(process.cwd(), "scripts", "lessons-list.ts"), fileContent);
  console.log(`\n✅ اتحفظت ${all.length} درس في scripts/lessons-list.ts`);
}

run();