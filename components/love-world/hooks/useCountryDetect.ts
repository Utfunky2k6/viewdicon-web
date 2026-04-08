'use client'
import * as React from 'react'

const TZ_COUNTRY: Record<string, string> = {
  'Africa/Lagos': 'NG', 'Africa/Abuja': 'NG',
  'Africa/Accra': 'GH',
  'Africa/Nairobi': 'KE',
  'Africa/Johannesburg': 'ZA', 'Africa/Cape_Town': 'ZA',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
  'Europe/London': 'GB',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'Europe/Berlin': 'EU', 'Europe/Paris': 'EU', 'Europe/Amsterdam': 'EU',
  'Africa/Cairo': 'EG', 'Africa/Casablanca': 'MA',
  'Africa/Kampala': 'KE', 'Africa/Dar_es_Salaam': 'KE',
  'Africa/Kigali': 'KE', 'Africa/Addis_Ababa': 'KE',
}

export function useCountryDetect(): string {
  const [country, setCountry] = React.useState('US')

  React.useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const detected = TZ_COUNTRY[tz]
      if (detected) setCountry(detected)
    } catch {}
  }, [])

  return country
}
