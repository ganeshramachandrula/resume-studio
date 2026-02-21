/**
 * Password validation utilities
 */

export const MIN_PASSWORD_LENGTH = 12
export const PASSWORD_EXPIRY_DAYS = 90

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate password meets complexity requirements:
 * - At least 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit')
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Check if a password_changed_at timestamp is expired (older than PASSWORD_EXPIRY_DAYS)
 */
export function isPasswordExpired(passwordChangedAt: string | null): boolean {
  if (!passwordChangedAt) return true
  const changedDate = new Date(passwordChangedAt)
  const expiryDate = new Date(changedDate.getTime() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  return new Date() > expiryDate
}
