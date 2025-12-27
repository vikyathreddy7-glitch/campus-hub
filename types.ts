
export enum ItemType {
  MARKETPLACE = 'MARKETPLACE',
  LOST = 'LOST',
  FOUND = 'FOUND'
}

export enum ItemStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  RECOVERED = 'RECOVERED'
}

export interface User {
  id: string;
  name: string;
  collegeId: string; // Maps to student_id in SQL
  email: string;     // Maps to gmail in SQL
  phone: string;
  year: string;
  branch: string;
  avatarUrl?: string; // Maps to profile_photo in SQL
  notificationsEnabled: boolean;
}

export interface RecoveryRecord {
  receiverName: string;
  collegeId: string;
  date: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  posterId: string;
  posterName: string;
  posterCollegeId: string; 
  posterAvatarUrl?: string;
  createdAt: string;
  status: ItemStatus;
  type: ItemType;
  location?: string;
  priceUnit?: 'day' | 'week' | 'once';
  recoveryRecord?: RecoveryRecord;
}

export interface Message {
  id: string;
  itemId: string;
  senderId: string;
  senderName: string;
  senderRollNumber: string;
  text: string;
  timestamp: string;
}

export interface ChatThread {
  itemId: string;
  itemTitle: string;
  itemImageUrl?: string;
  messages: Message[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: ItemType;
  timestamp: string;
  itemId: string;
  read: boolean;
}

export interface Order {
  id?: string;
  full_name: string;
  roll_number: string;
  price: number;
  location: string;
  description: string;
  title: string;
  gmail: string;
  event_date: string;
  message?: string;
  created_at?: string;
}
