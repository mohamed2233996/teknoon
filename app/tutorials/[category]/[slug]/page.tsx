// app/tutorials/[category]/[slug]/page.tsx
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getAllLessonParams, getLesson } from "@/lib/content";

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllLessonParams();
}

export default async function LessonPage({ params }: PageProps) {
  const { category, slug } = await params;
  const lesson = getLesson(category, slug);

  if (!lesson) {
    notFound();
  }

  return (
<main dir="rtl" className="lesson-page">
      <h1 className="lesson-page__title">{lesson.title}</h1>

      <article className="lesson-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {lesson.content}
        </ReactMarkdown>
      </article>

      {lesson.source && (
        <p className="lesson-page__source">
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