
import { createClient } from '@supabase/supabase-js';
import { MarketplaceItem, Message, ItemStatus, ItemType, Order, User, Notification, Report, CarouselSlide } from '../types';

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

/**
 * Utility to extract profile data robustly.
 */
const getProfileData = (profiles: any) => {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0] || null;
  return profiles;
};

/**
 * Enhanced defensive string conversion utility.
 * Strictly prevents [object Object] from leaking into the UI.
 */
const safeString = (val: any): string => {
  if (val === null || val === undefined) return '';
  
  if (typeof val === 'string') {
    return (val === '[object Object]' || val.trim() === '') ? '' : val;
  }

  if (typeof val === 'object') {
    // Attempt to extract meaningful text from common object structures returned by Supabase joins or AI
    const commonKeys = ['full_name', 'title', 'text', 'message', 'content', 'name'];
    for (const key of commonKeys) {
      if (val[key] && typeof val[key] === 'string') return val[key];
    }
    return '';
  }

  const s = String(val);
  return (s === '[object Object]') ? '' : s;
};

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

        const marketItems = (marketRes.data || []).map(item => {
          const profile = getProfileData(item.profiles);
          return {
            id: safeString(item.id),
            title: safeString(item.title),
            description: safeString(item.description),
            price: Number(item.price || 0),
            category: safeString(item.category || 'Other'),
            imageUrl: safeString(item.image_url),
            posterId: safeString(item.user_id),
            posterName: safeString(profile?.full_name || 'Anonymous'),
            posterCollegeId: safeString(profile?.student_id || ''),
            posterAvatarUrl: profile?.profile_photo ? safeString(profile.profile_photo) : undefined,
            createdAt: safeString(item.created_at),
            updatedAt: item.updated_at ? safeString(item.updated_at) : undefined,
            status: (safeString(item.status) || 'active').toUpperCase() as ItemStatus,
            type: ItemType.MARKETPLACE,
          };
        });

        const lfItems = (lfRes.data || []).map(item => {
          const profile = getProfileData(item.profiles);
          return {
            id: safeString(item.id),
            title: safeString(item.title),
            description: safeString(item.description),
            price: 0,
            category: safeString(item.category || 'Other'),
            imageUrl: safeString(item.image_url),
            posterId: safeString(item.user_id),
            posterName: safeString(profile?.full_name || 'Anonymous'),
            posterCollegeId: safeString(profile?.student_id || ''),
            posterAvatarUrl: profile?.profile_photo ? safeString(profile.profile_photo) : undefined,
            createdAt: safeString(item.created_at),
            updatedAt: item.updated_at ? safeString(item.updated_at) : undefined,
            status: (safeString(item.status) || 'active').toUpperCase() as ItemStatus,
            type: (safeString(item.type) || 'lost').toUpperCase() as ItemType,
            location: safeString(item.location),
            recoveryRecord: item.recovery_record ? {
              receiverName: safeString(item.recovery_record.receiver_name),
              collegeId: safeString(item.recovery_record.college_id),
              date: safeString(item.recovery_record.date)
            } : undefined
          };
        });

        return [...marketItems, ...lfItems].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } catch (e: any) {
      console.warn("Fetch items failed:", e.message);
      return [];
    }
  },

  async fetchCarouselSlides(): Promise<CarouselSlide[]> {
    try {
      const { data, error } = await supabase
        .from('home_carousel')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(6);
      
      if (error) throw new Error(error.message);
      
      const dbSlides = (data || []).map(slide => ({
        id: safeString(slide.id),
        title: safeString(slide.title),
        subtitle: safeString(slide.subtitle),
        footer: safeString(slide.footer),
        image_url: safeString(slide.image_url),
        icon: safeString(slide.icon || '✨'),
        accent: safeString(slide.accent || 'indigo'),
        order_index: Number(slide.order_index || 0)
      })) as CarouselSlide[];

      if (dbSlides.length < 3) {
        const defaults: CarouselSlide[] = [
          {
            id: 'default-1',
            title: 'NITR Hub Welcome',
            subtitle: 'The centralized gateway for all your campus trading needs.',
            footer: 'Official Community',
            image_url: 'https://tlzlgrxlesukzrolrsbz.supabase.co/storage/v1/object/public/hub-assets/nitr_gate_sell.jpg',
            icon: '🏛️',
            accent: 'indigo',
            order_index: 0
          },
          {
            id: 'default-2',
            title: 'Safe Peer Trading',
            subtitle: 'Verified listings for books, electronics, and hostel gear.',
            footer: 'Verified Users Only',
            image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop',
            icon: '✅',
            accent: 'blue',
            order_index: 1
          },
          {
            id: 'default-3',
            title: 'Lost & Found',
            subtitle: 'Recover your belongings or report found items instantly.',
            footer: 'Campus Safety',
            image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop',
            icon: '🔍',
            accent: 'rose',
            order_index: 2
          }
        ];
        const combined = [...dbSlides];
        for (const def of defaults) {
          if (combined.length >= 3) break;
          if (!combined.some(s => s.title === def.title)) {
            combined.push(def);
          }
        }
        return combined;
      }

      return dbSlides;
    } catch (err: any) {
      console.error("Failed to fetch carousel slides:", err.message || "Unknown error");
      return [
        {
          id: 'error-fallback-1',
          title: 'NITR Hub Welcome',
          subtitle: 'Gateway to campus trading.',
          footer: 'Campus Community',
          image_url: 'https://tlzlgrxlesukzrolrsbz.supabase.co/storage/v1/object/public/hub-assets/nitr_gate_sell.jpg',
          icon: '🏛️',
          accent: 'indigo'
        },
        {
          id: 'error-fallback-2',
          title: 'Safe Market',
          subtitle: 'Trading within verified community.',
          footer: 'Verified Only',
          image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop',
          icon: '✅',
          accent: 'blue'
        },
        {
          id: 'error-fallback-3',
          title: 'Lost & Found',
          subtitle: 'Helping you recover lost items.',
          footer: 'Safe Returns',
          image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop',
          icon: '🔍',
          accent: 'rose'
        }
      ];
    }
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
        return (data || []).map(m => {
          const profile = getProfileData(m.profiles);
          return {
            id: safeString(m.id),
            itemId: safeString(m.item_id),
            senderId: safeString(m.sender_id),
            receiverId: safeString(m.receiver_id),
            senderName: safeString(profile?.full_name || 'Unknown'),
            senderRollNumber: safeString(profile?.student_id || ''),
            text: safeString(m.content),
            timestamp: safeString(m.created_at)
          };
        }) as Message[];
      });
    } catch (e: any) {
      console.warn("Fetch messages failed:", e.message);
      return [];
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
          id: safeString(n.id),
          title: safeString(n.title),
          message: safeString(n.message),
          type: (safeString(n.type) || 'MARKETPLACE') as ItemType,
          timestamp: safeString(n.created_at),
          itemId: safeString(n.item_id),
          read: !!n.read
        })) as Notification[];
      });
    } catch (e: any) {
      console.warn("Fetch notifications failed:", e.message);
      return [];
    }
  },

  async addCarouselSlide(slide: Omit<CarouselSlide, 'id'>) {
    const { error } = await supabase.from('home_carousel').insert([{
      title: safeString(slide.title),
      subtitle: safeString(slide.subtitle),
      footer: safeString(slide.footer),
      icon: safeString(slide.icon),
      image_url: safeString(slide.image_url),
      accent: safeString(slide.accent),
      order_index: Number(slide.order_index || 0),
      is_active: true
    }]);
    if (error) throw new Error(error.message);
  },

  async updateCarouselSlide(id: string, slide: Partial<CarouselSlide>) {
    const payload: any = {};
    if (slide.title !== undefined) payload.title = safeString(slide.title);
    if (slide.subtitle !== undefined) payload.subtitle = safeString(slide.subtitle);
    if (slide.footer !== undefined) payload.footer = safeString(slide.footer);
    if (slide.icon !== undefined) payload.icon = safeString(slide.icon);
    if (slide.image_url !== undefined) payload.image_url = safeString(slide.image_url);
    if (slide.accent !== undefined) payload.accent = safeString(slide.accent);
    if (slide.order_index !== undefined) payload.order_index = Number(slide.order_index);

    const { error } = await supabase
      .from('home_carousel')
      .update(payload)
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  },

  async deleteCarouselSlide(id: string) {
    const { error } = await supabase.from('home_carousel').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async addItem(item: MarketplaceItem) {
    const table = item.type === ItemType.MARKETPLACE ? 'market_listings' : 'lost_and_found';
    const payload = item.type === ItemType.MARKETPLACE ? {
      id: safeString(item.id),
      user_id: safeString(item.posterId),
      title: safeString(item.title),
      description: safeString(item.description),
      price: Number(item.price),
      category: safeString(item.category),
      image_url: safeString(item.imageUrl),
      status: safeString(item.status).toLowerCase()
    } : {
      id: safeString(item.id),
      user_id: safeString(item.posterId),
      title: safeString(item.title),
      description: safeString(item.description),
      type: safeString(item.type).toLowerCase(),
      location: safeString(item.location),
      category: safeString(item.category),
      image_url: safeString(item.imageUrl),
      status: safeString(item.status).toLowerCase()
    };

    const { error } = await supabase.from(table).insert([payload]);
    if (error) throw new Error(error.message);
    await this.broadcastNewItemNotification(item);
  },

  async broadcastNewItemNotification(item: MarketplaceItem) {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', item.posterId);

      if (profileError || !profiles) return;

      const title = item.type === ItemType.MARKETPLACE 
        ? `New for Sale: ${safeString(item.title)}` 
        : `New ${item.type === ItemType.LOST ? 'Lost' : 'Found'} Report`;
        
      const message = `${safeString(item.posterName)} posted a new ${item.type.toLowerCase()} item: ${safeString(item.title)}. Check it out now!`;

      const notificationInserts = profiles.map(profile => ({
        user_id: profile.id,
        title: title,
        message: message,
        type: item.type,
        item_id: item.id,
        read: false
      }));

      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(notificationInserts);

      if (notifyError) console.warn("Broadcast notification failed:", notifyError.message);
    } catch (err: any) {
      console.error("Broadcast failed:", err.message);
    }
  },

  async updateItemDetails(itemId: string, type: ItemType, updates: Partial<MarketplaceItem>) {
    const table = type === ItemType.MARKETPLACE ? 'market_listings' : 'lost_and_found';
    // Removed updated_at as it might not exist in schema cache
    const payload: any = {
      title: safeString(updates.title),
      description: safeString(updates.description)
    };

    if (type === ItemType.MARKETPLACE) {
      payload.price = Number(updates.price || 0);
    } else {
      payload.location = safeString(updates.location);
    }

    const { error } = await supabase.from(table).update(payload).eq('id', itemId);
    if (error) throw new Error(error.message);
  },

  async updateItemStatus(itemId: string, type: ItemType, status: ItemStatus, recoveryRecord?: any) {
    const table = type === ItemType.MARKETPLACE ? 'market_listings' : 'lost_and_found';
    // Removed updated_at as it might not exist in schema cache
    const updateData: any = { 
      status: status.toLowerCase()
    };

    if (recoveryRecord) {
      updateData.recovery_record = {
        receiver_name: safeString(recoveryRecord.receiverName),
        college_id: safeString(recoveryRecord.collegeId),
        date: safeString(recoveryRecord.date)
      };
    }
    const { error } = await supabase.from(table).update(updateData).eq('id', itemId);
    if (error) throw new Error(error.message);
  },

  async sendMessage(senderId: string, receiverId: string, itemId: string | null, text: string) {
    const { error } = await supabase.from('messages').insert([{
      sender_id: senderId,
      receiver_id: receiverId,
      item_id: itemId,
      content: safeString(text)
    }]);
    if (error) throw new Error(error.message);
  },

  async markNotificationRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  },

  async clearNotifications(userId: string) {
    await supabase.from('notifications').delete().eq('user_id', userId);
  },

  async createOrder(order: Order) {
    const { error } = await supabase.from('orders').insert([{
      full_name: safeString(order.full_name),
      roll_number: safeString(order.roll_number),
      price: Number(order.price || 0),
      location: safeString(order.location),
      description: safeString(order.description),
      title: safeString(order.title),
      gmail: safeString(order.gmail),
      event_date: safeString(order.event_date),
      message: safeString(order.message)
    }]);
    if (error) throw new Error(error.message);
  },

  async submitReport(report: Report) {
    const { error: insertError } = await supabase.from('reports').insert([{
      item_id: safeString(report.item_id),
      reporter_id: safeString(report.reporter_id),
      reporter_name: safeString(report.reporter_name),
      reporter_roll: safeString(report.reporter_roll),
      reason: safeString(report.reason),
      item_title: safeString(report.item_title)
    }]);

    if (insertError) throw new Error(insertError.message);

    const { count, error: countError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', report.item_id);

    if (!countError && count !== null && count >= 5) {
      await this.updateItemStatus(report.item_id, report.item_type, ItemStatus.DELETED);
    }
  },

  async upsertProfile(user: User) {
    const { error } = await supabase.from('profiles').upsert({
      id: safeString(user.id),
      full_name: safeString(user.name),
      gmail: safeString(user.email),
      student_id: safeString(user.collegeId),
      profile_photo: safeString(user.avatarUrl)
    }, { onConflict: 'id' });
    if (error) throw new Error(error.message);
  }
};
