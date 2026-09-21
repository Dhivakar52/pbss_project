/**
 * Authentication service handling business logic, credential checks, and OTP validation.
 */

export interface AuthUser {
  userId: string
  email: string
  name: string
  role: 'admin' | 'user'
  roles: string[]
  avatar?: string
}

export interface RegisteredUserRecord {
  userId: string
  email: string
  name: string
  password: string
  role: 'admin' | 'user'
  roles: string[]
  createdAt: string
}

export interface PendingRegistration {
  fullName: string
  email: string
  password: string
}

// Static default test accounts specified in requirements
export const SEEDED_ACCOUNTS: RegisteredUserRecord[] = [
  {
    userId: 'admin-01',
    email: 'admin@gmail.com',
    name: 'Administrator',
    password: '123',
    role: 'admin',
    roles: ['admin'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    userId: 'user-01',
    email: 'user@gmail.com',
    name: 'Regular User',
    password: '123',
    role: 'user',
    roles: ['user'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
]

export const STATIC_OTP = '1111'

export class AuthService {
  /**
   * Find an account matching the given email in seeded or user-registered records.
   */
  static findUserByEmail(email: string, registeredUsers: RegisteredUserRecord[] = []): RegisteredUserRecord | undefined {
    const cleanEmail = email.trim().toLowerCase()
    return (
      registeredUsers.find(u => u.email.toLowerCase() === cleanEmail) ||
      SEEDED_ACCOUNTS.find(u => u.email.toLowerCase() === cleanEmail)
    )
  }

  /**
   * Check if an email is already in use.
   */
  static isEmailTaken(email: string, registeredUsers: RegisteredUserRecord[] = []): boolean {
    return !!this.findUserByEmail(email, registeredUsers)
  }

  /**
   * Authenticate email & password.
   */
  static authenticate(
    email: string,
    password: string,
    registeredUsers: RegisteredUserRecord[] = []
  ): { success: boolean; user?: AuthUser; error?: string } {
    const account = this.findUserByEmail(email, registeredUsers)

    if (!account) {
      return { success: false, error: 'No account found with this email address' }
    }

    if (account.password !== password) {
      return { success: false, error: 'Incorrect password' }
    }

    const authUser: AuthUser = {
      userId: account.userId,
      email: account.email,
      name: account.name,
      role: account.role,
      roles: account.roles,
    }

    return { success: true, user: authUser }
  }

  /**
   * Validate OTP and produce a registered user record.
   */
  static verifyOtpAndCreateUser(
    otp: string,
    pending: PendingRegistration
  ): { success: boolean; userRecord?: RegisteredUserRecord; error?: string } {
    if (otp.trim() !== STATIC_OTP) {
      return { success: false, error: 'Invalid OTP. Please enter 1111' }
    }

    const newUser: RegisteredUserRecord = {
      userId: `user-${Date.now().toString().slice(-6)}`,
      email: pending.email.trim().toLowerCase(),
      name: pending.fullName.trim(),
      password: pending.password,
      role: 'user',
      roles: ['user'],
      createdAt: new Date().toISOString(),
    }

    return { success: true, userRecord: newUser }
  }
}
