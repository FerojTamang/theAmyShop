import { AtSign, Gift, Heart, MessageSquareHeart, Music2, PackageCheck, WalletCards } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { usePublicStoreSettings } from "../../hooks/usePublicStoreSettings";

const footerLinkClass =
  "w-fit rounded-md text-sm font-semibold text-[#6F6570] transition hover:text-[#EC4C84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] focus-visible:ring-offset-2";

export function Footer() {
  const settings = usePublicStoreSettings();
  const [logoFailed, setLogoFailed] = useState(false);

  const showLogo = Boolean(settings.logoUrl && !logoFailed);

  return (
    <footer className="border-t border-[#F7D9E2] bg-[linear-gradient(145deg,#FFFDFD_0%,#FFF5F7_58%,#FFF8EF_100%)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_0.75fr_0.85fr_1.1fr] lg:px-8 lg:py-16">
        <div className="max-w-md">
          <Link className="inline-flex items-center gap-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] focus-visible:ring-offset-2" to="/">
            {showLogo ? (
              <img
                alt="The AMY Shop logo"
                className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-lg shadow-pink-200 ring-1 ring-[#F7D9E2]"
                onError={() => setLogoFailed(true)}
                src={settings.logoUrl ?? ""}
              />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#F06494] to-[#D93D73] text-white shadow-lg shadow-pink-200">
                <Gift className="h-7 w-7" />
              </span>
            )}
            <span>
              <span className="block text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>The AMY Shop</span>
              <span className="mt-1 block text-xs font-bold uppercase tracking-[0.16em] text-[#EC4C84]">Thoughtful gifting</span>
            </span>
          </Link>
          <p className="mt-5 text-sm leading-7 text-[#6F6570]">{settings.footerDescription}</p>
          {settings.instagramUrl || settings.tiktokUrl ? (
            <div className="mt-6 flex flex-wrap gap-3" aria-label="Social links">
              {settings.instagramUrl ? (
                <a className="inline-flex h-11 items-center gap-2 rounded-full border border-[#F7D9E2] bg-white/80 px-4 text-sm font-bold text-[#6F6570] shadow-sm transition hover:border-[#EC4C84] hover:text-[#EC4C84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84]" href={settings.instagramUrl} rel="noreferrer" target="_blank">
                  <AtSign className="h-4 w-4" /> Instagram
                </a>
              ) : null}
              {settings.tiktokUrl ? (
                <a className="inline-flex h-11 items-center gap-2 rounded-full border border-[#F7D9E2] bg-white/80 px-4 text-sm font-bold text-[#6F6570] shadow-sm transition hover:border-[#EC4C84] hover:text-[#EC4C84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84]" href={settings.tiktokUrl} rel="noreferrer" target="_blank">
                  <Music2 className="h-4 w-4" /> TikTok
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav className="grid content-start gap-3" aria-label="Footer shop navigation">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-[0.16em] text-[#1F1720]">Shop</h2>
          <Link className={footerLinkClass} to="/">Home</Link>
          <Link className={footerLinkClass} to="/products">Shop</Link>
          <Link className={footerLinkClass} to="/cart">Cart</Link>
        </nav>

        <nav className="grid content-start gap-3" aria-label="Footer account navigation">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-[0.16em] text-[#1F1720]">Account</h2>
          <Link className={footerLinkClass} to="/orders">My Orders</Link>
          <Link className={footerLinkClass} to="/account">My Account</Link>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#1F1720]">Store notes</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#6F6570]">
            <li className="flex gap-3"><WalletCards className="mt-0.5 h-4 w-4 shrink-0 text-[#EC4C84]" />Cash on Delivery available.</li>
            <li className="flex gap-3"><MessageSquareHeart className="mt-0.5 h-4 w-4 shrink-0 text-[#EC4C84]" />Gift message available.</li>
            <li className="flex gap-3"><PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#EC4C84]" />Personal touch options are being prepared.</li>
            <li className="flex gap-3"><Heart className="mt-0.5 h-4 w-4 shrink-0 text-[#EC4C84]" />Online payments will be available later.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#F7D9E2] bg-white/55 px-4 py-5 text-center text-xs font-medium text-[#8B7D86]">
        <span className="inline-flex items-center gap-1.5">
          © {new Date().getFullYear()} The AMY Shop <Heart className="h-3.5 w-3.5 text-[#EC4C84]" />
        </span>
      </div>
    </footer>
  );
}
