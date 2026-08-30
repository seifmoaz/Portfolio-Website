import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotionMedia from "@/components/NotionMedia";
import ScrollToTop from "@/components/ScrollToTop";
import { getWorkProjects, type WorkProject } from "@/lib/notion";

export const revalidate = 60;

const CATEGORY_ORDER = ["F&B", "Brand Content", "Event Coverage"];

function ProjectCard({ project }: { project: WorkProject }) {
  const hasVideo = project.cover?.isVideo || project.gallery.some((g) => g.isVideo);
  return (
    <Link className="project-card" href={`/work/${project.slug}`}>
      <div className="project-card-media">
        {project.cover && <NotionMedia media={project.cover} alt={project.name} />}
        {hasVideo && (
          <div className="play-dot">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7-11-7z" fill="#0A0A0A" />
            </svg>
          </div>
        )}
      </div>
      <div className="project-card-info">
        <span className="cat">{project.category}</span>
        <h3>{project.name}</h3>
      </div>
    </Link>
  );
}

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
          <p className="breadcrumb">
            <Link href="/">Home</Link> / Work
          </p>
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
              <h2 className="category-title">
                {group.category} <span className="count">({group.items.length})</span>
              </h2>
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
