'use client'
import React, { useState, useEffect } from 'react'

type KinshipTier = 1 | 2 | 3
interface FamilyMember {
  id: string
  fullName: string
  kinshipType: string
  localName: string
  kinshipTier: KinshipTier
  phone: string
}

export default function FamilyTreeBuilder({ onComplete }: { onComplete: () => void }) {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    kinshipType: '',
    localName: '',
    tier: 1 as KinshipTier,
    fullName: '',
    phone: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('afk_family_members')
    if (saved) setMembers(JSON.parse(saved))
  }, [])

  const handleAddSubmit = () => {
    const newMember: FamilyMember = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      kinshipTier: formData.tier
    }
    const updated = [...members, newMember]
    setMembers(updated)
    localStorage.setItem('afk_family_members', JSON.stringify(updated))

    setIsAdding(false)
    setStep(1)
    setSelectedCategory(null)
    setFormData({ kinshipType: '', localName: '', tier: 1, fullName: '', phone: '' })
  }

  const tier1Count = members.filter(m => m.kinshipTier === 1).length
  const isComplete = tier1Count >= 3
  const canKeepAdding = isComplete

  return (
    <div className="min-h-full bg-[#050a06] text-[#edf7e8] font-['DM_Sans'] p-6 animate-fade-in relative overflow-x-hidden">
      {/* HEADER SECTION */}
      <div className="mb-8 mt-4">
        <h2 className="font-['Sora'] text-2xl font-black tracking-tight bg-gradient-to-br from-[#4ade80] to-[#16a34a] bg-clip-text text-transparent">
          The Ancestral Circle
        </h2>
        <p className="text-[13px] text-white/40 leading-relaxed mt-2 font-medium">
          Register at least <span className="text-[#fbbf24] font-bold">3 Blood Line</span> members to unlock the Village Seso and your Ancestral Vault.
        </p>
      </div>

      {/* PROGRESS TRACKER */}
      <div className="mb-10 bg-white/5 border border-white/5 rounded-2xl p-4">
        <div className="flex justify-between items-end mb-3">
          <div className="flex flex-col">
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Blood Line Quorum</span>
             <span className={`text-sm font-black ${isComplete ? 'text-[#4ade80]' : 'text-[#fbbf24]'}`}>
                {tier1Count} / 3 Members Found
             </span>
          </div>
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Max 7</span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
           <div
             className={`h-full transition-all duration-700 ease-out rounded-full ${isComplete ? 'bg-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.4)]' : 'bg-[#fbbf24]'}`}
             style={{ width: `${Math.min(100, (tier1Count / 3) * 100)}%` }}
           />
        </div>
        {isComplete && (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-[#4ade80] uppercase tracking-widest animate-pulse">
             ✦ Quorum Established · Security Active
          </div>
        )}
      </div>

      {/* MEMBERS LIST */}
      <div className="space-y-3 mb-8">
        {members.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl opacity-30">
             <span className="text-5xl mb-4">🌳</span>
             <p className="text-xs font-bold uppercase tracking-widest">Your Tree is Unplanted</p>
          </div>
        ) : (
          members.map((m, idx) => (
            <div key={m.id} className="group relative bg-[#0a150c] border border-[#1a7c3e]/20 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#1a7c3e]/10 border border-[#1a7c3e]/30 flex items-center justify-center text-xl shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/10 to-transparent" />
                   {m.kinshipTier === 1 ? '🩸' : '🏠'}
                </div>
                <div className="flex-1">
                   <h3 className="text-sm font-black uppercase tracking-wide truncate">{m.fullName}</h3>
                   <p className="text-[11px] font-bold text-[#4ade80]/60 uppercase tracking-widest leading-none mt-1">
                     {m.kinshipType} · <span className="text-[#fbbf24]">{m.localName}</span>
                   </p>
                </div>
                {m.kinshipTier === 1 && (
                  <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] text-[8px] font-black px-2 py-0.5 rounded-full">
                     BLOOD LINE
                  </div>
                )}
            </div>
          ))
        )}
      </div>

      {/* ACTION BLOCK */}
      <div className="fixed bottom-8 left-0 right-0 px-6">
        {!isComplete ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1a7c3e] to-[#15803d] border border-[#4ade80]/30 shadow-[0_10px_30px_rgba(26,124,62,0.3)] text-white font-['Sora'] text-sm font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            + Add Blood Kinship
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-['Sora'] text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
            >
              + Add More Family Members
            </button>
            <button
              onClick={onComplete}
              className="w-full py-4 rounded-2xl bg-[#f0f7f0] shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-[#050a06] font-['Sora'] text-sm font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Enter Village Compound <span>→</span>
            </button>
          </div>
        )}
      </div>

      {/* ADD MEMBER SHEET */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
           <div className="relative bg-[#0d160e] border-t border-[#1a7c3e]/30 rounded-t-[32px] p-6 pb-12 min-h-[70vh] flex flex-col animate-slide-up">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />

              <header className="mb-6">
                 <h3 className="font-['Sora'] text-lg font-black uppercase tracking-wider text-[#4ade80]">
                    {step === 1 ? 'Identify Kinship' : step === 2 ? 'The Covenant' : 'Permissions'}
                 </h3>
                 <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
                    {step === 1 ? 'Select the relationship tier' : 'Establish the identity seal'}
                 </p>
              </header>

              {step === 1 && (
                <div className="grid grid-cols-2 gap-3 flex-1">
                   {[
                     { id: 'blood', ico: '🩸', lbl: 'Blood Line', sub: 'Parents, Siblings', tier: 1 },
                     { id: 'extended', ico: '🏠', lbl: 'Extended', sub: 'Uncles, Aunts', tier: 2 },
                     { id: 'sworn', ico: '🤝', lbl: 'Sworn', sub: 'Egbé, Chosen', tier: 3 },
                     { id: 'elder', ico: '👴', lbl: 'Elder', sub: 'Mentors, Guides', tier: 2 }
                   ].map(c => (
                     <div
                       key={c.id}
                       onClick={() => { setSelectedCategory(c.id); setFormData({...formData, tier: c.tier as KinshipTier}); setStep(2); }}
                       className="p-4 rounded-2xl bg-white/5 border border-white/5 active:bg-[#1a7c3e]/20 active:border-[#1a7c3e]/40 transition-all flex flex-col gap-2 group"
                     >
                        <span className="text-3xl mb-1">{c.ico}</span>
                        <span className="text-xs font-black uppercase tracking-widest">{c.lbl}</span>
                        <span className="text-[9px] text-white/30 font-bold leading-none">{c.sub}</span>
                     </div>
                   ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                   <div className="flex gap-2">
                      <select
                        value={formData.kinshipType}
                        onChange={e => setFormData({...formData, kinshipType: e.target.value})}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-xs font-bold text-white uppercase"
                      >
                         <option value="">Relation Type</option>
                         <option value="Father">Father (Bàbá)</option>
                         <option value="Mother">Mother (Ìyá)</option>
                         <option value="Brother">Brother (Ẹgbọn)</option>
                         <option value="Sister">Sister (Àbúrò)</option>
                         <option value="Uncle">Uncle</option>
                         <option value="Aunt">Aunt</option>
                      </select>
                      <input
                        placeholder="Local Name (e.g. Baba Nla)"
                        value={formData.localName}
                        onChange={e => setFormData({...formData, localName: e.target.value})}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-xs font-bold text-white uppercase"
                      />
                   </div>
                   <input
                      placeholder="Full Legal Name"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-xs font-bold text-white uppercase"
                   />
                   <input
                      placeholder="Phone Number / Afro-ID"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-xs font-bold text-white uppercase"
                   />

                   <div className="p-4 rounded-2xl bg-[#fbbf24]/5 border border-[#fbbf24]/10 text-[#fbbf24]">
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        ⚠️ Security Covenant
                      </h4>
                      <p className="text-[11px] leading-relaxed font-medium">
                        Adding this person permits them to verify your identity in the event of device loss. They will be alerted via Blood-Call SOS.
                      </p>
                   </div>

                   <button
                     disabled={!formData.fullName || !formData.kinshipType}
                     onClick={handleAddSubmit}
                     className="w-full py-4 rounded-2xl bg-[#4ade80] text-[#050a06] text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-30 transition-all mt-4"
                   >
                     Confirm & Add to Tree
                   </button>
                </div>
              )}

              <button
                onClick={() => setIsAdding(false)}
                className="mt-6 text-[10px] text-white/20 font-black uppercase tracking-widest mx-auto"
              >
                Cancel Registration
              </button>
           </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  )
}
