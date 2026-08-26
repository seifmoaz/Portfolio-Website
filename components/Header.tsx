"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavKey = "home" | "work" | "photography" | "shop";

const NAV_LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: "home", href: "/", label: "Home" },
  { key: "work", href: "/work", label: "Work" },
  { key: "photography", href: "/photography", label: "Photography" },
  { key: "shop", href: "/shop", label: "Shop" },
];

function SocialLinks({ size }: { size: number }) {
  return (
    <>
      <a
        href="https://www.instagram.com/seif__moaz/"
        target="_blank"
        rel="noopener"
        aria-label="Instagram"
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a href="https://www.behance.net/seifmoaz1" target="_blank" rel="noopener" aria-label="Behance">
        <svg width={size + 2} height={size + 2} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 7h6.2c2.9 0 3.9 3.4 1.4 4.5 3 .6 3.3 5-.5 5H2V7z" />
          <path d="M2 11.3h5.6" />
          <path d="M14 12.2c0-2 1.6-3 3.4-3 2 0 3.4 1.2 3.4 3.3v.4h-5.7c0 1.6 1 2.6 2.4 2.6 1 0 1.7-.4 2-1.1h1.2c-.4 1.4-1.7 2.2-3.2 2.2-2.1 0-3.5-1.5-3.5-3.7v-.7z" />
          <path d="M15 9.2h4.6" />
        </svg>
      </a>
      <a href="https://www.linkedin.com/in/seifmoaz" target="_blank" rel="noopener" aria-label="LinkedIn">
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <line x1="7.5" y1="10" x2="7.5" y2="17" />
          <circle cx="7.5" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
          <path d="M11.5 17v-4.3c0-1.5 1-2.4 2.3-2.4 1.3 0 2.2.9 2.2 2.4V17" />
        </svg>
      </a>
    </>
  );
}

export default function Header({
  active,
  transparent = false,
}: {
  active?: NavKey;
  transparent?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const contactHref = active === "home" ? "#contact" : "/#contact";

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const headerClass = [
    transparent ? "header-transparent" : "header-solid",
    transparent && scrolled ? "scrolled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={headerClass}>
        <div className="wrap nav-wrap">
          <nav>
            <button
              className={`menu-toggle${menuOpen ? " open" : ""}`}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="menu-icon">
                <span></span>
                <span></span>
              </span>
            </button>
            <div className="logo-mark">
              <Link href="/" style={{ display: "flex" }}>
                <img src="/logo.png" alt="Seif Moaz" className="logo-img" />
              </Link>
            </div>
            <ul className="nav-links">
              {NAV_LINKS.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className={active === link.key ? "active" : undefined}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={contactHref}>Contact</Link>
              </li>
            </ul>
            <div className="nav-social">
              <SocialLinks size={22} />
            </div>
          </nav>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`} id="mobileMenu">
        <div className="mobile-menu-links-wrap">
          <ul className="mobile-menu-links">
            {NAV_LINKS.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className={active === link.key ? "active" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={contactHref} onClick={() => setMenuOpen(false)}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className="mobile-menu-social">
          <SocialLinks size={20} />
        </div>
      </div>
    </>
  );
}
