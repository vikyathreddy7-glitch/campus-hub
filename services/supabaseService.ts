
import { createClient } from '@supabase/supabase-js';
import { MarketplaceItem, Message, ItemStatus } from '../types';

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
      
      if (error) {
        console.error('Supabase Error (fetchItems):', error.message, error.details);
        return null;
      }
      return data as MarketplaceItem[];
    } catch (e: any) {
      console.error('Network Error (fetchItems):', e.message);
      return null;
    }
  },

  async addItem(item: MarketplaceItem) {
    const { error } = await supabase
      .from('listings')
      .insert([item]);
    
    if (error) {
      console.error('Supabase Error (addItem):', error.message, error.details);
      throw error;
    }
  },

  async updateItemStatus(itemId: string, status: ItemStatus, recoveryRecord?: any) {
    const updateData: any = { status };
    if (recoveryRecord) {
      updateData.recoveryRecord = recoveryRecord;
    }

    const { error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', itemId);
    
    if (error) {
      console.error('Supabase Error (updateItemStatus):', error.message, error.details);
      throw error;
    }
  },

  async fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true });
      
      if (error) {
        console.error('Supabase Error (fetchMessages):', error.message, error.details);
        return null;
      }
      return data as Message[];
    } catch (e: any) {
      console.error('Network Error (fetchMessages):', e.message);
      return null;
    }
  },

  async sendMessage(message: Message) {
    const { error } = await supabase
      .from('messages')
      .insert([message]);
    
    if (error) {
      console.error('Supabase Error (sendMessage):', error.message, error.details);
      throw error;
    }
  }
};
