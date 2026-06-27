import { SocialLinks } from "./social-links";
import { LandingNavLinkItem } from "./landing-nav-link";
import type { LandingNavigationView } from "../landing-navigation";
import type { LandingSocialLink } from "../landing-view-model";

interface LandingFooterProps {
  readonly navigation: LandingNavigationView;
  readonly social: readonly LandingSocialLink[];
}

/**
 * Footer with Menu / Page section links and social — like azaharpr.com.
 */
export function LandingFooter({ navigation, social }: LandingFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="menu-accent-bg border-t border-white/10 px-6 py-14 text-white/90">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.3em] text-white/60">
            Carta
          </h2>
          <ul className="mt-4 space-y-2">
            {navigation.footerMenuLinks.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <LandingNavLinkItem link={link} variant="footer" />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.3em] text-white/60">
            Página
          </h2>
          <ul className="mt-4 space-y-2">
            {navigation.footerPageLinks.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <LandingNavLinkItem link={link} variant="footer" />
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center md:text-left">
          {social.length > 0 ? (
            <>
              <h2 className="text-xs font-medium uppercase tracking-[0.3em] text-white/60">
                Síguenos
              </h2>
              <div className="mt-4 [&_a]:text-white/80 [&_a:hover]:text-white">
                <SocialLinks links={social} />
              </div>
            </>
          ) : null}
          <p className="mt-8 font-heading text-2xl font-medium tracking-wide">
            {navigation.restaurantName}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/60">
            © {year} Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
