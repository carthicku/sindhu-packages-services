import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from '../context/MoveContext';
import { ChooseExperience } from '../sections/ChooseExperience';
import { Hero } from '../sections/Hero';
import { About, Coverage, Faq, FinalCta, HowItWorks, Testimonials, WhyChoose } from '../sections/InfoSections';
import { HomeJourney, OfficeJourney } from '../sections/Journeys';
import { MovePlanner } from '../sections/MovePlanner';
import { Services } from '../sections/Services';

export function HomePage() {
  const { hash } = useLocation();

  // Support deep links such as /#planner, including arrivals from other pages.
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.setTimeout(() => scrollToSection(id), 60);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <>
      <Hero />
      <ChooseExperience />
      <HomeJourney />
      <OfficeJourney />
      <Services />
      <MovePlanner />
      <WhyChoose />
      <HowItWorks />
      <Coverage />
      <Testimonials />
      <About />
      <Faq />
      <FinalCta />
    </>
  );
}
