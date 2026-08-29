import { notFound } from "next/navigation";
import Link from "next/link";

const posts = {
  "spring-maintenance-tips": {
    title: "Spring Lawn Mower Maintenance Tips",
    date: "March 15, 2024",
    lead: "A little preparation before the season starts can prevent expensive repairs later.",
    sections: [
      ["Start with fresh fuel", "Drain old fuel from the tank and refill with fresh gasoline before the first cut. Stale fuel is one of the most common causes of rough running and hard starts."],
      ["Check the oil", "Inspect the oil level before every season. Replace dark or gritty oil using the grade recommended by your equipment manufacturer."],
      ["Inspect the blade", "A sharp, balanced blade makes a cleaner cut and puts less strain on the engine. Look for nicks, bends, and excessive wear before mowing."],
    ],
  },
  "common-engine-problems": {
    title: "Common Engine Problems and How to Fix Them",
    date: "February 28, 2024",
    lead: "Most small-engine problems start with fuel, air, spark, or an overlooked maintenance item.",
    sections: [
      ["Won't start", "Check fuel freshness, the spark plug, and the air filter first. A clogged carburetor or fouled plug may need professional service."],
      ["Runs rough", "Rough operation can signal old fuel, a dirty filter, or a carburetor that needs cleaning. Avoid extended use until the cause is identified."],
      ["Loses power under load", "Dull blades, an obstructed deck, and a restricted fuel supply all make an engine work harder. A seasonal tune-up can catch these issues early."],
    ],
  },
  "winterize-equipment": {
    title: "How to Winterize Your Equipment",
    date: "February 10, 2024",
    lead: "Correct storage protects your equipment from corrosion, fuel problems, and a frustrating spring start.",
    sections: [
      ["Stabilize or drain fuel", "Use a fuel stabilizer if storing with fuel in the tank, or drain the system according to the manufacturer's guidance."],
      ["Clean before storing", "Remove grass, dirt, and debris from the deck and cooling fins. A clean machine is less likely to trap moisture over the winter."],
      ["Store it dry", "Keep equipment in a dry, covered place. Disconnect the spark plug before maintenance and follow your owner&apos;s manual for battery care."],
    ],
  },
} as const;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug as keyof typeof posts];

  if (!post) notFound();

  return (
    <article className="page-shell post-page">
      <div className="post-content">
        <p className="eyebrow">Workshop notes · {post.date}</p>
        <h1>{post.title}</h1>
        <p className="post-lead">{post.lead}</p>
        {post.sections.map(([heading, copy]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{copy}</p>
          </section>
        ))}
        <Link href="/blog" className="text-link">Back to workshop notes <span aria-hidden="true">←</span></Link>
      </div>
    </article>
  );
}