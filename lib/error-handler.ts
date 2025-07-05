import { toast } from 'sonner'

// Error types
export interface AppError {
  message: string
  code?: string
  details?: any
}

export class DatabaseError extends Error {
  code?: string
  details?: any

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = 'DatabaseError'
    this.code = code
    this.details = details
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class ValidationError extends Error {
  field?: string
  
  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

// Error parsing utilities
export const parseSupabaseError = (error: any): AppError => {
  if (!error) return { message: 'Unknown error occurred' }
  
  // Handle Supabase specific errors
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        return { message: 'Resource not found', code: error.code }
      case 'PGRST301':
        return { message: 'Duplicate resource', code: error.code }
      case '42501':
        return { message: 'Access denied', code: error.code }
      case '23505':
        return { message: 'Resource already exists', code: error.code }
      case '23503':
        return { message: 'Referenced resource not found', code: error.code }
      default:
        return { 
          message: error.message || 'Database error occurred', 
          code: error.code,
          details: error.details 
        }
    }
  }
  
  // Handle auth errors
  if (error.message?.includes('JWT')) {
    return { message: 'Session expired. Please sign in again.', code: 'AUTH_ERROR' }
  }
  
  if (error.message?.includes('Invalid login')) {
    return { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }
  }
  
  if (error.message?.includes('User already registered')) {
    return { message: 'An account with this email already exists', code: 'USER_EXISTS' }
  }
  
  return { message: error.message || 'An unexpected error occurred' }
}

// Error handling functions
export const handleError = (error: any, showToast: boolean = true): AppError => {
  const parsedError = parseSupabaseError(error)
  
  if (showToast) {
    toast.error(parsedError.message)
  }
  
  // Log error for debugging
  console.error('Error occurred:', {
    message: parsedError.message,
    code: parsedError.code,
    details: parsedError.details,
    originalError: error
  })
  
  return parsedError
}

export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  showToast: boolean = true
): Promise<T | null> => {
  try {
    return await asyncFn()
  } catch (error) {
    handleError(error, showToast)
    return null
  }
}

// Success message handler
export const handleSuccess = (message: string, showToast: boolean = true) => {
  if (showToast) {
    toast.success(message)
  }
} 