import axiosClient from '@/services/axiosClient'

export interface AppConfig {
  API_URL: string
  [key: string]: any
}

export const apiClient = axiosClient

export function getCachedAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken') || localStorage.getItem('psbb_auth_token') || null
}

export function setCachedAuthToken(token: string | null): void {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('authToken', token)
      localStorage.setItem('psbb_auth_token', token)
    } else {
      localStorage.removeItem('authToken')
      localStorage.removeItem('psbb_auth_token')
    }
  }
}

export function clearCachedAuthToken(): void {
  setCachedAuthToken(null)
}

export function getApiUrl(): string {
  const url = import.meta.env.VITE_API_URL || ''
  return url.replace(/\/+$/, '')
}

export async function initializeApiConfig(): Promise<AppConfig> {
  return {
    API_URL: getApiUrl(),
  }
}
