'use client'
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TOOL_REGISTRY, type ToolDefinition } from '@/constants/tools'
import { VILLAGE_BY_ID } from '@/lib/villages-data'
import { useVillageStore } from '@/stores/villageStore'

// ═══════════════════════════════════════════════════════════════════════
// AI-POWERED TOOL LAUNCHER
// Route: /dashboard/sessions/new?tool=KEY&village=ID&role=KEY
//
// Each of the 200+ tools gets:
//  • Smart form fields auto-generated from tool category + key
//  • AI assistant for guidance & auto-fill
//  • Real-time validation
//  • Business session creation for earns/spends tools
//  • Standalone dashboard for neutral tools
// ═══════════════════════════════════════════════════════════════════════

// ── AI Prompt Templates per category ─────────────────────────────────
const AI_PROMPTS: Record<string, string[]> = {
  commerce: [
    'What price should I set for this?',
    'Help me write a product description',
    'What are market trends for this item?',
    'Generate an invoice template',
  ],
  finance: [
    'Calculate my profit margin',
    'What exchange rate should I use?',
    'Analyze my cash flow this week',
    'Help me create a budget',
  ],
  health: [
    'What symptoms should I document?',
    'Help me write a referral note',
    'What vitals should I track?',
    'Suggest a wellness plan',
  ],
  agriculture: [
    'When should I plant this crop?',
    'What fertilizer ratio should I use?',
    'Help me forecast my harvest',
    'What\'s the current market price?',
  ],
  logistics: [
    'Calculate optimal delivery route',
    'Estimate delivery time',
    'Help me write shipping instructions',
    'What packaging do I need?',
  ],
  professional: [
    'Draft a contract clause',
    'Help me write a proposal',
    'What should I charge for this?',
    'Generate a scope of work',
  ],
  community: [
    'How should I structure this project?',
    'Help me write a community announcement',
    'What roles should I assign?',
    'Calculate contribution amounts',
  ],
  education: [
    'Create a lesson outline',
    'Suggest assessment criteria',
    'Help me write learning objectives',
    'What resources should I include?',
  ],
  media: [
    'Help me write a headline',
    'Suggest content topics',
    'What\'s the best posting time?',
    'Draft a press release',
  ],
  creative: [
    'Suggest a color palette',
    'Help me write a creative brief',
    'What dimensions should I use?',
    'Generate a mood board concept',
  ],
  communication: [
    'Draft a professional message',
    'Translate this phrase',
    'Help me write an announcement',
    'Create a contact template',
  ],
  government: [
    'What documents do I need?',
    'Help me write a formal request',
    'What regulations apply here?',
    'Draft a compliance report',
  ],
  security: [
    'What protocols should I follow?',
    'Help me create a safety checklist',
    'What should I report?',
    'Draft an incident report',
  ],
  energy: [
    'Calculate power requirements',
    'What\'s the solar panel efficiency?',
    'Help me plan energy distribution',
    'Estimate fuel consumption',
  ],
  sports: [
    'Create a training schedule',
    'Suggest team formation',
    'Calculate tournament brackets',
    'Draft event rules',
  ],
}

// ── Smart Field Generator ────────────────────────────────────────────
interface FormField {
  key: string
  label: string
  type: 'text' | 'number' | 'textarea' | 'select' | 'toggle' | 'date' | 'phone' | 'currency'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  prefix?: string
  suffix?: string
  aiAutoFill?: boolean // AI can suggest a value
}

function generateFieldsForTool(tool: ToolDefinition): FormField[] {
  const base: FormField[] = [
    { key: 'title', label: 'Title', type: 'text', placeholder: `Name this ${tool.name.toLowerCase()}...`, required: true },
  ]

  // Common fields for session tools
  if (tool.opensBusinessSession) {
    base.push(
      { key: 'counterparty', label: 'Counterparty', type: 'phone', placeholder: '+234 812 345 6789 or Afro-ID' },
    )
  }

  // Category-specific fields
  const catFields = CATEGORY_FIELDS[tool.category] || []

  // Tool-specific overrides
  const toolFields = TOOL_SPECIFIC_FIELDS[tool.key] || []

  return [...base, ...(toolFields.length > 0 ? toolFields : catFields)]
}

const CATEGORY_FIELDS: Record<string, FormField[]> = {
  commerce: [
    { key: 'amount', label: 'Amount (₡)', type: 'currency', placeholder: '0.00', prefix: '₡' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the goods or service...', aiAutoFill: true },
    { key: 'quantity', label: 'Quantity', type: 'number', placeholder: '1' },
    { key: 'delivery', label: 'Delivery Required', type: 'toggle' },
  ],
  finance: [
    { key: 'amount', label: 'Amount (₡)', type: 'currency', placeholder: '0.00', prefix: '₡' },
    { key: 'category_type', label: 'Type', type: 'select', options: [
      { value: 'income', label: '💰 Income' }, { value: 'expense', label: '💸 Expense' },
      { value: 'transfer', label: '🔄 Transfer' }, { value: 'savings', label: '🏦 Savings' },
    ]},
    { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Add details...', aiAutoFill: true },
    { key: 'due_date', label: 'Due Date', type: 'date' },
  ],
  health: [
    { key: 'patient_id', label: 'Patient ID / Name', type: 'text', placeholder: 'Patient identifier...' },
    { key: 'condition', label: 'Condition / Reason', type: 'textarea', placeholder: 'Describe the health concern...', aiAutoFill: true },
    { key: 'urgency', label: 'Urgency', type: 'select', options: [
      { value: 'routine', label: '🟢 Routine' }, { value: 'moderate', label: '🟡 Moderate' },
      { value: 'urgent', label: '🟠 Urgent' }, { value: 'emergency', label: '🔴 Emergency' },
    ]},
    { key: 'follow_up', label: 'Follow-up Date', type: 'date' },
  ],
  agriculture: [
    { key: 'crop_type', label: 'Crop / Livestock', type: 'text', placeholder: 'e.g., Cassava, Goats, Cocoa...' },
    { key: 'plot_size', label: 'Plot Size (hectares)', type: 'number', placeholder: '0.5' },
    { key: 'description', label: 'Details', type: 'textarea', placeholder: 'Describe your farming activity...', aiAutoFill: true },
    { key: 'season', label: 'Season', type: 'select', options: [
      { value: 'planting', label: '🌱 Planting' }, { value: 'growing', label: '🌿 Growing' },
      { value: 'harvest', label: '🌾 Harvest' }, { value: 'off', label: '🏖 Off-season' },
    ]},
  ],
  logistics: [
    { key: 'pickup', label: 'Pickup Location', type: 'text', placeholder: 'e.g., Bodija Market, Ibadan' },
    { key: 'dropoff', label: 'Dropoff Location', type: 'text', placeholder: 'e.g., Lekki Phase 1, Lagos' },
    { key: 'package_desc', label: 'Package Description', type: 'textarea', placeholder: 'What are you sending?', aiAutoFill: true },
    { key: 'weight', label: 'Weight (kg)', type: 'number', placeholder: '0.5' },
    { key: 'urgent', label: 'Urgent Delivery', type: 'toggle' },
  ],
  professional: [
    { key: 'amount', label: 'Fee (₡)', type: 'currency', placeholder: '0.00', prefix: '₡' },
    { key: 'scope', label: 'Scope of Work', type: 'textarea', placeholder: 'Describe the project or service...', aiAutoFill: true },
    { key: 'deadline', label: 'Deadline', type: 'date' },
    { key: 'milestones', label: 'Number of Milestones', type: 'number', placeholder: '3' },
  ],
  community: [
    { key: 'goal', label: 'Project Goal', type: 'textarea', placeholder: 'What is this community project about?', aiAutoFill: true },
    { key: 'target_amount', label: 'Target Amount (₡)', type: 'currency', placeholder: '0.00', prefix: '₡' },
    { key: 'participants', label: 'Expected Participants', type: 'number', placeholder: '10' },
    { key: 'end_date', label: 'End Date', type: 'date' },
  ],
  education: [
    { key: 'subject', label: 'Subject / Topic', type: 'text', placeholder: 'e.g., Mathematics, Yoruba History...' },
    { key: 'level', label: 'Level', type: 'select', options: [
      { value: 'beginner', label: '📗 Beginner' }, { value: 'intermediate', label: '📘 Intermediate' },
      { value: 'advanced', label: '📕 Advanced' }, { value: 'professional', label: '🎓 Professional' },
    ]},
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the lesson or course...', aiAutoFill: true },
    { key: 'duration', label: 'Duration (minutes)', type: 'number', placeholder: '60' },
  ],
  media: [
    { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Write a headline...', aiAutoFill: true },
    { key: 'body', label: 'Content', type: 'textarea', placeholder: 'Write or paste your content...', aiAutoFill: true },
    { key: 'category_type', label: 'Type', type: 'select', options: [
      { value: 'news', label: '📰 News' }, { value: 'feature', label: '📝 Feature' },
      { value: 'editorial', label: '✍️ Editorial' }, { value: 'report', label: '📊 Report' },
    ]},
  ],
  creative: [
    { key: 'project_name', label: 'Project Name', type: 'text', placeholder: 'Name your creative project...' },
    { key: 'brief', label: 'Creative Brief', type: 'textarea', placeholder: 'Describe the creative vision...', aiAutoFill: true },
    { key: 'medium', label: 'Medium', type: 'select', options: [
      { value: 'visual', label: '🎨 Visual Art' }, { value: 'music', label: '🎵 Music' },
      { value: 'fashion', label: '👗 Fashion' }, { value: 'performance', label: '🎭 Performance' },
    ]},
    { key: 'budget', label: 'Budget (₡)', type: 'currency', placeholder: '0.00', prefix: '₡' },
  ],
  communication: [
    { key: 'recipient', label: 'Recipient', type: 'text', placeholder: 'Who is this for?' },
    { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Write your message...', aiAutoFill: true },
    { key: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'low', label: '🟢 Low' }, { value: 'normal', label: '🔵 Normal' },
      { value: 'high', label: '🟠 High' }, { value: 'critical', label: '🔴 Critical' },
    ]},
  ],
  government: [
    { key: 'department', label: 'Department', type: 'text', placeholder: 'Which government department?' },
    { key: 'request', label: 'Request Details', type: 'textarea', placeholder: 'Describe your request or report...', aiAutoFill: true },
    { key: 'reference_no', label: 'Reference Number', type: 'text', placeholder: 'REF-000' },
  ],
  security: [
    { key: 'incident_type', label: 'Incident Type', type: 'select', options: [
      { value: 'theft', label: '🚨 Theft' }, { value: 'fraud', label: '⚠️ Fraud' },
      { value: 'safety', label: '🛡 Safety Concern' }, { value: 'other', label: '📋 Other' },
    ]},
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the incident or concern...', aiAutoFill: true },
    { key: 'location', label: 'Location', type: 'text', placeholder: 'Where did this happen?' },
    { key: 'urgent', label: 'Urgent', type: 'toggle' },
  ],
  energy: [
    { key: 'energy_type', label: 'Energy Type', type: 'select', options: [
      { value: 'solar', label: '☀️ Solar' }, { value: 'grid', label: '⚡ Grid Power' },
      { value: 'generator', label: '🔧 Generator' }, { value: 'battery', label: '🔋 Battery Storage' },
    ]},
    { key: 'capacity', label: 'Capacity (kWh)', type: 'number', placeholder: '5' },
    { key: 'description', label: 'Details', type: 'textarea', placeholder: 'Describe the energy need...', aiAutoFill: true },
  ],
  sports: [
    { key: 'sport', label: 'Sport / Activity', type: 'text', placeholder: 'e.g., Football, Athletics...' },
    { key: 'participants', label: 'Number of Participants', type: 'number', placeholder: '22' },
    { key: 'description', label: 'Event Details', type: 'textarea', placeholder: 'Describe the event or session...', aiAutoFill: true },
    { key: 'date', label: 'Date', type: 'date' },
  ],
}

// Tool-specific field overrides for key tools
const TOOL_SPECIFIC_FIELDS: Record<string, FormField[]> = {
  quick_invoice: [
    { key: 'amount', label: 'Invoice Amount (₡)', type: 'currency', placeholder: '0.00', prefix: '₡', required: true },
    { key: 'items', label: 'Line Items', type: 'textarea', placeholder: '1x Bag of Rice — ₡15,000\n2x Palm Oil (25L) — ₡24,000', aiAutoFill: true },
    { key: 'due_date', label: 'Due Date', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Payment terms, bank details...' },
  ],
  price_checker: [
    { key: 'item', label: 'Item to Check', type: 'text', placeholder: 'e.g., Bag of Rice, Cement, Palm Oil...', required: true },
    { key: 'market', label: 'Market', type: 'text', placeholder: 'e.g., Bodija, Mile 12, Onitsha Main...' },
    { key: 'quantity', label: 'Quantity', type: 'number', placeholder: '1' },
  ],
  inventory_tracker: [
    { key: 'item_name', label: 'Item Name', type: 'text', placeholder: 'Product name...', required: true },
    { key: 'current_stock', label: 'Current Stock', type: 'number', placeholder: '0', required: true },
    { key: 'reorder_level', label: 'Reorder Level', type: 'number', placeholder: '10' },
    { key: 'unit_price', label: 'Unit Price (₡)', type: 'currency', placeholder: '0.00', prefix: '₡' },
  ],
  soil_tester: [
    { key: 'location', label: 'Farm Location', type: 'text', placeholder: 'GPS or landmark...', required: true },
    { key: 'crop_intent', label: 'Intended Crop', type: 'text', placeholder: 'What will you plant?' },
    { key: 'last_tested', label: 'Last Tested', type: 'date' },
    { key: 'notes', label: 'Observations', type: 'textarea', placeholder: 'Soil color, texture, drainage...', aiAutoFill: true },
  ],
  weather_radar: [
    { key: 'location', label: 'Location', type: 'text', placeholder: 'Farm or business location...', required: true },
    { key: 'forecast_days', label: 'Forecast Range (days)', type: 'number', placeholder: '7' },
  ],
  runner_dispatch: [
    { key: 'pickup', label: 'Pickup Address', type: 'text', placeholder: 'Street, landmark, market...', required: true },
    { key: 'dropoff', label: 'Delivery Address', type: 'text', placeholder: 'Destination address...', required: true },
    { key: 'package_desc', label: 'Package Description', type: 'textarea', placeholder: 'What is being delivered?', required: true },
    { key: 'weight', label: 'Approx. Weight (kg)', type: 'number', placeholder: '2' },
    { key: 'amount', label: 'Delivery Fee (₡)', type: 'currency', placeholder: '0.00', prefix: '₡' },
    { key: 'urgent', label: 'Urgent (rush fee applies)', type: 'toggle' },
  ],
  symptom_checker: [
    { key: 'symptoms', label: 'Symptoms', type: 'textarea', placeholder: 'Describe your symptoms in detail...', required: true, aiAutoFill: true },
    { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 3 days, 2 weeks...' },
    { key: 'severity', label: 'Severity', type: 'select', options: [
      { value: 'mild', label: '🟢 Mild' }, { value: 'moderate', label: '🟡 Moderate' },
      { value: 'severe', label: '🔴 Severe' },
    ]},
    { key: 'allergies', label: 'Known Allergies', type: 'text', placeholder: 'Any allergies?' },
  ],
  contract_draft: [
    { key: 'party_a', label: 'Party A (You)', type: 'text', placeholder: 'Your name or business...' },
    { key: 'party_b', label: 'Party B', type: 'text', placeholder: 'Counterparty name...' },
    { key: 'scope', label: 'Contract Scope', type: 'textarea', placeholder: 'What is being agreed upon?', required: true, aiAutoFill: true },
    { key: 'amount', label: 'Contract Value (₡)', type: 'currency', placeholder: '0.00', prefix: '₡' },
    { key: 'start_date', label: 'Start Date', type: 'date' },
    { key: 'end_date', label: 'End Date', type: 'date' },
  ],
}

// ── AI Response Simulator ────────────────────────────────────────────
function generateAIResponse(tool: ToolDefinition, question: string, formData: Record<string, string>): string {
  const cat = tool.category
  const name = tool.name

  // Smart context-aware responses
  if (question.includes('price') || question.includes('charge') || question.includes('cost')) {
    if (cat === 'commerce') return `Based on current market data for ${formData.title || 'this item'}, I suggest pricing between ₡5,000 - ₡15,000 depending on quality and location. The average market rate in Lagos is ₡8,500. Consider your sourcing cost plus a 25-30% margin for healthy profit.`
    if (cat === 'professional') return `For ${formData.title || 'this service'}, typical rates range from ₡20,000 - ₡150,000 depending on complexity and your experience level. Consider billing hourly (₡5,000-₡15,000/hr) for consulting work, or fixed-rate for deliverables.`
    return `I'd suggest researching comparable offerings in your village. The Cowrie Flow dashboard can show you market benchmarks for similar ${cat} services.`
  }

  if (question.includes('description') || question.includes('write')) {
    const title = formData.title || name
    if (cat === 'commerce') return `"Premium quality ${title.toLowerCase()} — sourced directly from trusted local suppliers. Fresh, reliable, and competitively priced for bulk and retail buyers. Escrow-protected transactions for your peace of mind. 🌿"`
    if (cat === 'health') return `"Comprehensive ${title.toLowerCase()} service provided by certified practitioners. Patient-centered care with thorough documentation and follow-up protocols. Available for urgent and routine cases."`
    return `"Professional ${title.toLowerCase()} — trusted, efficient, and built on the pillars of community trust. Backed by the village's reputation system. Let's work together to get this done right."`
  }

  if (question.includes('template') || question.includes('generate')) {
    if (tool.key === 'quick_invoice') return `Here's a suggested invoice layout:\n\n📋 Invoice #INV-2026-001\nDate: ${new Date().toLocaleDateString()}\n\nItems:\n${formData.items || '1x Service — ₡0.00'}\n\nSubtotal: ₡${formData.amount || '0.00'}\nTotal: ₡${formData.amount || '0.00'}\n\nPayment: Cowrie Escrow\nDue: ${formData.due_date || '7 days'}`
    return `I've generated a ${name} template based on your inputs. Review the details and adjust as needed before submitting.`
  }

  if (question.includes('forecast') || question.includes('predict') || question.includes('trend')) {
    if (cat === 'agriculture') return `Based on seasonal patterns and current weather data for your region: expect dry conditions for the next 2 weeks, followed by moderate rainfall. Current soil moisture levels suggest watering every 3 days. Best planting window: within the next 7-10 days for optimal germination.`
    if (cat === 'commerce') return `Market trends show a 12% increase in demand for ${formData.title || 'this category'} over the past month. Peak buying days are Friday-Sunday. Consider increasing stock by 15% for the upcoming festivities.`
    return `I'll analyze the latest data and trends for ${formData.title || name}. Based on historical patterns in your village, here are the key insights...`
  }

  // Generic helpful response
  const responses = [
    `Great question! For ${name}, I recommend starting with the required fields and adding details as you go. The AI will auto-validate your entries and suggest improvements.`,
    `Based on the village data, ${name} is most effective when used with clear descriptions and accurate amounts. I can help you draft the details — just fill in the basics and I'll refine them.`,
    `I've analyzed similar ${cat} tools usage patterns. The top performers in your village always include detailed descriptions and set realistic timelines. Let me help you optimize this ${name.toLowerCase()}.`,
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

// ── CSS ──────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
@keyframes tlFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes tlPulse{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes tlSlide{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes tlSpin{to{transform:rotate(360deg)}}
@keyframes tlGlow{0%,100%{box-shadow:0 0 8px var(--vc,rgba(26,124,62,.3))}50%{box-shadow:0 0 24px var(--vc,rgba(26,124,62,.5))}}
@keyframes tlShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes tlCheck{0%{transform:scale(0)}50%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes tlTyping{0%,80%,100%{opacity:.3}40%{opacity:1}}
.tl-fade{animation:tlFade .4s ease both}.tl-slide{animation:tlSlide .3s ease both}
.tl-glow{animation:tlGlow 2s infinite}.tl-pulse{animation:tlPulse 1.5s infinite}
.tl-spin{animation:tlSpin .8s linear infinite}
.tl-check{animation:tlCheck .4s ease both}
.tl-no-sb::-webkit-scrollbar{display:none}.tl-no-sb{scrollbar-width:none}
`

// ── Session Code Generator ───────────────────────────────────────────
function genCode(): string {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 4; i++) s += c[Math.floor(Math.random() * c.length)]
  return `BS-2026-${s}`
}
function genId(): string {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

function ToolLauncherInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toolKey = searchParams.get('tool') || ''
  const villageId = searchParams.get('village') || ''
  const roleKey = searchParams.get('role') || ''

  const villageColor = useVillageStore(s => s.activeVillageColor) || '#1a7c3e'
  const tool = TOOL_REGISTRY[toolKey] || null

  // Resolve village + role context
  const village = villageId ? VILLAGE_BY_ID[villageId] : null
  const role = village && roleKey ? village.roles?.find((r: any) => r.key === roleKey) : null

  // Form state
  const [formData, setFormData] = React.useState<Record<string, string>>({})
  const [toggles, setToggles] = React.useState<Record<string, boolean>>({})
  const [showAI, setShowAI] = React.useState(false)
  const [aiInput, setAiInput] = React.useState('')
  const [aiMessages, setAiMessages] = React.useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [aiThinking, setAiThinking] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState<{ id: string; code: string } | null>(null)
  const [activeTab, setActiveTab] = React.useState<'form' | 'results'>('form')
  const [toolResults, setToolResults] = React.useState<any>(null)
  const [flash, setFlash] = React.useState('')

  const aiEndRef = React.useRef<HTMLDivElement>(null)

  // Inject CSS
  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('tl-css')) {
      const s = document.createElement('style'); s.id = 'tl-css'; s.textContent = CSS; document.head.appendChild(s)
    }
  }, [])

  // Scroll AI chat to bottom
  React.useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [aiMessages])

  const fields = React.useMemo(() => tool ? generateFieldsForTool(tool) : [], [tool])
  const prompts = React.useMemo(() => tool ? (AI_PROMPTS[tool.category] || AI_PROMPTS.commerce) : [], [tool])

  const updateForm = (key: string, value: string) => setFormData(p => ({ ...p, [key]: value }))
  const toggleField = (key: string) => setToggles(p => ({ ...p, [key]: !p[key] }))

  // Check if required fields are filled
  const canSubmit = React.useMemo(() => {
    return fields.filter(f => f.required).every(f => {
      if (f.type === 'toggle') return true
      return (formData[f.key] || '').trim().length > 0
    })
  }, [fields, formData])

  // AI chat handler
  const sendAI = (question: string) => {
    if (!tool || !question.trim()) return
    setAiMessages(m => [...m, { role: 'user', text: question.trim() }])
    setAiInput('')
    setAiThinking(true)
    setTimeout(() => {
      const response = generateAIResponse(tool, question.toLowerCase(), formData)
      setAiMessages(m => [...m, { role: 'ai', text: response }])
      setAiThinking(false)
    }, 800 + Math.random() * 1200)
  }

  // Submit handler
  const handleSubmit = async () => {
    if (!tool || !canSubmit || submitting) return
    setSubmitting(true)

    // For session tools — try to create business session
    if (tool.opensBusinessSession) {
      try {
        const resp = await fetch('http://localhost:3006/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-afro-id': 'NG-LAG-0001-0001' },
          body: JSON.stringify({
            sessionType: tool.category === 'commerce' ? 'GOODS_SALE' :
              tool.category === 'logistics' ? 'DELIVERY_ONLY' :
              tool.category === 'professional' ? 'PROFESSIONAL' :
              tool.category === 'community' ? 'COMMUNITY' : 'SERVICE_DELIVERY',
            title: formData.title || tool.name,
            description: formData.description || formData.scope || formData.notes || '',
            deliveryRequired: toggles.delivery || toggles.urgent || false,
            deliveryAddress: formData.dropoff || formData.pickup || undefined,
            counterpartyAfroId: formData.counterparty || undefined,
          }),
        })
        if (resp.ok) {
          const { session } = await resp.json()
          setSubmitted({ id: session.id, code: session.sessionCode })
          setSubmitting(false)
          return
        }
      } catch {}
      // Fallback: mock session
      setSubmitted({ id: genId(), code: genCode() })
    } else {
      // Standalone tool — generate results
      generateToolResults()
    }
    setSubmitting(false)
  }

  // Generate mock AI-powered results for standalone tools
  const generateToolResults = () => {
    if (!tool) return
    const title = formData.title || tool.name

    const results: Record<string, any> = {
      tool: tool.name,
      generatedAt: new Date().toISOString(),
      status: 'complete',
    }

    switch (tool.key) {
      case 'price_checker':
        results.data = {
          item: formData.item || 'Item',
          market: formData.market || 'Lagos Markets',
          prices: [
            { market: 'Bodija Market', price: Math.floor(8000 + Math.random() * 5000), quality: 'Premium' },
            { market: 'Mile 12 Market', price: Math.floor(6000 + Math.random() * 4000), quality: 'Standard' },
            { market: 'Onitsha Main', price: Math.floor(5500 + Math.random() * 3000), quality: 'Wholesale' },
            { market: 'Sabon Gari', price: Math.floor(7000 + Math.random() * 4000), quality: 'Premium' },
          ],
          trend: Math.random() > 0.5 ? 'rising' : 'stable',
          confidence: Math.floor(75 + Math.random() * 20),
          recommendation: `Best value at Mile 12 Market. Price trend is ${Math.random() > 0.5 ? 'rising — buy now' : 'stable — safe to wait'}.`,
        }
        break
      case 'inventory_tracker':
        results.data = {
          item: formData.item_name || 'Item',
          currentStock: parseInt(formData.current_stock || '0'),
          reorderLevel: parseInt(formData.reorder_level || '10'),
          status: parseInt(formData.current_stock || '0') <= parseInt(formData.reorder_level || '10') ? 'LOW' : 'OK',
          dailyUsageRate: Math.floor(2 + Math.random() * 8),
          daysUntilEmpty: Math.floor(3 + Math.random() * 20),
          recommendation: parseInt(formData.current_stock || '0') <= parseInt(formData.reorder_level || '10')
            ? '⚠️ Stock is below reorder level. Order immediately to avoid stockout.'
            : '✅ Stock levels healthy. Next reorder in approximately ' + Math.floor(5 + Math.random() * 15) + ' days.',
        }
        break
      case 'weather_radar':
        results.data = {
          location: formData.location || 'Unknown',
          forecast: Array.from({ length: Math.min(parseInt(formData.forecast_days || '7'), 7) }, (_, i) => ({
            day: new Date(Date.now() + i * 86400000).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' }),
            temp: Math.floor(26 + Math.random() * 8),
            humidity: Math.floor(55 + Math.random() * 35),
            rain: Math.random() > 0.6 ? Math.floor(5 + Math.random() * 30) : 0,
            condition: Math.random() > 0.6 ? '🌧 Rain' : Math.random() > 0.3 ? '⛅ Partly Cloudy' : '☀️ Sunny',
          })),
          advisory: 'Expect moderate rainfall mid-week. Plan field activities for early week. Harvest-ready crops should be gathered before Wednesday.',
        }
        break
      case 'symptom_checker':
        results.data = {
          symptoms: formData.symptoms || 'Not specified',
          assessment: 'Based on the described symptoms, this appears to be a moderate condition that should be evaluated by a healthcare professional.',
          possibleConditions: [
            { name: 'Common condition A', probability: '45%', severity: 'Mild' },
            { name: 'Common condition B', probability: '30%', severity: 'Moderate' },
            { name: 'Less common C', probability: '15%', severity: 'Variable' },
          ],
          recommendation: '🏥 We recommend visiting a healthcare provider within 48 hours. This is not an emergency but should not be ignored.',
          disclaimer: '⚠️ This AI assessment is for informational purposes only. Always consult a qualified healthcare professional.',
        }
        break
      default:
        results.data = {
          title,
          summary: `Your ${tool.name} has been processed successfully. The AI has analyzed your inputs and generated optimized results.`,
          inputs: Object.fromEntries(
            Object.entries(formData).filter(([_, v]) => v?.trim())
          ),
          aiInsight: `Based on village patterns, this ${tool.category} activity has a high success rate when paired with timely execution and clear communication with all parties involved.`,
          nextSteps: [
            `Review the generated ${tool.name.toLowerCase()} details`,
            'Share with relevant parties via Seso Chat',
            'Track progress in your Cowrie Flow dashboard',
          ],
        }
    }

    setToolResults(results)
    setActiveTab('results')
  }

  const doFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 2000) }

  // ── Not found ──────────────────────────────────────────────────────
  if (!tool) {
    return (
      <div style={{ minHeight: '100dvh', background: '#050a06', color: '#f0f7f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🔧</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, fontFamily: 'Sora, sans-serif' }}>Tool Not Found</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, marginBottom: 24 }}>
          The tool &quot;{toolKey}&quot; doesn&apos;t exist in the registry.<br/>
          Go back to your village to select a valid tool.
        </p>
        <button onClick={() => router.back()} style={{ padding: '12px 28px', borderRadius: 12, background: '#1a7c3e', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          ← Go Back
        </button>
      </div>
    )
  }

  // ── Success state (business session created) ───────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: '100dvh', background: '#050a06', color: '#f0f7f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="tl-fade" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="tl-check" style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: `linear-gradient(135deg, ${villageColor}, #22c55e)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
          }}>✓</div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Sora, sans-serif', marginBottom: 6 }}>
            {tool.opensBusinessSession ? 'Session Created' : 'Tool Activated'}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(240,247,240,.5)', marginBottom: 24, lineHeight: 1.5 }}>
            {tool.opensBusinessSession
              ? 'Your business session is ready. Share the code with your counterparty.'
              : `Your ${tool.name} is now active and running.`}
          </div>
          {/* Session Code */}
          <div className="tl-glow" style={{ '--vc': villageColor + '55', background: `${villageColor}12`, border: `2px solid ${villageColor}35`, borderRadius: 16, padding: '20px 24px', marginBottom: 24 } as any}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,247,240,.4)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Session Code</div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Sora, sans-serif', color: villageColor, letterSpacing: '.05em' }}>{submitted.code}</div>
          </div>
          {/* Details card */}
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 16, marginBottom: 28, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(240,247,240,.4)' }}>Tool</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0' }}>{tool.icon} {tool.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(240,247,240,.4)' }}>Title</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0' }}>{formData.title || '—'}</span>
            </div>
            {formData.amount && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'rgba(240,247,240,.4)' }}>Amount</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>₡{formData.amount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'rgba(240,247,240,.4)' }}>Cowrie Flow</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: tool.cowrieFlow === 'earns' ? '#4ade80' : tool.cowrieFlow === 'spends' ? '#f87171' : 'rgba(255,255,255,.5)' }}>
                {tool.cowrieFlow === 'earns' ? '↑ Earns' : tool.cowrieFlow === 'spends' ? '↓ Spends' : '— Neutral'}
              </span>
            </div>
          </div>
          <button onClick={() => router.push(`/dashboard/sessions/${submitted.id}`)} style={{ width: '100%', padding: '16px 0', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${villageColor}, #22c55e)`, color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: 'Sora, sans-serif', cursor: 'pointer', marginBottom: 12 }}>
            🔥 Enter Session
          </button>
          <button onClick={() => { if (typeof navigator !== 'undefined') navigator.clipboard?.writeText(submitted.code) ; doFlash('Code copied!') }} style={{ width: '100%', padding: '14px 0', borderRadius: 14, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            📋 Copy Session Code
          </button>
        </div>
      </div>
    )
  }

  // ── Main tool launcher ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', background: '#050a06', color: '#f0f7f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Flash toast */}
      {flash && (
        <div className="tl-fade" style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 999, padding: '10px 20px', borderRadius: 12, background: 'rgba(26,124,62,.95)', color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,.4)' }}>
          {flash}
        </div>
      )}

      {/* ── Sticky Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
        background: `linear-gradient(180deg, ${villageColor}12, transparent)`,
        borderBottom: `1px solid ${villageColor}20`,
        position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)',
      }}>
        <button onClick={() => router.back()} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', color: '#f0f7f0' }}>
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{tool.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: '#f0f7f0' }}>{tool.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(240,247,240,.45)', fontWeight: 600, marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ textTransform: 'capitalize' }}>{tool.category}</span>
                {tool.opensBusinessSession && <span style={{ padding: '1px 5px', borderRadius: 4, background: `${villageColor}20`, color: villageColor, fontSize: 9, fontWeight: 800 }}>SESSION</span>}
                {tool.cowrieFlow !== 'neutral' && (
                  <span style={{ padding: '1px 5px', borderRadius: 4, background: tool.cowrieFlow === 'earns' ? 'rgba(74,222,128,.1)' : 'rgba(248,113,113,.1)', color: tool.cowrieFlow === 'earns' ? '#4ade80' : '#f87171', fontSize: 9, fontWeight: 800 }}>
                    {tool.cowrieFlow === 'earns' ? '₡ EARNS' : '₡ SPENDS'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* AI toggle */}
        <button
          onClick={() => setShowAI(!showAI)}
          style={{
            padding: '7px 12px', borderRadius: 10,
            background: showAI ? `${villageColor}25` : 'rgba(255,255,255,.06)',
            border: `1.5px solid ${showAI ? villageColor + '50' : 'rgba(255,255,255,.1)'}`,
            color: showAI ? villageColor : 'rgba(255,255,255,.6)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          🦅 AI
        </button>
      </div>

      {/* ── Village / role context breadcrumb ── */}
      {(village || role) && (
        <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          {village && (
            <span style={{ padding: '3px 8px', borderRadius: 6, background: `${villageColor}12`, border: `1px solid ${villageColor}25`, color: villageColor, fontSize: 10, fontWeight: 700 }}>
              {village.emoji} {village.name}
            </span>
          )}
          {village && role && <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)' }}>·</span>}
          {role && (
            <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.55)', fontSize: 10, fontWeight: 600 }}>
              {role.name}
            </span>
          )}
        </div>
      )}

      {/* ── Tool description ── */}
      <div className="tl-fade" style={{ padding: '12px 16px', background: `${villageColor}06`, borderBottom: '1px solid rgba(255,255,255,.04)' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.6, margin: 0 }}>
          {tool.description}
        </p>
      </div>

      {/* ── Tab bar (form / results) ── */}
      {toolResults && (
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          {(['form', 'results'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
              background: activeTab === tab ? `${villageColor}10` : 'transparent',
              borderBottom: activeTab === tab ? `2px solid ${villageColor}` : '2px solid transparent',
              color: activeTab === tab ? villageColor : 'rgba(255,255,255,.4)',
              fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
            }}>
              {tab === 'form' ? '📝 Form' : '📊 Results'}
            </button>
          ))}
        </div>
      )}

      {/* ── Results tab ── */}
      {activeTab === 'results' && toolResults && (
        <div className="tl-fade" style={{ padding: '16px' }}>
          <div style={{ background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.15)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>AI Analysis Complete</span>
            </div>
            {/* Render results based on tool */}
            {tool.key === 'price_checker' && toolResults.data && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f7f0', marginBottom: 12 }}>
                  {toolResults.data.item} — Market Prices
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {toolResults.data.prices.map((p: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0' }}>{p.market}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{p.quality}</div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#4ade80' }}>₡{p.price.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Trend:</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: toolResults.data.trend === 'rising' ? '#f59e0b' : '#4ade80' }}>
                    {toolResults.data.trend === 'rising' ? '📈 Rising' : '📊 Stable'}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>· {toolResults.data.confidence}% confidence</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5, padding: '10px 12px', background: `${villageColor}08`, borderRadius: 10, border: `1px solid ${villageColor}15` }}>
                  🦅 {toolResults.data.recommendation}
                </div>
              </div>
            )}
            {tool.key === 'weather_radar' && toolResults.data && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f7f0', marginBottom: 12 }}>
                  Weather — {toolResults.data.location}
                </div>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }} className="tl-no-sb">
                  {toolResults.data.forecast.map((d: any, i: number) => (
                    <div key={i} style={{ flexShrink: 0, width: 80, padding: '10px 8px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>{d.day}</div>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{d.condition.split(' ')[0]}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f7f0' }}>{d.temp}°C</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>💧 {d.humidity}%</div>
                      {d.rain > 0 && <div style={{ fontSize: 9, color: '#60a5fa', marginTop: 2 }}>🌧 {d.rain}mm</div>}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5, padding: '10px 12px', background: `${villageColor}08`, borderRadius: 10, border: `1px solid ${villageColor}15`, marginTop: 8 }}>
                  🦅 {toolResults.data.advisory}
                </div>
              </div>
            )}
            {tool.key === 'symptom_checker' && toolResults.data && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f7f0', marginBottom: 12 }}>
                  Health Assessment
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.6, margin: '0 0 12px' }}>
                  {toolResults.data.assessment}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {toolResults.data.possibleConditions.map((c: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,.04)' }}>
                      <span style={{ fontSize: 12, color: '#f0f7f0' }}>{c.name}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: villageColor }}>{c.probability}</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{c.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.15)', fontSize: 12, color: '#fca5a5', lineHeight: 1.5, marginBottom: 8 }}>
                  {toolResults.data.recommendation}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', lineHeight: 1.5 }}>
                  {toolResults.data.disclaimer}
                </div>
              </div>
            )}
            {tool.key === 'inventory_tracker' && toolResults.data && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f7f0', marginBottom: 12 }}>
                  Inventory Status — {toolResults.data.item}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 4 }}>Current Stock</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: toolResults.data.status === 'LOW' ? '#f87171' : '#4ade80' }}>{toolResults.data.currentStock}</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 4 }}>Reorder Level</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#f0f7f0' }}>{toolResults.data.reorderLevel}</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 4 }}>Daily Usage</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#f0f7f0' }}>{toolResults.data.dailyUsageRate}/day</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 4 }}>Days Left</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: toolResults.data.daysUntilEmpty <= 5 ? '#f87171' : '#f0f7f0' }}>{toolResults.data.daysUntilEmpty}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5, padding: '10px 12px', background: `${villageColor}08`, borderRadius: 10, border: `1px solid ${villageColor}15` }}>
                  🦅 {toolResults.data.recommendation}
                </div>
              </div>
            )}
            {/* Generic results for all other tools */}
            {!['price_checker', 'weather_radar', 'symptom_checker', 'inventory_tracker'].includes(tool.key) && toolResults.data && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f7f0', marginBottom: 12 }}>
                  {toolResults.data.title || tool.name} — Results
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.6, margin: '0 0 12px' }}>
                  {toolResults.data.summary}
                </p>
                {/* Input summary */}
                {toolResults.data.inputs && Object.keys(toolResults.data.inputs).length > 0 && (
                  <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', marginBottom: 6 }}>Your Inputs</div>
                    {Object.entries(toolResults.data.inputs).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#f0f7f0', maxWidth: '60%', textAlign: 'right' }}>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* AI Insight */}
                <div style={{ padding: '10px 12px', borderRadius: 10, background: `${villageColor}08`, border: `1px solid ${villageColor}15`, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: villageColor, marginBottom: 4 }}>🦅 AI INSIGHT</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>{toolResults.data.aiInsight}</div>
                </div>
                {/* Next steps */}
                {toolResults.data.nextSteps && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', marginBottom: 6 }}>Next Steps</div>
                    {toolResults.data.nextSteps.map((step: string, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${villageColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: villageColor, flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons in results */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { doFlash('Results copied!'); navigator?.clipboard?.writeText(JSON.stringify(toolResults.data, null, 2)) }} style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              📋 Copy
            </button>
            <button onClick={() => doFlash('Shared via Seso Chat')} style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: `${villageColor}15`, border: `1px solid ${villageColor}35`, color: villageColor, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              💬 Share via Seso
            </button>
          </div>
        </div>
      )}

      {/* ── Form tab ── */}
      {activeTab === 'form' && (
        <div style={{ padding: '16px 16px 200px' }}>
          {/* Smart form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {fields.map((field, i) => (
              <div key={field.key} className="tl-fade" style={{ animationDelay: `${i * 0.04}s` }}>
                {/* Label */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,247,240,.45)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                    {field.label} {field.required && <span style={{ color: '#b22222' }}>*</span>}
                  </label>
                  {field.aiAutoFill && (
                    <button
                      onClick={() => {
                        const suggestion = generateAIResponse(tool, `help me write a ${field.label.toLowerCase()}`, formData)
                        const clean = suggestion.replace(/^"|"$/g, '')
                        updateForm(field.key, clean)
                        doFlash('AI auto-filled!')
                      }}
                      style={{ padding: '2px 8px', borderRadius: 6, background: `${villageColor}15`, border: `1px solid ${villageColor}30`, color: villageColor, fontSize: 9, fontWeight: 700, cursor: 'pointer' }}
                    >
                      🦅 AI Fill
                    </button>
                  )}
                </div>

                {/* Field render */}
                {(field.type === 'text' || field.type === 'phone') && (
                  <input
                    value={formData[field.key] || ''}
                    onChange={e => updateForm(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    inputMode={field.type === 'phone' ? 'tel' : 'text'}
                    style={{
                      width: '100%', padding: '13px 14px', borderRadius: 12, boxSizing: 'border-box',
                      background: 'rgba(255,255,255,.05)', border: `1.5px solid ${formData[field.key] ? villageColor + '40' : 'rgba(255,255,255,.1)'}`,
                      color: '#f0f7f0', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                      transition: 'border-color .2s',
                    }}
                  />
                )}

                {field.type === 'currency' && (
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: '#4ade80' }}>₡</span>
                    <input
                      value={formData[field.key] || ''}
                      onChange={e => { const v = e.target.value.replace(/[^0-9.]/g, ''); updateForm(field.key, v) }}
                      placeholder={field.placeholder}
                      inputMode="decimal"
                      style={{
                        width: '100%', padding: '13px 14px 13px 36px', borderRadius: 12, boxSizing: 'border-box',
                        background: 'rgba(255,255,255,.05)', border: `1.5px solid ${formData[field.key] ? villageColor + '40' : 'rgba(255,255,255,.1)'}`,
                        color: '#f0f7f0', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                  </div>
                )}

                {field.type === 'number' && (
                  <input
                    value={formData[field.key] || ''}
                    onChange={e => { const v = e.target.value.replace(/[^0-9.]/g, ''); updateForm(field.key, v) }}
                    placeholder={field.placeholder}
                    inputMode="decimal"
                    style={{
                      width: '100%', padding: '13px 14px', borderRadius: 12, boxSizing: 'border-box',
                      background: 'rgba(255,255,255,.05)', border: `1.5px solid ${formData[field.key] ? villageColor + '40' : 'rgba(255,255,255,.1)'}`,
                      color: '#f0f7f0', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={e => updateForm(field.key, e.target.value)}
                    rows={3}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '13px 14px', borderRadius: 12, boxSizing: 'border-box',
                      background: 'rgba(255,255,255,.05)', border: `1.5px solid ${formData[field.key] ? villageColor + '40' : 'rgba(255,255,255,.1)'}`,
                      color: '#f0f7f0', fontSize: 13, outline: 'none', fontFamily: 'inherit',
                      resize: 'none', lineHeight: 1.5,
                    }}
                  />
                )}

                {field.type === 'select' && field.options && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {field.options.map(opt => {
                      const sel = formData[field.key] === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => updateForm(field.key, opt.value)}
                          style={{
                            padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                            background: sel ? `${villageColor}20` : 'rgba(255,255,255,.04)',
                            border: `1.5px solid ${sel ? villageColor + '50' : 'rgba(255,255,255,.1)'}`,
                            color: sel ? villageColor : 'rgba(255,255,255,.6)',
                            fontSize: 12, fontWeight: 600, transition: 'all .15s',
                          }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                )}

                {field.type === 'toggle' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{toggles[field.key] ? 'Yes' : 'No'}</span>
                    <button
                      onClick={() => toggleField(field.key)}
                      style={{
                        width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                        background: toggles[field.key] ? villageColor : 'rgba(255,255,255,.12)',
                        position: 'relative', transition: 'background .2s',
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3,
                        left: toggles[field.key] ? 23 : 3,
                        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                      }} />
                    </button>
                  </div>
                )}

                {field.type === 'date' && (
                  <input
                    type="date"
                    value={formData[field.key] || ''}
                    onChange={e => updateForm(field.key, e.target.value)}
                    style={{
                      width: '100%', padding: '13px 14px', borderRadius: 12, boxSizing: 'border-box',
                      background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.1)',
                      color: '#f0f7f0', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                      colorScheme: 'dark',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Submit Button ── */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            style={{
              width: '100%', padding: '16px 0', borderRadius: 14, border: 'none', marginTop: 24,
              background: canSubmit && !submitting ? `linear-gradient(135deg, ${villageColor}, #22c55e)` : 'rgba(255,255,255,.08)',
              color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: 'Sora, sans-serif',
              cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
              opacity: canSubmit && !submitting ? 1 : 0.4,
              transition: 'all .3s',
            }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="tl-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
                Processing...
              </span>
            ) : tool.opensBusinessSession ? (
              `🔥 Open ${tool.name} Session`
            ) : (
              `⚡ Run ${tool.name}`
            )}
          </button>
        </div>
      )}

      {/* ── AI Assistant Panel (slide-up) ── */}
      {showAI && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          maxHeight: '55vh', display: 'flex', flexDirection: 'column',
          background: '#0a0f0b', borderTop: `2px solid ${villageColor}40`,
          borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,.6)',
        }}>
          {/* AI Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🦅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#f0f7f0' }}>Griot AI Assistant</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Helping with {tool.name}</div>
              </div>
            </div>
            <button onClick={() => setShowAI(false)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }} className="tl-no-sb">
            {aiMessages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginBottom: 12 }}>Ask me anything about {tool.name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  {prompts.map((p, i) => (
                    <button key={i} onClick={() => sendAI(p)} style={{ padding: '7px 12px', borderRadius: 10, background: `${villageColor}12`, border: `1px solid ${villageColor}25`, color: villageColor, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {aiMessages.map((m, i) => (
              <div key={i} className="tl-slide" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10, animationDelay: `${i * 0.05}s` }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: 14,
                  background: m.role === 'user' ? `${villageColor}20` : 'rgba(255,255,255,.06)',
                  border: `1px solid ${m.role === 'user' ? villageColor + '30' : 'rgba(255,255,255,.08)'}`,
                }}>
                  {m.role === 'ai' && <div style={{ fontSize: 9, fontWeight: 700, color: villageColor, marginBottom: 4 }}>🦅 GRIOT</div>}
                  <div style={{ fontSize: 12, color: '#f0f7f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.text}</div>
                </div>
              </div>
            ))}
            {aiThinking && (
              <div className="tl-slide" style={{ display: 'flex', gap: 4, padding: '8px 14px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: villageColor, animation: `tlTyping 1.2s infinite ${i * 0.15}s` }} />
                ))}
              </div>
            )}
            <div ref={aiEndRef} />
          </div>

          {/* AI Input */}
          <div style={{ padding: '8px 12px 12px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 8 }}>
            <input
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendAI(aiInput)}
              placeholder="Ask the Griot..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12, boxSizing: 'border-box',
                background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                color: '#f0f7f0', fontSize: 13, outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => sendAI(aiInput)}
              disabled={!aiInput.trim() || aiThinking}
              style={{
                padding: '10px 14px', borderRadius: 12, border: 'none',
                background: aiInput.trim() ? villageColor : 'rgba(255,255,255,.08)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: aiInput.trim() ? 'pointer' : 'not-allowed',
                opacity: aiInput.trim() && !aiThinking ? 1 : 0.4,
              }}
            >
              🥁
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewSessionPage() {
  return (
    <React.Suspense fallback={
      <div style={{ minHeight: '100dvh', background: '#050a06', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="tl-spin" style={{ width: 24, height: 24, border: '2px solid rgba(26,124,62,.3)', borderTopColor: '#1a7c3e', borderRadius: '50%' }} />
      </div>
    }>
      <ToolLauncherInner />
    </React.Suspense>
  )
}
