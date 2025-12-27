
import { createClient } from '@supabase/supabase-js';
import { MarketplaceItem, Message, ItemStatus, ItemType, Order, User, Notification } from '../types';

const SUPABASE_URL = 'https://tlzlgrxlesukzrolrsbz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aciCXZ6C0oBG8D-GME5WuQ_WnVNOy4j';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const supabaseService = {
  // --- ITEMS ---
  async fetchItems() {
    try {
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
    } catch (e: any) {
      console.error("Fetch items error:", e.message);
      return null;
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

  async updateItemStatus(itemId: string, type: ItemType, status: ItemStatus, recoveryRecord?: any) {
    const table = type === ItemType.MARKETPLACE ? 'market_listings' : 'lost_and_found';
    const updateData: any = { status: status.toLowerCase() };
    if (recoveryRecord) {
      updateData.recovery_record = {
        receiver_name: recoveryRecord.receiver_name,
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

  // --- MESSAGES ---
  async fetchMessages(currentUserId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles:sender_id(full_name, student_id)')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order('created_at', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data.map(m => ({
      id: m.id,
      itemId: m.item_id,
      senderId: m.sender_id,
      senderName: m.profiles?.full_name || 'Unknown',
      senderRollNumber: m.profiles?.student_id || '',
      text: m.content,
      timestamp: m.created_at
    })) as Message[];
  },

  async sendMessage(senderId: string, receiverId: string, itemId: string, text: string, receiverInfo?: { name: string, collegeId: string, avatarUrl?: string }) {
    // Lazy upsert the receiver so the message doesn't fail due to FK constraint
    if (receiverInfo) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: receiverId,
        full_name: receiverInfo.name,
        student_id: receiverInfo.collegeId,
        profile_photo: receiverInfo.avatarUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
      if (profileError) console.warn("Failed to lazy-sync receiver profile:", profileError.message);
    }

    const { error } = await supabase.from('messages').insert([{
      sender_id: senderId,
      receiver_id: receiverId,
      item_id: itemId,
      content: text
    }]);
    if (error) throw new Error(error.message);
  },

  // --- CART ---
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

  // --- NOTIFICATIONS ---
  async fetchNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type as ItemType,
      timestamp: n.created_at,
      itemId: n.item_id,
      read: n.read
    })) as Notification[];
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

  // --- ORDERS ---
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

  // --- PROFILES ---
  async upsertProfile(user: User) {
    // We attempt to upsert with id as the primary conflict target.
    // However, if the user provided a roll number that already exists for a different ID
    // (unlikely with our new deterministic IDs, but good for legacy safety), 
    // we use a safe retry or handle the conflict explicitly.
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: user.name,
      gmail: user.email,
      student_id: user.collegeId,
      profile_photo: user.avatarUrl,
      updated_at: new Date().toISOString()
    }, { 
      onConflict: 'id' 
    });
    
    if (error) {
      // If we still get a student_id uniqueness error, try upserting with student_id as the conflict target
      if (error.message.includes('student_id')) {
        const { error: retryError } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: user.name,
          gmail: user.email,
          student_id: user.collegeId,
          profile_photo: user.avatarUrl,
          updated_at: new Date().toISOString()
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
