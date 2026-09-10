import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import ScrollToTop from "@/components/ScrollToTop";
import { getWorkProjects, slugify } from "@/lib/notion";

export const revalidate = 60;

const CATEGORY_ORDER = ["F&B", "Brand Content", "Event Coverage"];

export default async function WorkPage() {
  const projects = await getWorkProjects();
  const featured = projects.filter((p) => p.featured);

  const knownGroups = CATEGORY_ORDER.map((category) => ({
    category,
    items: projects.filter((p) => p.category === category),
  })).filter((g) => g.items.length > 0);

  const otherCategories = Array.from(
    new Set(projects.map((p) => p.category).filter((c) => c && !CATEGORY_ORDER.includes(c))),
  );
  const groups = [
    ...knownGroups,
    ...otherCategories.map((category) => ({
      category,
      items: projects.filter((p) => p.category === category),
    })),
  ];

  return (
    <>
      <ScrollToTop />
      <Header active="work" />
      <main>
        <section className="wrap page-head">
          <h1>Selected Work</h1>
          <p>
            Fashion, F&amp;B, brand content, and event coverage: real work for real clients, shot and
            edited across Egypt and worldwide. New projects added as they wrap.
          </p>
        </section>

        {featured.length > 0 && (
          <section className="wrap featured">
            <p className="section-label">Featured Work</p>
            <div className="featured-grid">
              {featured.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {groups.length === 0 ? (
          <section className="wrap category-block">
            <p className="empty-state">
              No projects published yet — add rows to the Work Projects database in Notion (with
              Published checked and a Category set) and they&apos;ll show up here automatically.
            </p>
          </section>
        ) : (
          groups.map((group) => (
            <section className="wrap category-block" key={group.category}>
              <div className="category-head">
                <h2 className="category-title">
                  {group.category} <span className="count">({group.items.length})</span>
                </h2>
                <Link className="view-all" href={`/work/category/${slugify(group.category)}`}>
                  View All →
                </Link>
              </div>
              <div className="project-grid">
                {group.items.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
      <Footer />
    </>
  );
}
