import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotionMedia from "@/components/NotionMedia";
import ScrollToTop from "@/components/ScrollToTop";
import { mediaSrc } from "@/lib/notion-media";
import { getWorkProjectBySlug, getWorkProjects } from "@/lib/notion";

export const revalidate = 60;

export async function generateStaticParams() {
  const projects = await getWorkProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getWorkProjectBySlug(slug);
  if (!project) notFound();

  const coverSrc = mediaSrc(project.cover);

  return (
    <>
      <ScrollToTop />
      <Header active="work" />
      <main>
        <section className="project-head">
          {coverSrc && (
            <img className="project-head-bg" src={coverSrc} alt={`${project.name} cover`} />
          )}
          <div className="project-head-scrim"></div>
          <div className="wrap project-head-content">
            <p className="breadcrumb">
              <Link href="/">Home</Link> / <Link href="/work">Work</Link> / {project.name}
            </p>
            <div className="project-head-top">
              <h1>{project.name}</h1>
              <div className="project-meta">
                {project.client && (
                  <div>
                    Client <b>{project.client}</b>
                  </div>
                )}
                {project.category && (
                  <div>
                    Category <b>{project.category}</b>
                  </div>
                )}
              </div>
            </div>
            {project.summary && <p className="project-desc">{project.summary}</p>}
          </div>
        </section>

        <section className="wrap gallery">
          {project.gallery.length === 0 ? (
            <p className="empty-state">
              No gallery media yet — add files to this project&apos;s Gallery property in Notion.
            </p>
          ) : (
            <div className="gallery-masonry">
              {project.gallery.map((media) => (
                <div className="gallery-item" key={`${media.property}-${media.index}`}>
                  <NotionMedia media={media} alt={project.name} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="wrap next-project">
          <Link href="/work">← Back to all work</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
