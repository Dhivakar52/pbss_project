import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  AuthService,
  type AuthUser,
  type PendingRegistration,
  type RegisteredUserRecord,
} from '@/services/auth.service'
import { ApiService } from '@/services/api.service'

import { cleanLegacyStorage } from '@/utils/storageCleanup'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  pendingRegistration: PendingRegistration | null
  registeredUsers: RegisteredUserRecord[]

  applicantUserName: string | null
  setApplicantUserName: (userName: string | null | undefined) => void

  // Authentication Actions
  login: (email: string, password: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>
  logout: () => void
  updateUser: (changes: Partial<AuthUser>) => void

  // Registration & OTP Actions
  startRegistration: (pending: PendingRegistration) => void
  verifyRegistrationOtp: (otp: string, expectedOtp?: string) => Promise<{ success: boolean; error?: string }>
  clearPendingRegistration: () => void
  isEmailRegistered: (email: string) => boolean
  updateLocalPassword: (identifier: string, newPassword: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      pendingRegistration: null,
      registeredUsers: [],
      applicantUserName: null,

      setApplicantUserName: (userName: string | null | undefined) => {
        const clean = typeof userName === 'string' ? userName.trim() : ''
        if (!clean) return
        const currentUser = get().user
        set({
          applicantUserName: clean,
          user: currentUser
            ? {
                ...currentUser,
                userName: clean,
                name: clean,
              }
            : null,
        })
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('applicant_username', clean)
            localStorage.setItem('username', clean)
          } catch {}
        }
      },

      login: async (email: string, password: string) => {
        const { registeredUsers } = get()
        const result = await AuthService.authenticate(email, password, registeredUsers)

        if (result.success && result.user) {
          const token = result.token || null
          if (token && typeof window !== 'undefined') {
            localStorage.setItem('authToken', token)
            localStorage.setItem('psbb_auth_token', token)
          }
          set({
            user: result.user,
            token,
            isAuthenticated: true,
          })
          return { success: true, user: result.user }
        }

        return { success: false, error: result.error || 'Invalid credentials' }
      },

      logout: () => {
        cleanLegacyStorage()
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('psbb_logging_out', '1')
          } catch {
            // Ignore storage quota or access errors
          }
          localStorage.removeItem('authToken')
          localStorage.removeItem('psbb_auth_token')
          localStorage.removeItem('userId')
          localStorage.removeItem('username')
          localStorage.removeItem('applicant_username')
          localStorage.removeItem('email')
          localStorage.removeItem('userRole')
          localStorage.removeItem('refreshToken')
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          pendingRegistration: null,
          applicantUserName: null,
        })
      },

      updateUser: (changes: Partial<AuthUser>) => {
        const currentUser = get().user
        if (!currentUser) return
        set({
          user: { ...currentUser, ...changes },
        })
      },

      updateLocalPassword: (identifier: string, newPassword: string) => {
        const clean = identifier.trim().toLowerCase()
        const { registeredUsers } = get()
        set({
          registeredUsers: registeredUsers.map((u) => {
            if (u.email.toLowerCase() === clean || (u.userName && u.userName.toLowerCase() === clean)) {
              return { ...u, password: newPassword }
            }
            return u
          }),
        })
      },

      startRegistration: (pending: PendingRegistration) => {
        set({ pendingRegistration: pending })
      },

      verifyRegistrationOtp: async (otp: string, expectedOtp?: string) => {
        const { pendingRegistration, registeredUsers } = get()

        if (!pendingRegistration) {
          return { success: false, error: 'No registration in progress. Please register again.' }
        }

        const result = AuthService.verifyOtpAndCreateUser(otp, pendingRegistration, expectedOtp)

        if (!result.success || !result.userRecord) {
          return { success: false, error: result.error || 'Invalid OTP' }
        }

        // Call backend API [User].[ProcSaveUsers]
        let apiUserId: string | undefined = undefined
        try {
          const apiRes = await ApiService.registerUser({
            userName: pendingRegistration.userName || '',
            fullName: pendingRegistration.fullName || null,
            email: pendingRegistration.email,
            password: pendingRegistration.password,
            dob: pendingRegistration.dob,
          })

          if (apiRes && !apiRes.success) {
            return {
              success: false,
              error: apiRes.message || 'Account creation failed. Please try again.',
            }
          }
          if (apiRes && apiRes.userId) {
            apiUserId = String(apiRes.userId)
          }
        } catch (apiErr) {
          console.warn('API registerUser call warning:', apiErr)
          return {
            success: false,
            error: 'Unable to create your account right now. Please try again.',
          }
        }

        if (apiUserId) {
          result.userRecord.userId = apiUserId
        }

        set({ pendingRegistration: null })

        // Add to registered users list
        set({
          registeredUsers: [
            ...registeredUsers.filter((u) => u.email !== result.userRecord!.email),
            result.userRecord,
          ],
        })

        return { success: true }
      },

      clearPendingRegistration: () => {
        set({ pendingRegistration: null })
      },

      isEmailRegistered: (email: string) => {
        const { registeredUsers } = get()
        return AuthService.isEmailTaken(email, registeredUsers)
      },
    }),
    {
      name: 'pbss_auth_session',
      storage: createJSONStorage(() => localStorage),
      // Store essential authentication data including JWT token
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        registeredUsers: state.registeredUsers,
        pendingRegistration: state.pendingRegistration,
        applicantUserName: state.applicantUserName,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.applicantUserName) {
          const clean = state.applicantUserName.trim()
          if (clean && !clean.includes('@')) {
            state.applicantUserName = clean
            if (state.user) {
              state.user.userName = clean
              state.user.name = clean
            }
          }
        }
        if (state?.user) {
          const email = state.user.email?.toLowerCase() || ''
          const role = (state.user.role || '').toLowerCase()
          if (email.includes('admin') || role.includes('admin')) {
            state.user.role = 'admin'
            state.user.roles = ['admin']
          }

          if (!state.user.userName || state.user.userName.includes('@')) {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('username') : ''
            const match = state.registeredUsers?.find(
              (u) => (state.user?.email && u.email.toLowerCase() === state.user.email.toLowerCase()) ||
                     (state.user?.userId && u.userId === state.user.userId)
            )
            const fallbackName =
              (stored && !stored.includes('@') ? stored : '') ||
              match?.userName ||
              match?.name ||
              (state.user.name && !state.user.name.includes('@') ? state.user.name : '') ||
              (email.includes('@') ? email.split('@')[0] : email)
            state.user.userName = fallbackName
            if (!state.user.name || state.user.name.includes('@')) {
              state.user.name = fallbackName
            }
          }
        }
      },
    }
  )
)

// Automatically sync applicant UserName from FetchApplicant API responses
ApiService.onApplicantLoaded((userName) => {
  useAuthStore.getState().setApplicantUserName(userName)
})
