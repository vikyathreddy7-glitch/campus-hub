import { createClient } from '@supabase/supabase-js';
import { MarketplaceItem, Message, ItemStatus, Order, User } from '../types';

const SUPABASE_URL = 'https://bxvdbkqucvlmvajofsdy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CL4ytggTwTADWFGvMicsJg_y6qwFBD_';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const supabaseService = {
  async fetchItems() {
    try {
      // Trying 'items' table instead of 'listings' as it's the more common schema default for this project
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Supabase fetch error:", error.message);
        return null;
      }

      // Map snake_case from DB back to camelCase for the app
      return (data as any[]).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.image_url,
        posterId: item.poster_id,
        posterName: item.poster_name,
        posterCollegeId: item.poster_college_id,
        posterAvatarUrl: item.poster_avatar_url,
        createdAt: item.created_at,
        status: item.status,
        type: item.type,
        location: item.location,
        priceUnit: item.price_unit,
        recoveryRecord: item.recovery_record ? {
          receiverName: item.recovery_record.receiver_name,
          collegeId: item.recovery_record.college_id,
          date: item.recovery_record.date
        } : undefined
      })) as MarketplaceItem[];
    } catch (e) {
      console.error("Unexpected error fetching items:", e);
      return null;
    }
  },

  async addItem(item: MarketplaceItem) {
    try {
      const dbRow = {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        category: item.category,
        image_url: item.imageUrl,
        poster_id: item.posterId,
        poster_name: item.posterName,
        poster_college_id: item.posterCollegeId,
        poster_avatar_url: item.posterAvatarUrl,
        created_at: item.createdAt,
        status: item.status,
        type: item.type,
        location: item.location,
        price_unit: item.priceUnit
      };

      const { error } = await supabase.from('items').insert([dbRow]);
      if (error) {
        console.error("Supabase insert error:", error.message, error.details);
        throw new Error(error.message);
      }
    } catch (e: any) {
      console.error("Error adding item:", e.message || e);
      throw e;
    }
  },

  async updateItemStatus(itemId: string, status: ItemStatus, recoveryRecord?: any) {
    const updateData: any = { status };
    if (recoveryRecord) {
      updateData.recovery_record = {
        receiver_name: recoveryRecord.receiverName,
        college_id: recoveryRecord.collegeId,
        date: recoveryRecord.date
      };
    }
    
    const { error } = await supabase.from('items').update(updateData).eq('id', itemId);
    if (error) {
      console.error("Error updating item status:", error.message);
      throw new Error(error.message);
    }
  },

  async deleteItem(itemId: string) {
    try {
      const { error } = await supabase.from('items').delete().eq('id', itemId);
      if (error) {
        console.error("Supabase delete error:", error.message);
        throw new Error(error.message);
      }
    } catch (e: any) {
      console.error("Error deleting item:", e.message || e);
      throw e;
    }
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

    const { error } = await supabase.from('messages').insert([dbPayload]);
    if (error) throw new Error(error.message);
  },

  async createOrder(order: Order) {
    const { error } = await supabase.from('orders').insert([order]);
    if (error) throw new Error(error.message);
  },

  async countReportsForTitle(title: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('title', title);
      
      if (error) throw error;
      return count || 0;
    } catch (e) {
      console.error("Error counting reports:", e);
      return 0;
    }
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
      console.error("Error upserting profile:", error.message);
      throw new Error(error.message);
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