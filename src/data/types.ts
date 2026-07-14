// One interface per table, snake_case fields mirroring supabase/schema.sql 1:1
// (no mapping layer — Tandem pattern).

export type Assignee = 'a' | 'b' | 'both'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'skipped'
export type VendorType =
  | 'venue'
  | 'photographer'
  | 'videographer'
  | 'celebrant'
  | 'caterer'
  | 'florist'
  | 'band_dj'
  | 'cake'
  | 'hair_makeup'
  | 'transport'
  | 'stationery'
  | 'other'
export type VendorStatus = 'idea' | 'contacted' | 'quoted' | 'visited' | 'booked' | 'rejected'
export type InviteStatus = 'to_invite' | 'invited' | 'rsvp_yes' | 'rsvp_no'
export type BudgetCategory =
  | 'venue'
  | 'catering_drinks'
  | 'attire_beauty'
  | 'photography_video'
  | 'flowers_styling'
  | 'music_entertainment'
  | 'rings'
  | 'stationery'
  | 'transport'
  | 'celebrant_ceremony'
  | 'honeymoon'
  | 'other'
export type IdeaArea =
  | 'dress'
  | 'suits'
  | 'theme_colours'
  | 'flowers'
  | 'hair'
  | 'cake'
  | 'decor'
  | 'music'
  | 'other'

export interface Profile {
  id: string
  display_name: string
}

export interface WeddingSettings {
  id: 1
  wedding_date: string | null
  total_budget: number | null
  venue_vendor_id: string | null
  partner_a: string
  partner_b: string
}

export interface WeddingTask {
  id: string
  title: string
  notes: string
  months_out: number | null
  due_date: string | null
  due_override: boolean
  assignee: Assignee
  status: TaskStatus
  from_template: boolean
  sort_order: number
  created_at: string
}

export interface BudgetItem {
  id: string
  category: BudgetCategory
  name: string
  estimated: number | null
  quoted: number | null
  actual: number | null
  vendor_id: string | null
}

export interface Payment {
  id: string
  budget_item_id: string
  label: string
  amount: number
  due_date: string | null
  paid: boolean
  paid_at: string | null
}

export interface Vendor {
  id: string
  type: VendorType
  name: string
  status: VendorStatus
  contact_name: string
  phone: string
  email: string
  website: string
  quote_amount: number | null
  available_on_date: 'yes' | 'no' | 'unknown'
  capacity: number | null
  rating: number | null
  location: string
  pros: string
  cons: string
  links: string[]
  notes: string
  created_at: string
}

export interface Guest {
  id: string
  household: string
  name: string
  side: Assignee
  grp: 'family' | 'friends' | 'work' | 'other'
  invite_status: InviteStatus
  meal_choice: string
  dietary: string
  is_plus_one: boolean
  is_child: boolean
  address: string
  thank_you_sent: boolean
  table_id: string | null
}

export interface SeatTable {
  id: string
  name: string
  capacity: number
  sort_order: number
}

export interface Idea {
  id: string
  area: IdeaArea
  title: string
  url: string
  image_path: string
  notes: string
  created_by: string | null
  created_at: string
}

export interface KeyDate {
  id: string
  title: string
  date: string
  time: string
  location: string
  related_vendor_id: string | null
  notes: string
}

export interface DayEvent {
  id: string
  time: string
  title: string
  who: string
  vendor_id: string | null
  notes: string
  sort_order: number
}
