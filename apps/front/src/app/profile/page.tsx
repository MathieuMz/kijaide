'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateResident } from '@/lib/api'
import { useCurrentUser } from '@/context/CurrentUser'


interface AddressFeature {
  properties: { label: string; city: string; postcode: string }
  geometry: { coordinates: [number, number] }
}

function AddressSearch({
  initialValue,
  onSelect,
}: {
  initialValue: string
  onSelect: (address: string, lat: number, lng: number, city: string) => void
}) {
  const [query, setQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<AddressFeature[]>([])
  const [confirmed, setConfirmed] = useState(!!initialValue)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  function handleChange(value: string) {
    setQuery(value)
    setConfirmed(false)
    clearTimeout(timeoutRef.current)
    if (value.length < 3) { setSuggestions([]); return }
    timeoutRef.current = setTimeout(async () => {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5`
      )
      const data = await res.json()
      setSuggestions(data.features ?? [])
    }, 400)
  }

  function handleSelect(f: AddressFeature) {
    const [lng, lat] = f.geometry.coordinates
    setQuery(f.properties.label)
    setSuggestions([])
    setConfirmed(true)
    onSelect(f.properties.label, lat, lng, f.properties.city ?? '')
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={e => handleChange(e.target.value)}
        placeholder="Ex : 12 rue de la Paix, Landivisiau"
        className={`w-full border rounded-lg px-3 py-3 text-sm focus:outline-none transition-colors ${
          confirmed ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 focus:border-emerald-400'
        }`}
      />
      {suggestions.length > 0 && !confirmed && (
        <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-20 overflow-hidden">
          {suggestions.map((f, i) => (
            <li key={i}>
              <button
                onClick={() => handleSelect(f)}
                className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                {f.properties.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


import type { Resident } from '@/lib/types'

function ProfileForm({ user, setUser }: { user: Resident; setUser: (u: Resident | null) => void }) {
  const router = useRouter()

  const [firstName, setFirstName] = useState(user.first_name)
  const [address, setAddress] = useState(user.address ?? '')
  const [lat, setLat] = useState<number | null>(user.lat ?? null)
  const [lng, setLng] = useState<number | null>(user.lng ?? null)
  const [city, setCity] = useState(user.city ?? '')
  const [availability, setAvailability] = useState(user.availability ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      const updated = await updateResident(user.id, {
        first_name: firstName.trim(),
        address: address || null,
        lat,
        lng,
        availability: availability || null,
      })
      setUser({ ...user, ...updated, city })
      setSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-4 py-4 flex items-center gap-3 sticky top-0 bg-white z-10">
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Retour
        </button>
        <h1 className="text-base font-medium text-gray-900 flex-1">Mon profil</h1>
        {saved && <span className="text-sm text-gray-400">✓ Enregistré</span>}
      </header>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-5">

        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
            Prénom
          </label>
          <input
            type="text"
            value={firstName}
            onChange={e => { setFirstName(e.target.value); setSaved(false) }}
            placeholder="Ex : Marie"
            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
            Adresse
          </label>
          <AddressSearch
            initialValue={address}
            onSelect={(addr, newLat, newLng, c) => {
              setAddress(addr)
              setLat(newLat)
              setLng(newLng)
              setCity(c)
              setSaved(false)
            }}
          />
          {city && <p className="text-xs text-emerald-600 mt-1.5">📍 {city}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
            📅 Disponibilités
          </label>
          <input
            type="text"
            value={availability}
            onChange={e => { setAvailability(e.target.value); setSaved(false) }}
            placeholder="Ex : Le samedi matin"
            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-emerald-400"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !firstName.trim()}
          className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm disabled:opacity-40 hover:bg-emerald-600 transition-all"
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </main>
  )
}

export default function ProfilePage() {
  const { user, setUser } = useCurrentUser()
  if (!user) return null
  return <ProfileForm user={user} setUser={setUser} />
}
