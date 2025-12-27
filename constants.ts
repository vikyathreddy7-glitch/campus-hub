
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
  id: 'user_123',
  name: 'Rahul Sharma',
  collegeId: '121CS0001',
  email: 'rahul.s@nitrkl.ac.in',
  phone: '+91 98765 43210',
  year: '3rd Year',
  branch: 'Computer Science',
  notificationsEnabled: true
};

export const MOCK_ITEMS: MarketplaceItem[] = [
  {
    id: 'm1',
    title: 'Concepts of Physics - HC Verma',
    description: 'Vol 1 and 2, both in great condition. No torn pages.',
    price: 450,
    category: 'Books',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    posterId: 'user_999',
    posterName: 'Sneha Reddy',
    posterCollegeId: '122CS0101',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: ItemStatus.ACTIVE,
    type: ItemType.MARKETPLACE
  },
  {
    id: 'm2',
    title: 'Casio Scientific Calculator',
    description: 'FX-991EX Classwiz. Perfect for engineering students.',
    price: 800,
    category: 'Calculators',
    imageUrl: 'https://images.unsplash.com/photo-1594819047050-99defca82545?auto=format&fit=crop&q=80&w=800',
    posterId: 'user_888',
    posterName: 'Arjun Das',
    posterCollegeId: '121ME0202',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    status: ItemStatus.ACTIVE,
    type: ItemType.MARKETPLACE
  },
  {
    id: 'l1',
    title: 'Blue Water Bottle',
    description: 'Milton steel bottle found near the Central Library.',
    price: 0,
    category: 'Other',
    location: 'Central Library',
    imageUrl: 'https://images.unsplash.com/photo-1602143399827-705204433a23?auto=format&fit=crop&q=80&w=800',
    posterId: 'user_777',
    posterName: 'Security Desk',
    posterCollegeId: 'STAFF_01',
    createdAt: new Date(Date.now() - 10000000).toISOString(),
    status: ItemStatus.ACTIVE,
    type: ItemType.FOUND
  }
];
