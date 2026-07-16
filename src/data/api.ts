import { supabase } from '../lib/supabase'
import type {
  BudgetItem,
  DayEvent,
  EngagementItem,
  Gift,
  Guest,
  HoneymoonItem,
  Idea,
  KeyDate,
  PackingItem,
  PartyMember,
  Payment,
  Profile,
  SeatTable,
  Song,
  Vendor,
  WeddingSettings,
  WeddingTask,
} from './types'

async function list<T>(table: string, orderBy: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*').order(orderBy)
  if (error) throw error
  return (data ?? []) as T[]
}

export async function insertRow<T>(table: string, row: Partial<T>): Promise<T> {
  // The untyped client rejects Partial<T> under supabase-js's strict insert
  // typing; the runtime shape is exactly the row object.
  const { data, error } = await supabase
    .from(table)
    .insert(row as Record<string, unknown>)
    .select()
    .single()
  if (error) throw error
  return data as T
}

export async function updateRow<T>(table: string, id: string | number, patch: Partial<T>): Promise<void> {
  const { error } = await supabase
    .from(table)
    .update(patch as Record<string, unknown>)
    .eq('id', id)
  if (error) throw error
}

export async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

export interface AllData {
  settings: WeddingSettings
  tasks: WeddingTask[]
  budgetItems: BudgetItem[]
  payments: Payment[]
  vendors: Vendor[]
  guests: Guest[]
  tables: SeatTable[]
  ideas: Idea[]
  keyDates: KeyDate[]
  dayEvents: DayEvent[]
  profiles: Profile[]
  gifts: Gift[]
  partyMembers: PartyMember[]
  songs: Song[]
  honeymoonItems: HoneymoonItem[]
  packingItems: PackingItem[]
  engagementItems: EngagementItem[]
}

async function fetchSettings(): Promise<WeddingSettings> {
  const { data, error } = await supabase.from('wedding_settings').select('*').eq('id', 1).single()
  if (error) throw error
  return data as WeddingSettings
}

export async function fetchAll(): Promise<AllData> {
  const [settings, tasks, budgetItems, payments, vendors, guests, tables, ideas, keyDates, dayEvents, profiles, gifts, partyMembers, songs, honeymoonItems, packingItems, engagementItems] =
    await Promise.all([
      fetchSettings(),
      list<WeddingTask>('wedding_tasks', 'sort_order'),
      list<BudgetItem>('wedding_budget_items', 'name'),
      list<Payment>('wedding_payments', 'due_date'),
      list<Vendor>('wedding_vendors', 'name'),
      list<Guest>('wedding_guests', 'name'),
      list<SeatTable>('wedding_tables', 'sort_order'),
      list<Idea>('wedding_ideas', 'created_at'),
      list<KeyDate>('wedding_key_dates', 'date'),
      list<DayEvent>('wedding_day_events', 'sort_order'),
      list<Profile>('profiles', 'display_name'),
      list<Gift>('wedding_gifts', 'received_date'),
      list<PartyMember>('wedding_party_members', 'sort_order'),
      list<Song>('wedding_songs', 'sort_order'),
      list<HoneymoonItem>('wedding_honeymoon_items', 'title'),
      list<PackingItem>('wedding_packing_items', 'sort_order'),
      list<EngagementItem>('wedding_engagement_items', 'title'),
    ])
  return { settings, tasks, budgetItems, payments, vendors, guests, tables, ideas, keyDates, dayEvents, profiles, gifts, partyMembers, songs, honeymoonItems, packingItems, engagementItems }
}
