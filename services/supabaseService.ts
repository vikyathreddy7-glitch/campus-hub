
import { createClient } from '@supabase/supabase-js';
import { MarketplaceItem, Message, ItemStatus, Order, User } from '../types';

const SUPABASE_URL = 'https://bxvdbkqucvlmvajofsdy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CL4ytggTwTADWFGvMicsJg_y6qwFBD_';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const supabaseService = {
  async fetchItems() {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) return null;
      return data as MarketplaceItem[];
    } catch (e) {
      return null;
    }
  },

  async addItem(item: MarketplaceItem) {
    try {
      const { error } = await supabase.from('listings').insert([item]);
      if (error) throw error;
    } catch (e) {
      console.error("Error adding item:", e);
      throw e;
    }
  },

  async updateItemStatus(itemId: string, status: ItemStatus, recoveryRecord?: any) {
    const updateData: any = { status };
    if (recoveryRecord) updateData.recoveryRecord = recoveryRecord;
    await supabase.from('listings').update(updateData).eq('id', itemId);
  },

  async fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) return null;

      return data.map(dbMsg => ({
        id: dbMsg.id,
        itemId: dbMsg.metadata?.itemId || '',
        senderId: dbMsg.sender_id,
        senderName: dbMsg.metadata?.senderName || 'Unknown',
        senderRollNumber: dbMsg.metadata?.senderRollNumber || '',
        text: dbMsg.content,
        timestamp: dbMsg.created_at
      })) as Message[];
    } catch (e) {
      return null;
    }
  },

  async sendMessage(message: Message, recipientId?: string) {
    const dbPayload = {
      sender_id: message.senderId,
      recipient_id: recipientId || null,
      content: message.text,
      metadata: {
        itemId: message.itemId,
        senderName: message.senderName,
        senderRollNumber: message.senderRollNumber
      }
    };

    const { error } = await supabase
      .from('messages')
      .insert([dbPayload]);
    
    if (error) throw error;
  },

  async createOrder(order: Order) {
    const { error } = await supabase.from('orders').insert([order]);
    if (error) throw error;
  },

  async upsertProfile(user: User) {
    const profileData = {
      id: user.id,
      full_name: user.name,
      gmail: user.email,
      student_id: user.collegeId,
      profile_photo: user.avatarUrl
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });
    
    if (error) {
      console.error("Error upserting profile:", error);
      throw error;
    }
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) return null;
    return data;
  }
};
