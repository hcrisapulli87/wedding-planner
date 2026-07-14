import { supabase } from '../lib/supabase'

// Inspiration photos live in the private `wedding-ideas` Storage bucket;
// access goes through short-lived signed URLs, cached for the session.

const BUCKET = 'wedding-ideas'
const urlCache = new Map<string, string>()

export async function uploadIdeaImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw error
  return path
}

export async function ideaImageUrl(path: string): Promise<string> {
  const cached = urlCache.get(path)
  if (cached) return cached
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error) throw error
  urlCache.set(path, data.signedUrl)
  return data.signedUrl
}

export async function deleteIdeaImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
  urlCache.delete(path)
}
