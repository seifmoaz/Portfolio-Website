import { mediaSrc } from "@/lib/notion-media";
import type { MediaRef } from "@/lib/notion";

export default function NotionMedia({
  media,
  alt,
  className,
}: {
  media: MediaRef | null | undefined;
  alt: string;
  className?: string;
}) {
  const src = mediaSrc(media);
  if (!src) return null;

  if (media?.isVideo) {
    return (
      <video className={className} autoPlay muted loop playsInline>
        <source src={src} />
      </video>
    );
  }

  return <img className={className} src={src} alt={alt} />;
}
