'use client'

import { useState, useRef, useEffect } from 'react'
import { updateResident, fetchResident } from '@/lib/api'
import type { Resident } from '@/lib/types'

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
          confirmed ? 'border-brand-400 bg-brand-100' : 'border-slate-300 focus:border-brand-400'
        }`}
      />
      {suggestions.length > 0 && !confirmed && (
        <ul className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg mt-1 shadow-lg z-20 overflow-hidden">
          {suggestions.map((f, i) => (
            <li key={i}>
              <button
                onClick={() => handleSelect(f)}
                className="w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 border-b border-slate-300 last:border-0"
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

export default function InfosTab({ user, setUser }: { user: Resident; setUser: (u: Resident | null) => void }) {
  const [firstName, setFirstName] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [city, setCity] = useState('')
  const [availability, setAvailability] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [given, setGiven] = useState(0)
  const [received, setReceived] = useState(0)

  useEffect(() => {
    fetchResident(user.id).then(r => {
      setFirstName(r.first_name ?? user.first_name)
      setAddress(r.address ?? '')
      setLat(r.lat ?? null)
      setLng(r.lng ?? null)
      setCity(r.city ?? '')
      setAvailability(r.availability ?? '')
      setGiven(r.services_given ?? 0)
      setReceived(r.services_received ?? 0)
    }).catch(() => {
      setFirstName(user.first_name)
      setAddress(user.address ?? '')
      setLat(user.lat ?? null)
      setLng(user.lng ?? null)
      setCity(user.city ?? '')
      setAvailability(user.availability ?? '')
    }).finally(() => setIsLoading(false))
  }, [user.id])

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

  if (isLoading) return <p className="text-sm text-slate-500">Chargement...</p>

  return (
    <div className="space-y-5">

      <div className="flex gap-3">
        <div className="flex-1 bg-brand-100 border border-brand-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-brand-700">{given}</p>
          <p className="text-xs text-brand-600 mt-0.5">service{given > 1 ? 's' : ''} donné{given > 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 bg-slate-100 border border-slate-300 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-700">{received}</p>
          <p className="text-xs text-slate-600 mt-0.5">service{received > 1 ? 's' : ''} reçu{received > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Prénom</label>
        <input
          type="text"
          value={firstName}
          onChange={e => { setFirstName(e.target.value); setSaved(false) }}
          placeholder="Ex : Marie"
          className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-brand-400"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Adresse</label>
        <AddressSearch
          initialValue={address}
          onSelect={(addr, newLat, newLng, c) => {
            setAddress(addr); setLat(newLat); setLng(newLng); setCity(c); setSaved(false)
          }}
        />
        {city && <p className="text-xs text-brand-600 mt-1.5">📍 {city}</p>}
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">📅 Disponibilités</label>
        <input
          type="text"
          value={availability}
          onChange={e => { setAvailability(e.target.value); setSaved(false) }}
          placeholder="Ex : Le samedi matin"
          className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-brand-400"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving || !firstName.trim()}
        className="w-full py-3 rounded-xl bg-brand-500 text-white font-bold text-sm disabled:opacity-40 hover:bg-brand-600 transition-all"
      >
        {isSaving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer'}
      </button>

    </div>
  )
}
