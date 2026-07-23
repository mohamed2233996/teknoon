/**
 * lib/content.ts
 * -----------------
 * دوال مساعدة لقراءة ملفات MDX اللي اتسحبت من هرمش وترتيبها.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "content");

export interface LessonMeta {
  title: string;
  source: string;
  source_site: string;
  imported_at: string;
  slug: string;
  category: string;
}

export interface Lesson extends LessonMeta {
  content: string;
}

export function getCategories(): string[] {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  return fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

export function getLessonsByCategory(category: string): LessonMeta[] {
  const dir = path.join(CONTENT_ROOT, category);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const { data } = matter(raw);
      return {
        title: data.title || slug,
        source: data.source || "",
        source_site: data.source_site || "هرمش (harmash.com)",
        imported_at: data.imported_at || "",
        slug,
        category,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "ar"));
}

export function getLesson(category: string, slug: string): Lesson | null {
  const filePath = path.join(CONTENT_ROOT, category, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    title: data.title || slug,
    source: data.source || "",
    source_site: data.source_site || "هرمش (harmash.com)",
    imported_at: data.imported_at || "",
    slug,
    category,
    content,
  };
}

export function getAllLessonParams(): { category: string; slug: string }[] {
  const categories = getCategories();
  return categories.flatMap((category) =>
    getLessonsByCategory(category).map((lesson) => ({
      category,
      slug: lesson.slug,
    }))
  );
}