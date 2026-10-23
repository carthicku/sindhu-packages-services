import { useMove } from '../context/MoveContext';
import { JourneySection, type Stage } from './JourneySection';

const homeStages: Stage[] = [
  {
    title: 'Your Current Home',
    body: 'Every home is different. Before moving day, it helps to know which belongings need attention — from the sofa to the smallest fragile item.',
    areas: [
      { id: 'furniture', zone: 'living', label: 'Sofas & furniture', detail: 'Large furniture may need wrapping or dismantling before it is moved. Mention bulky pieces in your enquiry.' },
      { id: 'beds', zone: 'bedroom', label: 'Beds & mattresses', detail: 'Beds and mattresses take up space and may need protective covers. Let us know how many there are.' },
      { id: 'kitchen', zone: 'kitchen', label: 'Kitchen equipment', detail: 'Utensils, crockery and small appliances are usually packed together in cartons, room by room.' },
      { id: 'appliances', zone: 'kitchen', label: 'Appliances', detail: 'Refrigerators, washing machines and similar appliances may need preparation before moving day.' },
      { id: 'electronics', zone: 'living', label: 'Electronics', detail: 'Televisions, computers and other electronics benefit from careful wrapping and padding.' },
      { id: 'clothing', zone: 'bedroom', label: 'Clothing & personal items', detail: 'Wardrobes and personal belongings are easier to unpack when cartons are labelled by room.' },
      { id: 'fragile', zone: 'dining', label: 'Fragile belongings', detail: 'Glassware, décor and other delicate items should be identified early so they can be packed appropriately.' },
      { id: 'cartons', zone: 'cartons', label: 'Household cartons', detail: 'An approximate idea of how much needs to be packed helps when discussing your requirements.' },
    ],
  },
  {
    title: 'Packing Day',
    body: 'Delicate belongings are wrapped, everyday items go into cartons, and everything is gathered room by room in one staging area, ready to go.',
  },
  {
    title: 'Loading the Truck',
    body: 'Packed cartons and wrapped furniture are carried out and loaded into the truck, so belongings travel together.',
  },
  {
    title: 'Transportation',
    body: 'Your belongings make the journey to your new address. The route and timing are agreed with you as part of your arrangements.',
  },
  {
    title: 'Your New Home',
    body: 'Cartons and furniture are brought inside and placed in their new rooms — and the new space starts to feel like home.',
  },
];

const officeStages: Stage[] = [
  {
    title: 'The Existing Workspace',
    body: 'A clear picture of your current office makes planning easier. Select an area to see what it means for your relocation.',
    areas: [
      { id: 'workstations', zone: 'workstations', label: 'Workstations', detail: 'Desks, chairs and personal items at each workstation. The approximate number of workstations is the most useful starting point.' },
      { id: 'meeting', zone: 'meeting', label: 'Meeting Room', detail: 'Meeting tables, chairs, screens and other shared furniture that need to be planned for separately.' },
      { id: 'it', zone: 'it', label: 'IT Equipment', detail: 'Monitors, computers, printers and other equipment. Let us know what you have so packing can be discussed.' },
      { id: 'storage', zone: 'storage', label: 'Storage', detail: 'Cabinets, files and documents can be organised into cartons and labelled by department.' },
    ],
  },
  {
    title: 'Preparation and Packing',
    body: 'Monitors and accessories are packed, documents organised into cartons, and boxes labelled by room or department so the new office comes together in order.',
  },
  {
    title: 'Loading and Transportation',
    body: 'Prepared furniture, equipment and labelled cartons are loaded into the truck and transported to your new address according to the agreed arrangements.',
  },
  {
    title: 'The New Office',
    body: 'Desks, chairs, monitors and cabinets arrive and are placed in the new workspace — organised and ready for your team.',
  },
];

export function HomeJourney() {
  const { openPlanner } = useMove();
  return (
    <JourneySection
      id="home-relocation"
      kind="home"
      eyebrow="Home relocation"
      heading="Your Home Moves With You."
      intro="From furniture and appliances to everyday essentials, plan your household relocation with a process designed around your moving requirements."
      stages={homeStages}
      stageProgress={[0, 1, 2, 3, 4]}
      sceneLabel="A cutaway apartment whose belongings are packed, loaded into the branded truck, driven along an orange route and placed into a new home."
      cta={{
        title: 'Planning a home relocation?',
        body: 'Share your home size, locations and requirements in the Move Planner.',
        button: 'Get a Home Moving Quote',
        onClick: () => openPlanner({ moveType: 'home' }),
      }}
    />
  );
}

export function OfficeJourney() {
  const { openPlanner } = useMove();
  return (
    <JourneySection
      id="office-relocation"
      kind="office"
      eyebrow="Office relocation"
      heading="A New Workspace. A Smoother Transition."
      intro="Plan your office relocation with a clear process for preparing workplace furniture, equipment, documents and other business essentials."
      stages={officeStages}
      stageProgress={[0, 1, 2.65, 4]}
      sceneLabel="A cutaway office with workstations, a meeting room, IT equipment and storage, packed into labelled cartons, transported and arranged in a new office."
      cta={{
        title: 'Planning a business move?',
        body: 'Tell us about your workstations, equipment and preferred moving date.',
        button: 'Request an Office Relocation Quote',
        onClick: () => openPlanner({ moveType: 'office' }),
      }}
    />
  );
}
