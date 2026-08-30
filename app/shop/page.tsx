import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata = {
  title: "Shop — Seif Moaz",
};

export default function ShopPage() {
  return (
    <>
      <ScrollToTop />
      <Header active="shop" />
      <main className="coming-soon">
        <div>
          <h1>
            Currently
            <span className="accent-word">developing.</span>
          </h1>
          <p className="sub">Presets, LUTs &amp; more, on the way</p>
        </div>
      </main>
    </>
  );
}
