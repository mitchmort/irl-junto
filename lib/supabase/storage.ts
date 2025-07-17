import { createClient } from './client'

const supabase = createClient()

/**
 * Upload a file to Supabase Storage
 * @param bucket - The storage bucket name
 * @param file - The file to upload
 * @param path - The path where the file should be stored
 * @returns Promise with the uploaded file's public URL or error
 */
export async function uploadFile(
  bucket: string,
  file: File,
  path: string
): Promise<{ data: { publicUrl: string } | null; error: Error | null }> {
  try {
    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { data: null, error: uploadError }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return { 
      data: { publicUrl: urlData.publicUrl }, 
      error: null 
    }
  } catch (error) {
    console.error('Storage operation failed:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Upload a profile avatar image
 * @param userId - The user's ID
 * @param file - The image file to upload
 * @returns Promise with the uploaded file's public URL or error
 */
export async function uploadProfileAvatar(
  userId: string,
  file: File
): Promise<{ data: { publicUrl: string } | null; error: Error | null }> {
  // Validate file type
  if (!isValidImageFile(file)) {
    return {
      data: null,
      error: new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.')
    }
  }

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return {
      data: null,
      error: new Error('File size too large. Please upload an image smaller than 5MB.')
    }
  }

  // Create a simple file path (works with default policies)
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = fileName // Simple path at bucket root

  return uploadFile('profiles', file, filePath)
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The path of the file to delete
 */
export async function deleteFile(bucket: string, path: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    return { error }
  } catch (error) {
    console.error('Delete operation failed:', error)
    return { error: error as Error }
  }
}

/**
 * Validate if the uploaded file is a supported image type
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ]
  
  return validTypes.includes(file.type)
} 