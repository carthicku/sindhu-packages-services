export type NavItem = { id: string; label: string };

/** Header navigation — each id is a section on the homepage. */
export const navItems: NavItem[] = [
  { id: 'top', label: 'Home' },
  { id: 'home-relocation', label: 'Home Relocation' },
  { id: 'office-relocation', label: 'Office Relocation' },
  { id: 'services', label: 'All Services' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'about', label: 'About Us' },
  { id: 'contact', label: 'Contact' },
];

/** Stops on the route rail that runs alongside the page on large screens. */
export const routeStops: NavItem[] = [
  { id: 'top', label: 'Start' },
  { id: 'choose', label: 'Home or office' },
  { id: 'home-relocation', label: 'Home relocation' },
  { id: 'office-relocation', label: 'Office relocation' },
  { id: 'services', label: 'Services' },
  { id: 'planner', label: 'Move Planner' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Arrive' },
];
