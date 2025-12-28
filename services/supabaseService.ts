
import { createClient } from '@supabase/supabase-js';
import { MarketplaceItem, Message, ItemStatus, ItemType, Order, User, Notification, Report } from '../types';

const SUPABASE_URL = 'https://tlzlgrxlesukzrolrsbz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aciCXZ6C0oBG8D-GME5WuQ_WnVNOy4j';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes('fetch') || err.name === 'TypeError') {
        await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export const supabaseService = {
  async fetchItems(): Promise<MarketplaceItem[]> {
    try {
      return await withRetry(async () => {
        const [marketRes, lfRes] = await Promise.all([
          supabase.from('market_listings').select('*, profiles(full_name, student_id, profile_photo)'),
          supabase.from('lost_and_found').select('*, profiles(full_name, student_id, profile_photo)')
        ]);

        if (marketRes.error) throw new Error(marketRes.error.message);
        if (lfRes.error) throw new Error(lfRes.error.message);

        const marketItems = (marketRes.data || []).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          category: item.category,
          imageUrl: item.image_url,
          posterId: item.user_id,
          posterName: item.profiles?.full_name || 'Anonymous',
          posterCollegeId: item.profiles?.student_id || '',
          posterAvatarUrl: item.profiles?.profile_photo,
          createdAt: item.created_at,
          // Removed updatedAt mapping from item.updated_at to avoid potential missing column issues
          status: item.status.toUpperCase() as ItemStatus,
          type: ItemType.MARKETPLACE,
        }));

        const lfItems = (lfRes.data || []).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: 0,
          category: item.category,
          imageUrl: item.image_url,
          posterId: item.user_id,
          posterName: item.profiles?.full_name || 'Anonymous',
          posterCollegeId: item.profiles?.student_id || '',
          posterAvatarUrl: item.profiles?.profile_photo,
          createdAt: item.created_at,
          status: item.status.toUpperCase() as ItemStatus,
          type: item.type.toUpperCase() as ItemType,
          location: item.location,
          recoveryRecord: item.recovery_record ? {
            receiverName: item.recovery_record.receiver_name,
            collegeId: item.recovery_record.college_id,
            date: item.recovery_record.date
          } : undefined
        }));

        return [...marketItems, ...lfItems].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } catch (e: any) {
      console.warn("Fetch items failed after retries:", e.message);
      return [];
    }
  },

  async addItem(item: MarketplaceItem) {
    const table = item.type === ItemType.MARKETPLACE ? 'market_listings' : 'lost_and_found';
    const payload = item.type === ItemType.MARKETPLACE ? {
      id: item.id,
      user_id: item.posterId,
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.imageUrl,
      status: item.status.toLowerCase()
    } : {
      id: item.id,
      user_id: item.posterId,
      title: item.title,
      description: item.description,
      type: item.type.toLowerCase(),
      location: item.location,
      category: item.category,
      image_url: item.imageUrl,
      status: item.status.toLowerCase()
    };

    const { error } = await supabase.from(table).insert([payload]);
    if (error) throw new Error(error.message);
  },

  async updateItemDetails(itemId: string, type: ItemType, updates: Partial<MarketplaceItem>) {
    const table = type === ItemType.MARKETPLACE ? 'market_listings' : 'lost_and_found';
    const payload: any = {
      title: updates.title,
      description: updates.description,
    };

    if (type === ItemType.MARKETPLACE) {
      payload.price = updates.price;
    } else {
      payload.location = updates.location;
    }

    const { error } = await supabase.from(table).update(payload).eq('id', itemId);
    if (error) throw new Error(error.message);
  },

  async updateItemStatus(itemId: string, type: ItemType, status: ItemStatus, recoveryRecord?: any) {
    const table = type === ItemType.MARKETPLACE ? 'market_listings' : 'lost_and_found';
    const updateData: any = { 
      status: status.toLowerCase()
    };

    if (recoveryRecord) {
      updateData.recovery_record = {
        receiver_name: recoveryRecord.receiverName,
        college_id: recoveryRecord.college_id,
        date: recoveryRecord.date
      };
    }
    const { error } = await supabase.from(table).update(updateData).eq('id', itemId);
    if (error) throw new Error(error.message);
  },

  async deleteItem(itemId: string, type: ItemType) {
    const table = type === ItemType.MARKETPLACE ? 'market_listings' : 'lost_and_found';
    const { error } = await supabase.from(table).delete().eq('id', itemId);
    if (error) throw new Error(error.message);
  },

  async fetchMessages(currentUserId: string): Promise<Message[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*, profiles:sender_id(full_name, student_id)')
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .order('created_at', { ascending: true });
        
        if (error) throw new Error(error.message);
        return (data || []).map(m => ({
          id: m.id,
          itemId: m.item_id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          senderName: m.profiles?.full_name || 'Unknown',
          senderRollNumber: m.profiles?.student_id || '',
          text: m.content,
          timestamp: m.created_at
        })) as Message[];
      });
    } catch (e: any) {
      console.warn("Fetch messages failed:", e.message);
      return [];
    }
  },

  async sendMessage(senderId: string, receiverId: string, itemId: string | null, text: string, receiverInfo?: { name: string, collegeId: string, avatarUrl?: string }) {
    if (receiverInfo) {
      try {
        await supabase.from('profiles').upsert({
          id: receiverId,
          full_name: receiverInfo.name,
          student_id: receiverInfo.collegeId,
          profile_photo: receiverInfo.avatarUrl
        }, { onConflict: 'id' });
      } catch (profileError: any) {
        console.warn("Failed to lazy-sync receiver profile:", profileError.message);
      }
    }

    const { error } = await supabase.from('messages').insert([{
      sender_id: senderId,
      receiver_id: receiverId,
      item_id: itemId,
      content: text
    }]);
    if (error) throw new Error(error.message);
  },

  async syncCart(userId: string, itemIds: string[]) {
    try {
      await supabase.from('cart_items').delete().eq('user_id', userId);
      if (itemIds.length > 0) {
        const inserts = itemIds.map(id => ({ user_id: userId, listing_id: id }));
        await supabase.from('cart_items').insert(inserts);
      }
    } catch (e) {
      console.warn("Cart sync failed (check RLS)", e);
    }
  },

  async fetchNotifications(userId: string): Promise<Notification[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return (data || []).map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type as ItemType,
          timestamp: n.created_at,
          itemId: n.item_id,
          read: n.read
        })) as Notification[];
      });
    } catch (e: any) {
      console.warn("Fetch notifications failed:", e.message);
      return [];
    }
  },

  async addNotification(userId: string, notif: Partial<Notification>) {
    await supabase.from('notifications').insert([{
      user_id: userId,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      item_id: notif.itemId
    }]);
  },

  async markNotificationRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  },

  async clearNotifications(userId: string) {
    await supabase.from('notifications').delete().eq('user_id', userId);
  },

  async createOrder(order: Order) {
    const { error } = await supabase.from('orders').insert([{
      full_name: order.full_name,
      roll_number: order.roll_number,
      price: order.price,
      location: order.location,
      description: order.description,
      title: order.title,
      gmail: order.gmail,
      event_date: order.event_date,
      message: order.message
    }]);
    if (error) throw new Error(error.message);
  },

  async submitReport(report: Report) {
    const { error: insertError } = await supabase.from('reports').insert([{
      item_id: report.item_id,
      reporter_id: report.reporter_id,
      reporter_name: report.reporter_name,
      reporter_roll: report.reporter_roll,
      reason: report.reason,
      item_title: report.item_title
    }]);

    if (insertError) {
      console.error("Supabase report submission failed:", insertError.message);
      throw new Error(`DATABASE_ERROR: ${insertError.message}`);
    }

    const { count, error: countError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', report.item_id);

    if (!countError && count !== null && count >= 5) {
      await this.updateItemStatus(report.item_id, report.item_type, ItemStatus.DELETED);

      await this.addNotification(report.poster_id, {
        title: "Item Removed (Moderation)",
        message: `Your item '${report.item_title}' has been removed following multiple community reports. If this is repeated for the next time your account will be banned for the next 7 days.`,
        type: report.item_type,
        itemId: report.item_id
      });
    }
  },

  async upsertProfile(user: User) {
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: user.name,
      gmail: user.email,
      student_id: user.collegeId,
      profile_photo: user.avatarUrl
      // Removed manual updated_at to fix schema cache error
    }, { 
      onConflict: 'id' 
    });
    
    if (error) {
      if (error.message.includes('student_id')) {
        const { error: retryError } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: user.name,
          gmail: user.email,
          student_id: user.collegeId,
          profile_photo: user.avatarUrl
        }, { 
          onConflict: 'student_id' 
        });
        if (retryError) throw new Error(`DATABASE_ERROR: ${retryError.message}`);
        return;
      }
      console.error("Supabase upsertProfile failed:", error.message);
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }
  }
};
