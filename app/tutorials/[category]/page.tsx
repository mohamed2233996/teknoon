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
  params: { category: string };
}

export function generateStaticParams() {
  return getCategories().map((category) => ({ category }));
}

export default function CategoryPage({ params }: PageProps) {
  const lessons = getLessonsByCategory(params.category);

  if (lessons.length === 0) {
    notFound();
  }

  return (
    <main dir="rtl" style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>
        دروس {params.category}
      </h1>

      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {lessons.map((lesson) => (
          <li key={lesson.slug}>
            <Link
              href={`/tutorials/${params.category}/${lesson.slug}`}
              style={{
                display: "block",
                padding: "1rem",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {lesson.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
