import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import NotionMedia from "@/components/NotionMedia";
import ScrollToTop from "@/components/ScrollToTop";
import PinterestGrid, { type PinItem } from "@/components/PinterestGrid";
import MomentVideo from "@/components/MomentVideo";
import { mediaSrc } from "@/lib/notion-media";
import { getLogos, getPhotographyItems, getMoments } from "@/lib/notion";

export const revalidate = 60;

const PLACEHOLDER_MOMENTS = [
  { id: "shot-01", size: "700/900", caption: <><b>Adidas</b> — Season launch, on-location detail shot.</> },
  { id: "shot-02", size: "900/600", caption: <><b>Flow State</b> — Grit &amp; Gloss campaign, wide establishing shot.</> },
  { id: "shot-03", size: "700/700", caption: <><b>Puma</b> — Training capsule, product-in-motion still.</> },
  { id: "shot-04", size: "700/1000", caption: <><b>Salomon</b> — Trail campaign, portrait close-up.</> },
  { id: "shot-05", size: "900/550", caption: <><b>Gig</b> — Content campaign, behind-the-scenes b-roll frame.</> },
  { id: "shot-06", size: "700/850", caption: <><b>Craghoppers</b> — Outdoor gear shoot, environmental portrait.</> },
];

const PLACEHOLDER_REEL: PinItem[] = [
  { key: "seif-fashion-01", src: "https://picsum.photos/seed/seif-fashion-01/700/900", alt: "Editorial fashion photography" },
  { key: "seif-fnb-01", src: "https://picsum.photos/seed/seif-fnb-01/900/600", alt: "F&B photography" },
  { key: "seif-event-01", src: "https://picsum.photos/seed/seif-event-01/700/700", alt: "Event photography" },
  { key: "seif-fashion-03", src: "https://picsum.photos/seed/seif-fashion-03/700/1000", alt: "Fashion campaign" },
  { key: "seif-fnb-02", src: "https://picsum.photos/seed/seif-fnb-02/900/550", alt: "F&B detail" },
  { key: "seif-event-02", src: "https://picsum.photos/seed/seif-event-02/700/850", alt: "Event portrait" },
  { key: "seif-fashion-04", src: "https://picsum.photos/seed/seif-fashion-04/700/900", alt: "Fashion lifestyle" },
  { key: "seif-fnb-03", src: "https://picsum.photos/seed/seif-fnb-03/900/650", alt: "F&B ambience" },
];

// A dense grid packs cleanly regardless of count, but pulling too few
// photos still leaves the section looking sparse — and always showing the
// same fixed few gets stale as more get added. Shuffle and take a chunk.
function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export default async function HomePage() {
  const [logos, photos, moments] = await Promise.all([getLogos(), getPhotographyItems(), getMoments()]);
  const reelItems: PinItem[] =
    photos.length === 0
      ? PLACEHOLDER_REEL
      : pickRandom(photos, Math.min(photos.length, 14)).map((item) => ({
          key: item.id,
          src: mediaSrc(item.image, { width: 1400 })!,
          alt: item.caption || "Photograph",
          isVideo: item.image?.isVideo,
        }));

  return (
    <>
      <ScrollToTop />
      <Header active="home" transparent />

      <main>
        <section className="hero">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            poster="https://picsum.photos/seed/seif-showreel/1600/1000"
          >
            <source
              src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              type="video/mp4"
            />
          </video>
          <div className="hero-inner">
            <h1>Seif Moaz</h1>
            <p className="role-line">
              Creative Director <span className="sep">,</span> Visual Storyteller &amp; Editor
            </p>
            <div className="tagline-block">
              <p className="shoot-cats">Commercial — Brand Content — F&amp;B — Event Coverage</p>
              <p className="location">Egypt + Worldwide</p>
            </div>
          </div>
        </section>

        <Reveal as="section" className="brands wrap">
          <div className="brand-grid">
            {logos.length === 0 ? (
              <>
                <Link className="brand-name" href="/work">N&apos;GO</Link>
                <Link className="brand-name" href="/work">Waterman Paris</Link>
                <Link className="brand-name" href="/work">Adidas</Link>
                <Link className="brand-name" href="/work">Craghoppers</Link>
                <Link className="brand-name" href="/work">Flow State</Link>
                <Link className="brand-name" href="/work">Salomon</Link>
                <Link className="brand-name" href="/work">Gig</Link>
                <Link className="brand-name" href="/work">Stevens Bikes</Link>
              </>
            ) : (
              logos.map((logo) => (
                <a key={logo.id} className="brand-name" href={logo.href || "/work"}>
                  {logo.logo ? (
                    <NotionMedia media={logo.logo} alt={logo.name} className="brand-logo-img" trim />
                  ) : (
                    logo.name
                  )}
                </a>
              ))
            )}
          </div>
        </Reveal>

        <Reveal as="section" className="wrap shots">
          <div className="section-head">
            <h2>Moments from recent campaigns</h2>
          </div>
          <div className="shots-masonry">
            {moments.length === 0
              ? PLACEHOLDER_MOMENTS.map((shot) => (
                  <div className="shot-item" key={shot.id}>
                    <div className="shot-media">
                      <MomentVideo
                        src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                        poster={`https://picsum.photos/seed/${shot.id}/${shot.size}`}
                      />
                    </div>
                    <p className="shot-caption">{shot.caption}</p>
                  </div>
                ))
              : moments.map((moment) => {
                  const content = (
                    <>
                      <div className="shot-media">
                        <MomentVideo src={moment.videoUrl} />
                      </div>
                      {moment.caption && <p className="shot-caption">{moment.caption}</p>}
                    </>
                  );
                  return moment.projectSlug ? (
                    <Link className="shot-item" href={`/work/${moment.projectSlug}`} key={moment.id}>
                      {content}
                    </Link>
                  ) : (
                    <div className="shot-item" key={moment.id}>
                      {content}
                    </div>
                  );
                })}
          </div>
        </Reveal>

        <Reveal as="section" className="wrap reel" id="work">
          <div className="section-head">
            <h2>Photography</h2>
          </div>
          <PinterestGrid items={reelItems} />
          <div className="view-all-wrap">
            <Link className="view-all" href="/photography">View full archive →</Link>
          </div>
        </Reveal>

        <Reveal as="section" className="about" id="contact">
          <div className="wrap about-grid">
            <div className="about-photo">
              <img src="/uploads/contact-photo.jpg" alt="Seif Moaz" />
            </div>
            <div>
              <p className="hero-eyebrow" style={{ marginBottom: 16 }}>Contact</p>
              <h2>A hobby that got <span className="serif">a little out of hand.</span></h2>
              <p>
                Cairo based, shooting across fashion, F&amp;B, and live events for the past several years,
                after what started as a hobby turned into full time work. Every project starts the same
                way: understanding what actually needs to come out of the shoot, then finding the angle
                nobody else in the room would catch, whether that&apos;s a campaign, a menu, or a night
                that only happens once. Outside client work the camera doesn&apos;t really stop either:
                filming my own skydiving jumps, or putting together a summer montage every year that
                somehow keeps finding its way onto people&apos;s TikTok FYP.
              </p>
            </div>
          </div>

          <div className="wrap">
            <div className="about-stats">
              <div>
                <span className="stat-num">60+</span>
                <span className="stat-label">Brands worked with</span>
              </div>
              <div>
                <span className="stat-num">2M+ EGP</span>
                <span className="stat-label">Generated in combined brand revenue</span>
              </div>
              <div>
                <span className="stat-num">5M+</span>
                <span className="stat-label">Views generated across social media</span>
              </div>
            </div>
          </div>

          <div className="wrap">
            <form className="contact-form" action="mailto:contact@seifmoaz.com" method="POST" encType="text/plain">
              <div className="form-field">
                <label htmlFor="cf-first">First Name</label>
                <input type="text" id="cf-first" name="First Name" required />
              </div>
              <div className="form-field">
                <label htmlFor="cf-last">Last Name</label>
                <input type="text" id="cf-last" name="Last Name" required />
              </div>
              <div className="form-field">
                <label htmlFor="cf-email">Email</label>
                <input type="email" id="cf-email" name="Email" required />
              </div>
              <div className="form-field">
                <label htmlFor="cf-message">Message</label>
                <textarea id="cf-message" name="Message" rows={5} required></textarea>
              </div>
              <button type="submit" className="btn-primary form-submit">Send message</button>
            </form>
          </div>
        </Reveal>

        <Reveal as="section" className="testimonials" id="testimonials">
          <TestimonialCarousel />
        </Reveal>
      </main>

      <Footer />
    </>
  );
}
