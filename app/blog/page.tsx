import Link from "next/link";

export default function BlogPage() {
  const blogs = [
    {
      id: 1,
      title: "Spring Lawn Mower Maintenance Tips",
      excerpt: "Get your lawn mower ready for the season with these essential maintenance tips.",
      author: "Engine Repair Pro",
      date: "2024-03-15",
      slug: "spring-maintenance-tips",
    },
    {
      id: 2,
      title: "Common Engine Problems and How to Fix Them",
      excerpt: "Learn about the most common small engine problems and how to address them.",
      author: "Engine Repair Pro",
      date: "2024-02-28",
      slug: "common-engine-problems",
    },
    {
      id: 3,
      title: "How to Winterize Your Equipment",
      excerpt: "Prepare your lawn care equipment for winter storage with our complete guide.",
      author: "Engine Repair Pro",
      date: "2024-02-10",
      slug: "winterize-equipment",
    },
  ];

  return (
    <div className="page-shell">
      <div className="page-intro compact-intro">
        <p className="eyebrow">From the workshop</p>
        <h1>Equipment<br /><em>know-how.</em></h1>
        <p>
          Read tips, guides, and news about lawn equipment maintenance and repair
        </p>

        <div className="article-list">
          {blogs.map((post) => (
            <article
              key={post.id}
              className="article-card"
            >
              <p className="article-date">{new Date(post.date).toLocaleDateString()}</p>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <a
                href={`/blog/${post.slug}`}
                className="text-link"
              >
                Read article <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>

        <div className="newsletter">
          <h2>Need a hand<br />with your equipment?</h2>
          <p>
            Bring us the problem and we&apos;ll provide a clear diagnosis and repair plan.
          </p>
          <Link href="/booking" className="button button-primary">Book a repair</Link>
        </div>
      </div>
    </div>
  );
}
