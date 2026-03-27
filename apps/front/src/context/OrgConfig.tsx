'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { fetchOrganization } from '@/lib/api'
import type { Organization } from '@/lib/types'

const OrgConfigContext = createContext<Organization | null>(null)

export function OrgConfigProvider({ children }: { children: ReactNode }) {
  const [org, setOrg] = useState<Organization | null>(null)

  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_ORGANIZATION_ID
    if (id) fetchOrganization(id).then(setOrg).catch(() => {})
  }, [])

  return (
    <OrgConfigContext.Provider value={org}>
      {children}
    </OrgConfigContext.Provider>
  )
}

export function useOrgConfig() {
  return useContext(OrgConfigContext)
}
