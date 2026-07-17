/**
 * app/tutorials/[category]/[slug]/page.tsx
 * -------------------------------------------
 * صفحة عرض درس واحد، بتحول MDX لـ HTML وتعرض إشارة المصدر
 * (شرط الإذن اللي اتفقت عليه مع صاحب هرمش).
 */

import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllLessonParams, getLesson } from "@/lib/content";

interface PageProps {
  params: { category: string; slug: string };
}

export function generateStaticParams() {
  return getAllLessonParams();
}

export default function LessonPage({ params }: PageProps) {
  const lesson = getLesson(params.category, params.slug);

  if (!lesson) {
    notFound();
  }

  return (
    <main dir="rtl" style={{ maxWidth: 760, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{lesson.title}</h1>

      <article style={{ lineHeight: 1.9, fontSize: "1.05rem" }}>
        <MDXRemote source={lesson.content} />
      </article>

      {lesson.source && (
        <p
          style={{
            marginTop: "3rem",
            paddingTop: "1rem",
            borderTop: "1px solid #e5e5e5",
            fontSize: "0.9rem",
            color: "#666",
          }}
        >
          المصدر الأساسي لهذا الدرس:{" "}
          <a href={lesson.source} target="_blank" rel="noopener noreferrer">
            {lesson.source_site}
          </a>{" "}
          — تم النقل بإذن من إدارة الموقع.
        </p>
      )}
    </main>
  );
}
