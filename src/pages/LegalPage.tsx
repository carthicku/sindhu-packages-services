import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { site } from '../config/site';

type Props = { kind: 'privacy' | 'terms' | 'not-found' };

const content = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        h: 'Information you share',
        p: `When you use the Move Planner, you may share your name, phone number, email address, moving locations, preferred date and moving requirements. ${site.name} uses this information to respond to your enquiry and discuss your move.`,
      },
      { h: 'How it is used', p: 'Enquiry details are used to contact you about your relocation and to prepare arrangements you request. They are not sold.' },
      { h: 'Your choices', p: 'You can ask for your enquiry details to be updated or removed by contacting the company.' },
      { h: 'Full policy', p: 'The complete privacy policy for this website will be published by the company. Until then, please contact the company with any questions about your information.' },
    ],
  },
  terms: {
    title: 'Terms and Conditions',
    sections: [
      { h: 'Enquiries', p: 'Submitting the Move Planner is an enquiry, not a booking. Services, dates and quotations are confirmed only when agreed with you directly.' },
      { h: 'Availability', p: 'Service availability, coverage and specific arrangements depend on your requirements and are confirmed for each enquiry.' },
      { h: 'Full terms', p: 'The complete terms and conditions for services will be published by the company and shared with you before any arrangement is confirmed.' },
    ],
  },
  'not-found': {
    title: 'Page not found',
    sections: [{ h: 'This route does not lead anywhere', p: 'The page you were looking for does not exist. Head back to the homepage to continue planning your move.' }],
  },
} as const;

export function LegalPage({ kind }: Props) {
  const c = content[kind];
  useEffect(() => {
    document.title = `${c.title} — ${site.name}`;
    window.scrollTo(0, 0);
    return () => {
      document.title = `${site.name} — ${site.tagline}`;
    };
  }, [c.title]);

  return (
    <section className="section pt-36">
      <div className="container-site max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-navy-600 hover:text-navy-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
        </Link>
        <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">{c.title}</h1>
        <div className="mt-10 space-y-8">
          {c.sections.map((s) => (
            <div key={s.h}>
              <h2 className="text-xl font-extrabold text-navy-900">{s.h}</h2>
              <p className="mt-2 leading-relaxed text-navy-600">{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
