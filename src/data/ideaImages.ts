import { supabase } from '../lib/supabase'

// Inspiration photos live in the private `wedding-ideas` Storage bucket;
// access goes through short-lived signed URLs, cached until shortly before
// they expire (an installed PWA can stay open far longer than one URL lives).

const BUCKET = 'wedding-ideas'
const URL_TTL_SECONDS = 3600
// Re-sign this long before expiry so a URL handed to <img> is never stale on arrival.
const REFRESH_MARGIN_MS = 5 * 60 * 1000

const urlCache = new Map<string, { url: string; expiresAt: number }>()

// Phone photos are 5–10 MB; boards don't need more than this on the long edge.
const MAX_EDGE_PX = 2000
const JPEG_QUALITY = 0.85

/**
 * Downscale + re-encode a photo to JPEG before upload. Falls back to the
 * original file whenever the browser can't decode it or the result isn't
 * actually smaller (e.g. a small PNG screenshot or GIF).
 */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}

export async function uploadIdeaImage(file: File): Promise<string> {
  const body = await compressImage(file)
  const ext = body.type === 'image/jpeg' ? 'jpg' : file.name.split('.').pop() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType: body.type || file.type })
  if (error) throw error
  return path
}

export async function ideaImageUrl(path: string): Promise<string> {
  const cached = urlCache.get(path)
  if (cached && cached.expiresAt - REFRESH_MARGIN_MS > Date.now()) return cached.url
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, URL_TTL_SECONDS)
  if (error) throw error
  urlCache.set(path, { url: data.signedUrl, expiresAt: Date.now() + URL_TTL_SECONDS * 1000 })
  return data.signedUrl
}

/** Drop a cached URL (e.g. after an <img> failed to load it) so the next call re-signs. */
export function forgetIdeaImageUrl(path: string): void {
  urlCache.delete(path)
}

export async function deleteIdeaImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
  urlCache.delete(path)
}
