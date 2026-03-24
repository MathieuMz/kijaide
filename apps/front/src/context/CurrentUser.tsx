'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Resident } from '@/lib/types'

interface CurrentUserContext {
  user: Resident | null
  setUser: (u: Resident | null) => void
}

const CurrentUserContext = createContext<CurrentUserContext>({
  user: null,
  setUser: () => {},
})

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<Resident | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('kijaide_user')
    if (stored) {
      try { setUserState(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  function setUser(u: Resident | null) {
    setUserState(u)
    if (u) localStorage.setItem('kijaide_user', JSON.stringify(u))
    else localStorage.removeItem('kijaide_user')
  }

  return (
    <CurrentUserContext.Provider value={{ user, setUser }}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function useCurrentUser() {
  return useContext(CurrentUserContext)
}
