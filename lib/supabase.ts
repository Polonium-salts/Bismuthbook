import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Storage bucket name
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'community-images'

// Helper function to get public URL for uploaded images
export const getImageUrl = (path: string) => {
  if (!path || path.trim() === '') {
    return ''
  }
  
  // If the path is already a full URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// Helper function to upload image
export const uploadImage = async (file: File, path?: string) => {
  const fileName = path || `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error
  return data.path
}

// Helper function to extract storage path from URL or path
export const extractStoragePath = (urlOrPath: string): string => {
  if (!urlOrPath || urlOrPath.trim() === '') {
    throw new Error('Invalid path or URL')
  }

  // If it's already just a path (no http/https), return it
  if (!urlOrPath.startsWith('http://') && !urlOrPath.startsWith('https://')) {
    return urlOrPath
  }

  try {
    const url = new URL(urlOrPath)
    // Extract path after /storage/v1/object/public/{bucket}/
    const pathParts = url.pathname.split('/')
    const publicIndex = pathParts.indexOf('public')
    
    if (publicIndex !== -1 && publicIndex < pathParts.length - 2) {
      // Skip 'public' and bucket name, get the rest
      return pathParts.slice(publicIndex + 2).join('/')
    }
    
    // Fallback: try to get everything after the last known segment
    const storageIndex = pathParts.indexOf('storage')
    if (storageIndex !== -1) {
      return pathParts.slice(storageIndex + 4).join('/') // Skip storage/v1/object/public
    }
    
    throw new Error('Could not extract storage path from URL')
  } catch (error) {
    console.error('Error extracting storage path:', error)
    throw new Error(`Invalid storage URL: ${urlOrPath}`)
  }
}

// Helper function to delete image
export const deleteImage = async (pathOrUrl: string) => {
  try {
    // Extract the actual storage path
    const storagePath = extractStoragePath(pathOrUrl)
    
    console.log('Deleting from storage bucket:', STORAGE_BUCKET, 'path:', storagePath)
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath])

    if (error) {
      console.error('Storage deletion error:', error)
      throw error
    }
    
    console.log('Successfully deleted from storage:', storagePath)
  } catch (error) {
    console.error('Error in deleteImage:', error)
    throw error
  }
}