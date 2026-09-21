import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  AuthService,
  type AuthUser,
  type PendingRegistration,
  type RegisteredUserRecord,
} from '@/services/auth.service'

import { cleanLegacyStorage } from '@/utils/storageCleanup'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  pendingRegistration: PendingRegistration | null
  registeredUsers: RegisteredUserRecord[]

  // Authentication Actions
  login: (email: string, password: string) => { success: boolean; user?: AuthUser; error?: string }
  logout: () => void
  updateUser: (changes: Partial<AuthUser>) => void

  // Registration & OTP Actions
  startRegistration: (pending: PendingRegistration) => void
  verifyRegistrationOtp: (otp: string) => { success: boolean; error?: string }
  clearPendingRegistration: () => void
  isEmailRegistered: (email: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      pendingRegistration: null,
      registeredUsers: [],

      login: (email: string, password: string) => {
        const { registeredUsers } = get()
        const result = AuthService.authenticate(email, password, registeredUsers)

        if (result.success && result.user) {
          set({
            user: result.user,
            isAuthenticated: true,
          })
          return { success: true, user: result.user }
        }

        return { success: false, error: result.error || 'Invalid credentials' }
      },

      logout: () => {
        cleanLegacyStorage()
        set({
          user: null,
          isAuthenticated: false,
          pendingRegistration: null,
        })
      },

      updateUser: (changes: Partial<AuthUser>) => {
        const currentUser = get().user
        if (!currentUser) return
        set({
          user: { ...currentUser, ...changes },
        })
      },

      startRegistration: (pending: PendingRegistration) => {
        set({ pendingRegistration: pending })
      },

      verifyRegistrationOtp: (otp: string) => {
        const { pendingRegistration, registeredUsers } = get()

        if (!pendingRegistration) {
          return { success: false, error: 'No registration in progress. Please register again.' }
        }

        const result = AuthService.verifyOtpAndCreateUser(otp, pendingRegistration)

        if (!result.success || !result.userRecord) {
          return { success: false, error: result.error || 'Invalid OTP' }
        }

        // Add to registered users list and clear pending
        set({
          registeredUsers: [...registeredUsers, result.userRecord],
          pendingRegistration: null,
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
      // Store only essential authentication data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        registeredUsers: state.registeredUsers,
        pendingRegistration: state.pendingRegistration,
      }),
    }
  )
)
