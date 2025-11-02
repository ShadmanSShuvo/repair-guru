
import { Category } from './types';
import PlumbingIcon from './components/icons/PlumbingIcon';
import ElectricalIcon from './components/icons/ElectricalIcon';
import ApplianceIcon from './components/icons/ApplianceIcon';

export const SERVICE_CATEGORIES: Category[] = [
  {
    name: 'Plumbing',
    description: 'Leaking pipes, clogged drains, faucet issues, etc.',
    icon: PlumbingIcon,
  },
  {
    name: 'Electrical',
    description: 'Outlets not working, light fixture problems, wiring issues.',
    icon: ElectricalIcon,
  },
  {
    name: 'Appliances',
    description: 'Refrigerator, washing machine, AC, or other appliance repair.',
    icon: ApplianceIcon,
  },
];
