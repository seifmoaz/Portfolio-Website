import Link from "next/link";
import NotionMedia from "@/components/NotionMedia";
import type { WorkProject } from "@/lib/notion";

export default function ProjectCard({ project }: { project: WorkProject }) {
  const hasVideo = project.cover?.isVideo || project.gallery.some((g) => g.isVideo);
  return (
    <Link className="project-card" href={`/work/${project.slug}`}>
      <div className="project-card-media">
        {project.cover && <NotionMedia media={project.cover} alt={project.name} width={700} />}
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
