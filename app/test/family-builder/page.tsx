'use client'
import FamilyTreeBuilder from '@/components/onboarding/FamilyTreeBuilder'

export default function TestPage() {
  return <div style={{height: '100vh', width: 375, margin: '0 auto', background: '#000'}}><FamilyTreeBuilder onComplete={() => alert('Done')} /></div>
}
