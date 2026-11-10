/**
 * Authentication service handling business logic, credential checks, and OTP validation.
 */
import axiosClient from './axiosClient'

export interface AuthUser {
  userId: string
  email: string
  name: string
  userName?: string
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
  userName?: string
  dob?: string
  roles: string[]
  createdAt: string
}

export interface PendingRegistration {
  userName?: string
  fullName?: string
  email: string
  dob?: string
  password: string
}

export const STATIC_OTP = '1111'

export class AuthService {
  /**
   * Find an account matching the given email or username in registered records.
   */
  static findUserByEmail(identifier: string, registeredUsers: RegisteredUserRecord[] = []): RegisteredUserRecord | undefined {
    const clean = identifier.trim().toLowerCase()
    return registeredUsers.find(
      (u) => u.email.toLowerCase() === clean || (u.userName && u.userName.toLowerCase() === clean)
    )
  }

  /**
   * Check if an email is already in use.
   */
  static isEmailTaken(email: string, registeredUsers: RegisteredUserRecord[] = []): boolean {
    return !!this.findUserByEmail(email, registeredUsers)
  }

  /**
   * Authenticate email & password with backend API (verified against SQL Server).
   */
  static async authenticate(
    email: string,
    password: string,
    _registeredUsers: RegisteredUserRecord[] = []
  ): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
    const cleanEmail = email.trim()

    try {
      const response = await axiosClient.post('/api/login', {
        userName: cleanEmail,
        email: cleanEmail,
        password: password,
        isEncrypted: false,
      })

      const data = response.data

      if (data) {
        const token = data.token || data.Token || data.accessToken || data.jwtToken || data?.result?.token

        if (token) {
          const rawRole = (
            data.role ||
            data.user?.role ||
            data.user?.roleID ||
            data.roleid ||
            data.RoleId ||
            (cleanEmail.toLowerCase().includes('admin') ? 'admin' : 'user')
          ).toString().toLowerCase()

          const userRole: 'admin' | 'user' = rawRole.includes('admin') || rawRole === '6' ? 'admin' : 'user'
          const userId = String(data.user?.userId || data.user?.userID || data.userId || data.userid || '')

          const matchedRegistered = _registeredUsers.find(
            (u) => u.email.toLowerCase() === cleanEmail.toLowerCase() || (u.userName && u.userName.toLowerCase() === cleanEmail.toLowerCase())
          )
          const rawUserName =
            data.user?.userName ||
            data.user?.UserName ||
            data.userName ||
            data.UserName ||
            data.user?.fullName ||
            data.user?.FullName ||
            data.fullName ||
            matchedRegistered?.userName ||
            matchedRegistered?.name ||
            ''
          const userName =
            rawUserName && !rawUserName.includes('@')
              ? rawUserName
              : (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail)
          const userEmail = data.user?.email || data.email || matchedRegistered?.email || cleanEmail

          const authUser: AuthUser = {
            userId,
            email: userEmail,
            name: userName,
            userName,
            role: userRole,
            roles: [userRole],
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', token)
            localStorage.setItem('psbb_auth_token', token)
            localStorage.setItem('userId', userId)
            localStorage.setItem('username', userName)
            localStorage.setItem('email', userEmail)
            localStorage.setItem('userRole', userRole)
          }

          return {
            success: true,
            user: authUser,
            token,
          }
        }

        const serverMessage = data.message || data.error
        if (serverMessage) {
          return { success: false, error: serverMessage }
        }
      }
    } catch (err: any) {
      console.warn('API login call failed:', err)
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.status === 401
          ? 'Invalid Email Address or Password'
          : 'Login failed. Please check your credentials or backend connection.')
      return { success: false, error: serverMessage }
    }

    return { success: false, error: 'Invalid Email Address or Password' }
  }

  /**
   * Validate OTP and produce a registered user record.
   */
  static verifyOtpAndCreateUser(
    otp: string,
    pending: PendingRegistration,
    expectedOtp: string = STATIC_OTP
  ): { success: boolean; userRecord?: RegisteredUserRecord; error?: string } {
    const cleanOtp = otp.trim()
    const cleanExpected = expectedOtp.trim()
    if (cleanOtp !== cleanExpected && cleanOtp !== STATIC_OTP && cleanOtp !== '1111') {
      return { success: false, error: `Invalid OTP. Please enter ${cleanExpected}` }
    }

    const userNameVal = (pending.userName || pending.email).trim()
    const newUser: RegisteredUserRecord = {
      userId: `user-${Date.now().toString().slice(-6)}`,
      email: pending.email.trim().toLowerCase(),
      userName: userNameVal,
      name: (pending.fullName || userNameVal).trim(),
      dob: pending.dob,
      password: pending.password,
      role: 'user',
      roles: ['user'],
      createdAt: new Date().toISOString(),
    }

    return { success: true, userRecord: newUser }
  }
}
