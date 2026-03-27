import { NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../../_lib/proxy'

// Day-of-week rotating briefing — used as fallback when Griot AI service is offline
function buildDailyBriefing() {
  const day = new Date().getUTCDay()
  const briefings = [
    { message: 'A new sunrise in the village. The marketplace is alive — what will you build today?', chips: [{ label: '📦 Send a Runner', action: 'runner' }, { label: '💼 Open Trade', action: 'trade' }] },
    { message: 'The elders say: quiet waters run deep. Your Ubuntu score is rising.', chips: [{ label: '📜 View Ledger', action: 'ledger' }, { label: '⭕ Ajo Status', action: 'ajo' }] },
    { message: 'Two villages are calling your name. The Griot hears everything.', chips: [{ label: '📨 Read Messages', action: 'messages' }, { label: '🔗 New Connection', action: 'connect' }] },
    { message: 'The ancestors are pleased. Your Crest grows stronger with each honourable act.', chips: [{ label: '🏅 View Crest', action: 'crest' }, { label: '📊 Village Stats', action: 'stats' }] },
    { message: 'Commerce never sleeps. Three offers await your seal in the marketplace.', chips: [{ label: '🤝 View Offers', action: 'marketplace' }, { label: '⚡ Quick Deal', action: 'deal' }] },
    { message: 'Your family tree has a new voice. Someone added their branch.', chips: [{ label: '🌳 View Tree', action: 'family' }, { label: '📣 Announce', action: 'announce' }] },
    { message: 'The village has spoken in your honour at the Sòrò Sókè circle.', chips: [{ label: '🎙 Join Circle', action: 'soro-soke' }, { label: '❤ Show Gratitude', action: 'react' }] },
  ]
  const picked = briefings[day]
  return {
    message: picked.message,
    chips: picked.chips,
    proverb: 'Umuntu ngumuntu ngabantu.',
    proverbLang: 'Zulu',
  }
}

export async function GET() {
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.GRIOT}/api/v1/griot/daily-briefing`,
    buildDailyBriefing(),
  )
  return NextResponse.json({ ...data, live })
}
