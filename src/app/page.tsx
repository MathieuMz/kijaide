import { getServices } from '@/lib/supabase/services'
import { CATEGORIES } from '@/constants/categories'
import ServiceExplorer from '@/components/services/ServiceExplorer'

export default async function HomePage() {
  // Fetch toutes les offres au chargement
  const services = await getServices({ type: 'offer' })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-xl font-medium text-gray-900">Kijaide</h1>
        <p className="text-sm text-gray-500">Pays de Landivisiau</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <ServiceExplorer
          initialServices={services}
          categories={CATEGORIES}
        />
      </div>
    </main>
  )
}