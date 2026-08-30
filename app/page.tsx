import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import NotionMedia from "@/components/NotionMedia";
import ScrollToTop from "@/components/ScrollToTop";
import { getLogos, getPhotographyItems } from "@/lib/notion";

export const revalidate = 60;

const PLACEHOLDER_REEL = [
  { seed: "seif-fashion-01", size: "700/900", alt: "Editorial fashion photography" },
  { seed: "seif-fnb-01", size: "900/600", alt: "F&B photography" },
  { seed: "seif-event-01", size: "700/700", alt: "Event photography" },
  { seed: "seif-fashion-03", size: "700/1000", alt: "Fashion campaign" },
  { seed: "seif-fnb-02", size: "900/550", alt: "F&B detail" },
  { seed: "seif-event-02", size: "700/850", alt: "Event portrait" },
  { seed: "seif-fashion-04", size: "700/900", alt: "Fashion lifestyle" },
  { seed: "seif-fnb-03", size: "900/650", alt: "F&B ambience" },
];

export default async function HomePage() {
  const [logos, photos] = await Promise.all([getLogos(), getPhotographyItems()]);
  const reelItems = photos.slice(0, 8);

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
                <a key={logo.id} className="brand-name" href={logo.link || "/work"}>
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
            {[
              { seed: "shot-01", size: "700/900", caption: <><b>Adidas</b> — Season launch, on-location detail shot.</> },
              { seed: "shot-02", size: "900/600", caption: <><b>Flow State</b> — Grit &amp; Gloss campaign, wide establishing shot.</> },
              { seed: "shot-03", size: "700/700", caption: <><b>Puma</b> — Training capsule, product-in-motion still.</> },
              { seed: "shot-04", size: "700/1000", caption: <><b>Salomon</b> — Trail campaign, portrait close-up.</> },
              { seed: "shot-05", size: "900/550", caption: <><b>Gig</b> — Content campaign, behind-the-scenes b-roll frame.</> },
              { seed: "shot-06", size: "700/850", caption: <><b>Craghoppers</b> — Outdoor gear shoot, environmental portrait.</> },
            ].map((shot) => (
              <div className="shot-item" key={shot.seed}>
                <div className="shot-media">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={`https://picsum.photos/seed/${shot.seed}/${shot.size}`}
                  >
                    <source
                      src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                      type="video/mp4"
                    />
                  </video>
                </div>
                <p className="shot-caption">{shot.caption}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal as="section" className="wrap reel" id="work">
          <div className="section-head">
            <h2>Photography</h2>
          </div>
          <div className="reel-masonry">
            {reelItems.length === 0
              ? PLACEHOLDER_REEL.map((item) => (
                  <div className="reel-item" key={item.seed}>
                    <img src={`https://picsum.photos/seed/${item.seed}/${item.size}`} alt={item.alt} />
                  </div>
                ))
              : reelItems.map((item) => (
                  <div className="reel-item" key={item.id}>
                    <NotionMedia media={item.image} alt={item.caption || "Photograph"} />
                  </div>
                ))}
          </div>
          <div className="view-all-wrap">
            <Link className="view-all" href="/photography">View full archive →</Link>
          </div>
        </Reveal>

        <Reveal as="section" className="about" id="contact">
          <div className="wrap about-grid">
            <div className="about-photo">
              <img src="https://picsum.photos/seed/seif-portrait/800/600" alt="Portrait" />
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
