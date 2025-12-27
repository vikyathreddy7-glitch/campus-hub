
import { MarketplaceItem, ItemStatus, ItemType } from './types';

export const MARKETPLACE_CATEGORIES = [
  'All',
  'Books',
  'Calculators',
  'Bicycles',
  'Electronics',
  'Hostel Essentials',
  'Other'
];

export const LOST_FOUND_CATEGORIES = [
  'All',
  'ID Cards',
  'Wallets/Keys',
  'Electronics',
  'Books/Bags',
  'Clothing',
  'Other'
];

export const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Rahul Sharma',
  collegeId: '121CS0001',
  email: 'rahul.s@nitrkl.ac.in',
  phone: '+91 98765 43210',
  year: '3rd Year',
  branch: 'Computer Science',
  notificationsEnabled: true
};

export const MOCK_ITEMS: MarketplaceItem[] = [];
