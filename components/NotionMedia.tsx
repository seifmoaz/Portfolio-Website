import { mediaSrc } from "@/lib/notion-media";
import type { MediaRef } from "@/lib/notion";

export default function NotionMedia({
  media,
  alt,
  className,
  trim,
}: {
  media: MediaRef | null | undefined;
  alt: string;
  className?: string;
  trim?: boolean;
}) {
  if (media?.isVideo) {
    const src = mediaSrc(media);
    if (!src) return null;
    return (
      <video className={className} autoPlay muted loop playsInline>
        <source src={src} />
      </video>
    );
  }

  const src = mediaSrc(media, { trim });
  if (!src) return null;
  return <img className={className} src={src} alt={alt} />;
}
