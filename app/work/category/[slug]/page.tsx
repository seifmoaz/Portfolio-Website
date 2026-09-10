import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import ScrollToTop from "@/components/ScrollToTop";
import { getWorkProjects, slugify } from "@/lib/notion";

export const revalidate = 60;

export async function generateStaticParams() {
  const projects = await getWorkProjects();
  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
  return categories.map((category) => ({ slug: slugify(category) }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = await getWorkProjects();
  const items = projects.filter((p) => slugify(p.category) === slug);
  if (items.length === 0) notFound();
  const category = items[0].category;

  return (
    <>
      <ScrollToTop />
      <Header active="work" />
      <main>
        <section className="wrap page-head">
          <h1>{category}</h1>
          <p>
            {items.length} project{items.length === 1 ? "" : "s"} in {category}.
          </p>
        </section>

        <section className="wrap category-block">
          <div className="category-full-grid">
            {items.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        <section className="wrap next-project">
          <Link href="/work">← Back to all work</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
