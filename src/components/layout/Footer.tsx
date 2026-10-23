import { Facebook, Instagram, Linkedin, Twitter, Youtube, type LucideIcon } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { enabledServices, type Service } from '../../config/services';
import { site, type PhoneNumber, type SocialLink } from '../../config/site';
import { useMove } from '../../context/MoveContext';
import { useSectionLink } from './Header';
import { BrandLogo } from './Logo';
import { navItems } from './nav';

const socialIcons: Record<SocialLink['label'], LucideIcon> = {
  Facebook,
  Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
  X: Twitter,
};

const linkClass = 'text-[15px] text-navy-100 transition hover:text-white';

/** Phone numbers separated by slashes, each one tappable. */
function PhoneLinks({ numbers }: { numbers: PhoneNumber[] }) {
  return (
    <>
      {numbers.map((n, i) => (
        <Fragment key={n.tel}>
          {i > 0 && <span className="text-navy-300"> / </span>}
          <a href={`tel:${n.tel}`} className="transition hover:text-amber-300">
            {n.display}
          </a>
        </Fragment>
      ))}
    </>
  );
}

function ColumnHeading({ children }: { children: string }) {
  return <h3 className="text-lg font-extrabold text-white">{children}</h3>;
}

function ServiceLink({ service }: { service: Service }) {
  const { openPlanner } = useMove();
  const sectionLink = useSectionLink();
  const { action } = service;
  if (action.kind === 'section') {
    return (
      <a href={`/#${action.target}`} onClick={sectionLink(action.target)} className={linkClass}>
        {service.title}
      </a>
    );
  }
  return (
    <a
      href="/#planner"
      onClick={(e) => {
        if (window.location.pathname !== '/') return;
        e.preventDefault();
        openPlanner({ moveType: action.moveType, requirement: action.requirement });
      }}
      className={linkClass}
    >
      {service.title}
    </a>
  );
}

export function Footer() {
  const sectionLink = useSectionLink();
  const { office, customerCare, email, supportEmail, address } = site.contact;

  return (
    <footer className="on-dark relative overflow-hidden bg-navy-800 text-white">
      {/* Faint swoosh in the background, echoing the logo */}
      <svg aria-hidden="true" viewBox="0 0 600 400" className="pointer-events-none absolute -left-24 bottom-0 h-[420px] w-[640px] text-white/[0.04]">
        <path d="M0 180C160 60 380 40 600 120 420 110 230 150 60 260Z" fill="currentColor" />
        <path d="M20 300C190 180 400 170 590 230 410 230 240 260 90 380Z" fill="currentColor" />
      </svg>

      <div className="container-site relative py-16 lg:py-20">
        {/* Logo with the main phone numbers and email */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Link to="/" onClick={sectionLink('top')} className="w-fit rounded-lg" aria-label={`${site.name} — home`}>
            <BrandLogo white className="h-20 w-auto sm:h-24" />
          </Link>
          <div>
            {office.length > 0 && (
              <p className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                <PhoneLinks numbers={office} />
              </p>
            )}
            {email && (
              <a href={`mailto:${email}`} className="mt-3 inline-block break-all text-lg font-bold transition hover:text-amber-300 sm:text-2xl">
                {email}
              </a>
            )}
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          {site.gst.length > 0 && (
            <div className="lg:col-span-4">
              <h3 className="text-2xl font-extrabold sm:text-3xl">GST Details</h3>
              <dl className="mt-4 space-y-1.5 text-[15px]">
                {site.gst.map((g) => (
                  <div key={g.number} className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold text-navy-100">{g.state} GST:</dt>
                    <dd className="font-semibold tracking-wide">{g.number}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
            <nav aria-label="Footer">
              <ColumnHeading>Quick Links</ColumnHeading>
              <ul className="mt-4 space-y-2.5">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <a href={item.id === 'top' ? '/' : `/#${item.id}`} onClick={sectionLink(item.id)} className={linkClass}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <ColumnHeading>Our Services</ColumnHeading>
              <ul className="mt-4 space-y-2.5">
                {enabledServices.map((s) => (
                  <li key={s.id}>
                    <ServiceLink service={s} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-7">
              {address && (
                <div>
                  <ColumnHeading>Address</ColumnHeading>
                  <address className="mt-3 text-[15px] not-italic leading-relaxed text-navy-100">{address}</address>
                </div>
              )}
              {customerCare.length > 0 && (
                <div>
                  <ColumnHeading>Customer Care</ColumnHeading>
                  <p className="mt-3 text-[15px] text-navy-100">
                    <PhoneLinks numbers={customerCare} />
                  </p>
                </div>
              )}
              {supportEmail && (
                <div>
                  <ColumnHeading>Email Us</ColumnHeading>
                  <a href={`mailto:${supportEmail}`} className={`mt-3 inline-block break-all ${linkClass}`}>
                    {supportEmail}
                  </a>
                </div>
              )}
              {site.social.length > 0 && (
                <ul className="flex gap-2" aria-label="Social media">
                  {site.social.map((s) => {
                    const Icon = socialIcons[s.label];
                    return (
                      <li key={s.href}>
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-navy-100 transition hover:border-amber-400 hover:text-amber-300"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="sr-only">{s.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-navy-950/60">
        <div className="container-site flex flex-col gap-4 py-6 text-sm text-navy-200 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.year} All Rights Reserved | {site.name}
          </p>
          <ul className="flex gap-6">
            <li>
              <Link to="/terms" className="transition hover:text-white">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="transition hover:text-white">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
