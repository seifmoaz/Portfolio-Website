import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotionMedia from "@/components/NotionMedia";
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

  return (
    <>
      <Header active="photography" />
      <main>
        <section className="wrap page-head">
          <p className="breadcrumb">
            <Link href="/">Home</Link> / Photography
          </p>
          <h1>Photography</h1>
          <p>
            Stills from fashion, F&amp;B, and events, shot across Egypt and worldwide. The archive
            grows every time the camera comes out.
          </p>
        </section>

        <section className="wrap photo-gallery">
          <div className="photo-masonry">
            {items.length === 0
              ? PLACEHOLDER_SEEDS.map(([seed, size]) => (
                  <div className="photo-item" key={seed}>
                    <img src={`https://picsum.photos/seed/${seed}/${size}`} alt="Photograph" />
                  </div>
                ))
              : items.map((item) => (
                  <div className="photo-item" key={item.id}>
                    <NotionMedia media={item.image} alt={item.caption || "Photograph"} />
                  </div>
                ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
