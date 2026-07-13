import { Gift, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-[#F7D9E2] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div className="max-w-md">
          <Link className="inline-flex items-center gap-3" to="/">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
              <Gift className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>The AMY Shop</span>
              <span className="text-xs text-[#9D8F98]">Thoughtful gifts, softly wrapped</span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-[#6F6570]">
            Browse currently available gifts chosen to make meaningful moments feel a little more special.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm font-semibold text-[#6F6570] sm:grid-cols-4" aria-label="Footer navigation">
          <Link className="hover:text-[#EC4C84]" to="/products">Shop</Link>
          <Link className="hover:text-[#EC4C84]" to="/orders">My Orders</Link>
          <Link className="hover:text-[#EC4C84]" to="/account">My Account</Link>
          <Link className="hover:text-[#EC4C84]" to="/cart">Cart</Link>
        </nav>
      </div>
      <div className="border-t border-[#F7D9E2] bg-[#FFF9FA] px-4 py-4 text-center text-xs text-[#8B7D86]">
        <span className="inline-flex items-center gap-1.5">
          © {new Date().getFullYear()} The AMY Shop <Heart className="h-3.5 w-3.5 text-[#EC4C84]" />
        </span>
      </div>
    </footer>
  );
}
