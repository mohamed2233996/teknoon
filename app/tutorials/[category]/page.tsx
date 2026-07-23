/**
 * app/tutorials/[category]/page.tsx
 * -----------------------------------
 * صفحة فهرس القسم - بتعرض كل الدروس الموجودة جوه قسم معين
 * زي: /tutorials/javascript
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getLessonsByCategory } from "@/lib/content";

interface PageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return getCategories().map((category) => ({ category }));
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const lessons = getLessonsByCategory(category);

  if (lessons.length === 0) {
    notFound();
  }

  return (
   <main dir="rtl" className="category-page">
      <p className="category-page__eyebrow">tutorials / {category}</p>
      <h1 className="category-page__title">دروس {category}</h1>

      <ul className="lesson-grid">
        {lessons.map((lesson) => (
          <li key={lesson.slug}>
            <Link href={`/tutorials/${category}/${lesson.slug}`} className="lesson-card">
              {lesson.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}