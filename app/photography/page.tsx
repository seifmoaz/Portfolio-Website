import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PinterestGrid, { type PinItem } from "@/components/PinterestGrid";
import ScrollToTop from "@/components/ScrollToTop";
import { mediaSrc } from "@/lib/notion-media";
import { getPhotographyItems } from "@/lib/notion";

export const revalidate = 60;

const PLACEHOLDER_SEEDS = [
  ["photo-01", "700/900"], ["photo-02", "900/600"], ["photo-03", "700/700"], ["photo-04", "700/1000"],
  ["photo-05", "900/650"], ["photo-06", "700/850"], ["photo-07", "700/900"], ["photo-08", "900/600"],
  ["photo-09", "700/750"], ["photo-10", "700/1000"], ["photo-11", "900/580"], ["photo-12", "700/900"],
  ["photo-13", "700/700"], ["photo-14", "900/650"], ["photo-15", "700/950"], ["photo-16", "900/600"],
];

export default async function PhotographyPage() {
  const items = await getPhotographyItems();

  const gridItems: PinItem[] =
    items.length === 0
      ? PLACEHOLDER_SEEDS.map(([seed, size]) => ({
          key: seed,
          src: `https://picsum.photos/seed/${seed}/${size}`,
          alt: "Photograph",
        }))
      : items
          .filter((item) => item.image)
          .map((item) => ({
            key: item.id,
            src: mediaSrc(item.image)!,
            alt: item.caption || "Photograph",
            isVideo: item.image!.isVideo,
          }));

  return (
    <>
      <ScrollToTop />
      <Header active="photography" />
      <main>
        <section className="wrap page-head">
          <p className="breadcrumb">
            <Link href="/">Home</Link> / Photography
          </p>
          <h1>Photography</h1>
          <p>
            The stuff I shoot when nobody&apos;s paying me to, in Cairo and wherever else the trip
            takes me. This is where the passion kicks in, collected here as it happens.
          </p>
        </section>

        <section className="wrap photo-gallery">
          <PinterestGrid items={gridItems} />
        </section>
      </main>
      <Footer />
    </>
  );
}
