// scripts/import-all.ts
import { importLesson } from "./import-lesson";
import { LESSONS } from "./lessons-list";

async function run() {
    let success = 0;
    let failed: string[] = [];

    for (const lesson of LESSONS) {
        try {
            await importLesson(lesson.url, lesson.category, lesson.slug);
            success++;
        } catch (e) {
            console.error(`❌ فشل: ${lesson.slug}`, e);
            failed.push(lesson.slug);
        }
        // استنى شوية بين كل طلب عشان مايكونش ضغط كبير على سيرفر هرمش
        await new Promise((r) => setTimeout(r, 1500));
    }

    console.log(`\n✅ نجح: ${success} / ${LESSONS.length}`);
    if (failed.length) console.log(`❌ فشل: ${failed.join(", ")}`);
}

run();