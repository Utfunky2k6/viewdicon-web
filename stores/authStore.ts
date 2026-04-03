'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, HeritagCircle } from '@/types'

// Map backend heritageCircle to frontend HeritagCircle type
function mapHeritageCircle(backend: string): HeritagCircle {
  const map: Record<string, HeritagCircle> = {
    continental: 'WEST_AFRICA',
    diaspora: 'DIASPORA',
    ally: 'ALLY',
  }
  return map[backend] || 'WEST_AFRICA'
}

// Parse raw afroId string from backend into structured AfroID object
function parseAfroId(raw: string): UserProfile['afroId'] | undefined {
  if (!raw) return undefined
  const parts = raw.split('-')
  // New format: AFR-NGA-HLT-000239
  if (parts.length === 4 && parts[0] === 'AFR') {
    return { raw, country: parts[1], tribe: parts[2], numeric: parts[3], masked: `${parts[0]}-${parts[1]}-${parts[2]}-••••••` }
  }
  // Old format: AKN-NG-G1-2026-A2Q4
  if (parts.length >= 5) {
    return { raw, country: parts[1], tribe: parts[0], numeric: `${parts[3]}-${parts[4]}`, masked: `${parts[0]}-${parts[1]}-${parts[2]}-••••-••••` }
  }
  return { raw, country: '', tribe: '', numeric: '', masked: '••••-••••-••••' }
}

// ── Default empty profile — used when backend returns partial data ──
function buildUserProfile(backendUser: Record<string, unknown>): UserProfile {
  // Prefer fullName as displayName if displayName is empty
  const resolvedDisplayName =
    (backendUser.displayName as string) ||
    (backendUser.fullName as string) ||
    ''

  const afroIdRaw = (backendUser.afroId as string) || ''
  const parsedAfroId = parseAfroId(afroIdRaw)

  return {
    id: (backendUser.id as string) || '',
    handle: (backendUser.handle as string) || '',
    displayName: resolvedDisplayName,
    firstName: (backendUser.firstName as string) || undefined,
    lastName: (backendUser.lastName as string) || undefined,
    fullName: (backendUser.fullName as string) || undefined,
    dateOfBirth: (backendUser.dateOfBirth as string) || undefined,
    gender: (backendUser.gender as string) || undefined,
    username: (backendUser.handle as string)?.replace('@', '') || '',
    bio: (backendUser.bio as string) || '',
    heritageCircle: mapHeritageCircle((backendUser.heritageCircle as string) || 'continental'),
    heritage: (backendUser.heritage as string) || undefined,
    tribe: (backendUser.tribe as string) || undefined,
    // ── Naming Ceremony fields ──
    ancestralNation: (backendUser.ancestralNation as string) || undefined,
    ethnicGroup: (backendUser.ethnicGroup as string) || undefined,
    clanLineage: (backendUser.clanLineage as string) || undefined,
    birthSeason: (backendUser.birthSeason as string) || undefined,
    motherName: (backendUser.motherName as string) || undefined,
    fatherName: (backendUser.fatherName as string) || undefined,
    totemAnimal: (backendUser.totemAnimal as string) || undefined,
    originState: (backendUser.originState as string) || undefined,
    originVillage: (backendUser.originVillage as string) || undefined,
    residenceCountry: (backendUser.residenceCountry as string) || undefined,
    residenceCity: (backendUser.residenceCity as string) || undefined,
    occupation: (backendUser.occupation as string) || undefined,
    ubuntuRank: (backendUser.ubuntuRank as string) || 'SEED',
    ubuntuScore: (backendUser.ubuntuScore as number) || 0,
    nkisiState: 'GREEN',
    activeSkin: 'WORK',
    verificationLevel: 'PHONE_VERIFIED',
    isVerified: true,
    ringCounts: { ring1: 0, ring2: 0, ring3: 0, ring4: 0 },
    connectionCount: 0,
    villageCount: 0,
    joinedAt: (backendUser.createdAt as string) || new Date().toISOString(),
    afroId: parsedAfroId,
    afroIdentity: parsedAfroId
      ? {
          afroId: parsedAfroId,
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
    villageId: (backendUser.villageId as string) || undefined,
    roleKey: (backendUser.roleKey as string) || undefined,
  } as UserProfile
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  ceremonyComplete: boolean
  isNewCitizen: boolean
  biometricEnrolled: boolean
  credentialId: string | null

  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: UserProfile | Record<string, unknown>) => void
  setCeremonyComplete: (v: boolean) => void
  completeCeremony: () => void
  setNewCitizen: (v: boolean) => void
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
      isNewCitizen: false,
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

      completeCeremony: () => {
        set({ ceremonyComplete: true, isNewCitizen: true })
        if (typeof document !== 'undefined') {
          document.cookie = `afk_ceremony_done=true; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
        }
      },

      setNewCitizen: (isNewCitizen) => set({ isNewCitizen }),

      setBiometricEnrolled: (enrolled, credentialId) =>
        set({ biometricEnrolled: enrolled, credentialId: credentialId ?? null }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          ceremonyComplete: false,
          isNewCitizen: false,
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
        isNewCitizen: s.isNewCitizen,
        biometricEnrolled: s.biometricEnrolled,
        credentialId: s.credentialId,
      }),
    }
  )
)

export { buildUserProfile }
