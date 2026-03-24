'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, CategoryId, SubcatId } from '@/constants/categories'
import { saveResidentSkills, createResident } from '@/lib/api'
import { useCurrentUser } from '@/context/CurrentUser'

// ─── Questions swipe ──────────────────────────────────────────────────────────

const QUESTIONS: Record<CategoryId, string> = {
  [CategoryId.JardinageBricolage]: 'Tu jardines ou tu bricoles à la maison ?',
  [CategoryId.GardeAnimaux]:       'Tu peux garder des enfants ou des animaux ?',
  [CategoryId.CoursesMobilite]:    'Tu as une voiture et tu peux rendre service ?',
  [CategoryId.CuisineRepas]:       'Tu cuisines avec plaisir et tu veux partager ?',
  [CategoryId.InformatiqueAdmin]:  "Tu es à l'aise avec le numérique ou les démarches admin ?",
  [CategoryId.SoutienScolaire]:    "Tu peux aider quelqu'un à apprendre quelque chose ?",
  [CategoryId.Compagnie]:          "Tu aimes rendre visite ou accompagner quelqu'un ?",
}

const AVAILABILITY_CHIPS = ['Le matin', 'L\'après-midi', 'Le soir', 'En semaine', 'Le weekend']

type Category = (typeof CATEGORIES)[number]
type Phase = 'identity' | 'swipe' | 'subcats' | 'details' | 'recap'

// ─── AddressSearch ────────────────────────────────────────────────────────────

interface AddressFeature {
  properties: { label: string; city: string; postcode: string }
  geometry: { coordinates: [number, number] }
}

function AddressSearch({
  onSelect,
}: {
  onSelect: (address: string, lat: number, lng: number, city: string) => void
}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AddressFeature[]>([])
  const [confirmed, setConfirmed] = useState(false)
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

// ─── IdentityStep ─────────────────────────────────────────────────────────────

function IdentityStep({
  firstName, setFirstName, city, onAddressSelect, onNext,
}: {
  firstName: string
  setFirstName: (v: string) => void
  city: string
  onAddressSelect: (address: string, lat: number, lng: number, city: string) => void
  onNext: () => void
}) {
  const canContinue = firstName.trim().length > 0 && city.length > 0

  return (
    <div className="flex flex-col px-4 py-8 gap-6 max-w-sm mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Bienvenue sur Kijaide</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quelques infos pour te présenter à tes voisins.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
            Prénom
          </label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Ex : Marie"
            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
            Adresse
          </label>
          <AddressSearch onSelect={onAddressSelect} />
          {city && (
            <p className="text-xs text-emerald-600 mt-1.5">📍 {city}</p>
          )}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm disabled:opacity-40 hover:bg-emerald-600 transition-all"
      >
        Continuer →
      </button>
    </div>
  )
}

// ─── SwipeCard ────────────────────────────────────────────────────────────────

function SwipeCard({
  category, question, exiting, index, total, onYes, onNo,
}: {
  category: Category
  question: string
  exiting: 'left' | 'right' | null
  index: number
  total: number
  onYes: () => void
  onNo: () => void
}) {
  let transform = 'translate-x-0 rotate-0 opacity-100'
  if (exiting === 'right') transform = 'translate-x-[150%] rotate-12 opacity-0'
  if (exiting === 'left')  transform = '-translate-x-[150%] -rotate-12 opacity-0'

  return (
    <div className="flex flex-col items-center justify-between h-screen max-h-[800px] px-4 py-8">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${
            i < index ? 'bg-emerald-500' : i === index ? 'bg-emerald-300' : 'bg-gray-200'
          }`} />
        ))}
      </div>

      <div className={`w-full max-w-sm transition-all duration-300 ease-in-out ${transform}`}>
        <div
          className="rounded-2xl border border-gray-100 shadow-lg p-10 flex flex-col items-center gap-6 text-center"
          style={{ backgroundColor: category.bg }}
        >
          <span className="text-8xl">{category.emoji}</span>
          <p className="text-xl font-semibold text-gray-800 leading-snug">{question}</p>
        </div>
      </div>

      <div className="flex gap-8">
        <button onClick={onNo} className="w-16 h-16 rounded-full border-2 border-gray-300 bg-white text-2xl flex items-center justify-center shadow hover:border-red-300 hover:text-red-400 transition-all">✗</button>
        <button onClick={onYes} className="w-16 h-16 rounded-full border-2 border-emerald-400 bg-emerald-50 text-2xl flex items-center justify-center shadow hover:bg-emerald-100 transition-all">✓</button>
      </div>
    </div>
  )
}

// ─── SubcatsScreen ────────────────────────────────────────────────────────────

function SubcatsScreen({
  category, selected, onToggle, onDone,
}: {
  category: Category
  selected: SubcatId[]
  onToggle: (s: SubcatId) => void
  onDone: () => void
}) {
  return (
    <div className="flex flex-col px-4 py-8 gap-6 max-w-sm mx-auto">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{category.emoji}</span>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{category.label}</h2>
          <p className="text-sm text-gray-500">Qu&apos;est-ce que tu peux faire ?</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {category.subcategories.map(sub => {
          const active = selected.includes(sub.id as SubcatId)
          return (
            <button
              key={sub.id}
              onClick={() => onToggle(sub.id as SubcatId)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                active
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {sub.label}
            </button>
          )
        })}
      </div>
      <button
        onClick={onDone}
        disabled={selected.length === 0}
        className="mt-2 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm disabled:opacity-40 hover:bg-emerald-600 transition-all"
      >
        Continuer →
      </button>
    </div>
  )
}

// ─── DetailsStep ──────────────────────────────────────────────────────────────

function formatChips(chips: string[]): string {
  if (chips.length === 0) return ''
  if (chips.length === 1) return chips[0]
  if (chips.length === 2) return `${chips[0]} et ${chips[1].toLowerCase()}`
  return chips.slice(0, -1).join(', ') + ' et ' + chips[chips.length - 1].toLowerCase()
}

function DetailsStep({
  accepted, selectedSubcats, comments, setComment, availability, setAvailability, onNext,
}: {
  accepted: CategoryId[]
  selectedSubcats: Partial<Record<CategoryId, SubcatId[]>>
  comments: Partial<Record<string, string>>
  setComment: (key: string, value: string) => void
  availability: string
  setAvailability: (v: string) => void
  onNext: () => void
}) {
  const categories = CATEGORIES.filter(c => accepted.includes(c.id))
  const [selectedChips, setSelectedChips] = useState<string[]>([])

  return (
    <div className="flex flex-col px-4 py-8 gap-6 max-w-sm mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Un peu de détail</h2>
        <p className="text-sm text-gray-500 mt-1">Facultatif, mais ça aide beaucoup.</p>
      </div>

      {categories.map(cat => {
        const subcats = (selectedSubcats[cat.id] ?? [])
          .map(id => cat.subcategories.find(s => s.id === id))
          .filter(Boolean) as typeof cat.subcategories[number][]

        return (
          <div key={cat.id}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {cat.emoji} {cat.label}
            </p>
            <div className="space-y-2">
              {subcats.map(sub => (
                <div key={sub.id}>
                  <label className="text-xs text-gray-500 block mb-1">{sub.label}</label>
                  <input
                    type="text"
                    value={comments[`${cat.id}:${sub.id}`] ?? ''}
                    onChange={e => setComment(`${cat.id}:${sub.id}`, e.target.value)}
                    placeholder="Ajouter un détail..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          📅 Disponibilités
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {AVAILABILITY_CHIPS.map(chip => {
            const active = selectedChips.includes(chip)
            return (
              <button
                key={chip}
                onClick={() => {
                  const next = active
                    ? selectedChips.filter(c => c !== chip)
                    : [...selectedChips, chip]
                  setSelectedChips(next)
                  setAvailability(formatChips(next))
                }}
                className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                  active
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {chip}
              </button>
            )
          })}
        </div>
        <input
          type="text"
          value={availability}
          onChange={e => setAvailability(e.target.value)}
          placeholder="Ex : Le samedi matin"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
        />
      </div>

      <button
        onClick={onNext}
        className="py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-all"
      >
        Voir le récap →
      </button>
    </div>
  )
}

// ─── RecapScreen ──────────────────────────────────────────────────────────────

function RecapScreen({
  firstName, city, accepted, selectedSubcats, comments, availability, saving, onSave,
}: {
  firstName: string
  city: string
  accepted: CategoryId[]
  selectedSubcats: Partial<Record<CategoryId, SubcatId[]>>
  comments: Partial<Record<string, string>>
  availability: string
  saving: boolean
  onSave: () => void
}) {
  const categories = CATEGORIES.filter(c => accepted.includes(c.id))

  return (
    <div className="flex flex-col px-4 py-8 gap-5 max-w-sm mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Ton profil</h2>
        <p className="text-sm text-gray-500 mt-1">Voilà ce que verront tes voisins.</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
          {firstName[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{firstName}</p>
          <p className="text-xs text-gray-500">📍 {city}{availability && ` · 📅 ${availability}`}</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucune compétence sélectionnée.</p>
      ) : (
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat.id} className="rounded-xl p-4 border border-gray-100" style={{ backgroundColor: cat.bg }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-sm font-medium text-gray-800">{cat.label}</span>
              </div>
              <div className="space-y-1">
                {(selectedSubcats[cat.id] ?? []).map(subcatId => {
                  const label = cat.subcategories.find(s => s.id === subcatId)?.label ?? subcatId
                  const comment = comments[`${cat.id}:${subcatId}`]
                  return (
                    <div key={subcatId}>
                      <span className="text-xs bg-white/80 border border-white rounded-full px-2.5 py-0.5 text-gray-700">{label}</span>
                      {comment && <p className="text-xs text-gray-500 mt-0.5 ml-1 italic">{comment}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onSave}
        disabled={saving}
        className="py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm disabled:opacity-40 hover:bg-emerald-600 transition-all"
      >
        {saving ? 'Enregistrement...' : "C'est parti !"}
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { setUser } = useCurrentUser()

  // Identity
  const [firstName, setFirstName] = useState('')
  const [address, setAddress] = useState('')
  const [addressLat, setAddressLat] = useState<number | null>(null)
  const [addressLng, setAddressLng] = useState<number | null>(null)
  const [city, setCity] = useState('')

  // Swipe
  const [phase, setPhase] = useState<Phase>('identity')
  const [swipeIndex, setSwipeIndex] = useState(0)
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null)
  const [accepted, setAccepted] = useState<CategoryId[]>([])
  const [selectedSubcats, setSelectedSubcats] = useState<Partial<Record<CategoryId, SubcatId[]>>>({})

  // Details
  const [comments, setComments] = useState<Partial<Record<string, string>>>({})
  const [availability, setAvailability] = useState('')

  const [saving, setSaving] = useState(false)

  const category = CATEGORIES[swipeIndex]

  function goToNextSwipe() {
    const next = swipeIndex + 1
    if (next >= CATEGORIES.length) {
      setPhase('details')
    } else {
      setSwipeIndex(next)
      setPhase('swipe')
    }
  }

  function handleSwipe(direction: 'left' | 'right') {
    if (direction === 'right') setAccepted(prev => [...prev, category.id])
    setExiting(direction)
    setTimeout(() => {
      setExiting(null)
      if (direction === 'right') setPhase('subcats')
      else goToNextSwipe()
    }, 300)
  }

  function toggleSubcat(catId: CategoryId, subcatId: SubcatId) {
    setSelectedSubcats(prev => {
      const current = prev[catId] ?? []
      return {
        ...prev,
        [catId]: current.includes(subcatId)
          ? current.filter(s => s !== subcatId)
          : [...current, subcatId],
      }
    })
  }

  async function handleSave() {
    setSaving(true)
    const skills = accepted.flatMap(catId =>
      (selectedSubcats[catId] ?? []).map(subcatId => ({
        category: catId,
        subcategory: subcatId,
        comment: comments[`${catId}:${subcatId}`] ?? null,
      }))
    )
    try {
      const newResident = await createResident({
        first_name: firstName,
        organization_id: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
        lat: addressLat,
        lng: addressLng,
        address,
        city,
        availability: availability || null,
      })
      await saveResidentSkills(newResident.id, skills)
      setUser(newResident)
      router.push('/')
    } catch {
      setSaving(false)
    }
  }

  if (phase === 'identity') {
    return (
      <main className="min-h-screen">
        <IdentityStep
          firstName={firstName}
          setFirstName={setFirstName}
          city={city}
          onAddressSelect={(addr, lat, lng, c) => {
            setAddress(addr)
            setAddressLat(lat)
            setAddressLng(lng)
            setCity(c)
          }}
          onNext={() => setPhase('swipe')}
        />
      </main>
    )
  }

  if (phase === 'subcats' && category) {
    return (
      <main className="min-h-screen">
        <SubcatsScreen
          category={category}
          selected={selectedSubcats[category.id] ?? []}
          onToggle={s => toggleSubcat(category.id, s)}
          onDone={goToNextSwipe}
        />
      </main>
    )
  }

  if (phase === 'details') {
    return (
      <main className="min-h-screen overflow-y-auto">
        <DetailsStep
          accepted={accepted}
          selectedSubcats={selectedSubcats}
          comments={comments}
          setComment={(key, val) => setComments(prev => ({ ...prev, [key]: val }))}
          availability={availability}
          setAvailability={setAvailability}
          onNext={() => setPhase('recap')}
        />
      </main>
    )
  }

  if (phase === 'recap') {
    return (
      <main className="min-h-screen overflow-y-auto">
        <RecapScreen
          firstName={firstName}
          city={city}
          accepted={accepted}
          selectedSubcats={selectedSubcats}
          comments={comments}
          availability={availability}
          saving={saving}
          onSave={handleSave}
        />
      </main>
    )
  }

  // phase === 'swipe'
  return (
    <main className="max-w-sm mx-auto overflow-hidden">
      {category && (
        <SwipeCard
          category={category}
          question={QUESTIONS[category.id]}
          exiting={exiting}
          index={swipeIndex}
          total={CATEGORIES.length}
          onYes={() => handleSwipe('right')}
          onNo={() => handleSwipe('left')}
        />
      )}
    </main>
  )
}
