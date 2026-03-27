'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, HeritagCircle } from '@/types'

// Map backend heritageCircle to frontend HeritagCircle type
function mapHeritageCircle(backend: string): HeritagCircle {
  const map: Record<string, HeritagCircle> = {
    continental: 'WEST_AFRICA',
    diaspora: 'DIASPORA',
    ally: 'DIASPORA',
  }
  return map[backend] || 'WEST_AFRICA'
}

// ── Default empty profile — used when backend returns partial data ──
function buildUserProfile(backendUser: Record<string, unknown>): UserProfile {
  // Prefer fullName as displayName if displayName is empty
  const resolvedDisplayName =
    (backendUser.displayName as string) ||
    (backendUser.fullName as string) ||
    ''

  return {
    id: (backendUser.id as string) || '',
    handle: (backendUser.handle as string) || '',
    displayName: resolvedDisplayName,
    fullName: (backendUser.fullName as string) || undefined,
    dateOfBirth: (backendUser.dateOfBirth as string) || undefined,
    gender: (backendUser.gender as string) || undefined,
    username: (backendUser.handle as string)?.replace('@', '') || '',
    bio: (backendUser.bio as string) || '',
    heritageCircle: mapHeritageCircle((backendUser.heritageCircle as string) || 'continental'),
    heritage: (backendUser.heritage as string) || undefined,
    ubuntuRank: 'SEED',
    ubuntuScore: 0,
    nkisiState: 'GREEN',
    activeSkin: 'WORK',
    verificationLevel: 'PHONE_VERIFIED',
    isVerified: true,
    ringCounts: { ring1: 0, ring2: 0, ring3: 0, ring4: 0 },
    connectionCount: 0,
    villageCount: 0,
    joinedAt: (backendUser.createdAt as string) || new Date().toISOString(),
    afroId: backendUser.afroId
      ? (backendUser.afroId as UserProfile['afroId'])
      : undefined,
    afroIdentity: backendUser.afroId
      ? {
          afroId: backendUser.afroId as UserProfile['afroId'],
          verificationLevel: 'PHONE_VERIFIED',
          palmMarkBound: false,
          recoveryPhraseSet: false,
          createdAt: (backendUser.createdAt as string) || new Date().toISOString(),
        }
      : undefined,
    avatarUrl: (backendUser.avatarUrl as string) || undefined,
    coverUrl: (backendUser.coverUrl as string) || undefined,
    countryCode: (backendUser.countryCode as string) || undefined,
    languageCode: (backendUser.languageCode as string) || 'en',
  } as UserProfile
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  ceremonyComplete: boolean
  biometricEnrolled: boolean
  credentialId: string | null

  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: UserProfile | Record<string, unknown>) => void
  setCeremonyComplete: (v: boolean) => void
  setBiometricEnrolled: (enrolled: boolean, credentialId?: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      ceremonyComplete: false,
      biometricEnrolled: false,
      credentialId: null,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      setUser: (user) => {
        // Accept either a full UserProfile or a partial backend response
        if (user && typeof user === 'object' && 'ubuntuRank' in user) {
          set({ user: user as UserProfile })
        } else {
          set({ user: buildUserProfile(user as Record<string, unknown>) })
        }
      },

      setCeremonyComplete: (ceremonyComplete) => set({ ceremonyComplete }),

      setBiometricEnrolled: (enrolled, credentialId) =>
        set({ biometricEnrolled: enrolled, credentialId: credentialId ?? null }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          ceremonyComplete: false,
          biometricEnrolled: false,
          credentialId: null,
        }),
    }),
    {
      name: 'afk-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        ceremonyComplete: s.ceremonyComplete,
        biometricEnrolled: s.biometricEnrolled,
        credentialId: s.credentialId,
      }),
    }
  )
)

export { buildUserProfile }
