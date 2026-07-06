import { Link } from "@tanstack/react-router";
import { Sparkles, Instagram, Twitter, Facebook, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-display text-2xl font-black">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              ShopSphere
            </Link>
            <p className="mt-4 max-w-xs text-sm text-primary-foreground/70">
              A modern marketplace for the objects you'll actually reach for. Curated, considered,
              delivered.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/20 text-primary-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Shop">
            <FooterLink to="/shop">All products</FooterLink>
            <FooterLink to="/categories">Categories</FooterLink>
            <FooterLink to="/shop" search={{ sort: "newest" } as never}>
              New arrivals
            </FooterLink>
            <FooterLink to="/shop" search={{ flash: "1" } as never}>
              Flash sale
            </FooterLink>
          </FooterCol>

          <FooterCol title="Account">
            <FooterLink to="/auth">Sign in</FooterLink>
            <FooterLink to="/orders">My orders</FooterLink>
            <FooterLink to="/wishlist">Wishlist</FooterLink>
            <FooterLink to="/dashboard">Dashboard</FooterLink>
          </FooterCol>

          <FooterCol title="Company">
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <a className="text-sm text-primary-foreground/70 hover:text-accent" href="#">
              Careers
            </a>
            <a className="text-sm text-primary-foreground/70 hover:text-accent" href="#">
              Press
            </a>
          </FooterCol>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 text-xs text-primary-foreground/50 sm:flex-row">
          <p>© {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Shipping</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">{title}</h4>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FooterLink(props: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
    />
  );
}
