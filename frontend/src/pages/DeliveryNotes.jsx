import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Search, Eye, Download, Truck } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function DeliveryNotes() {
  const [deliveryNotes, setDeliveryNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchDeliveryNotes()
  }, [])

  const fetchDeliveryNotes = async () => {
    try {
      const response = await api.get('/delivery-notes/')
      setDeliveryNotes(response.data.results || response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des bordereaux')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async (id, number) => {
    try {
      const response = await api.get(`/delivery-notes/${id}/pdf/`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${number}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error('Erreur lors du téléchargement')
    }
  }

  const filteredNotes = deliveryNotes.filter(note =>
    note.number.toLowerCase().includes(search.toLowerCase()) ||
    note.client_detail?.name.toLowerCase().includes(search.toLowerCase()) ||
    note.delivered_by?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Bordereaux de livraison</h1>
        <Link to="/delivery-notes/new" className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={20} />
          Nouveau bordereau
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Truck size={48} className="mx-auto mb-4 text-gray-300" />
            {search ? 'Aucun bordereau trouvé' : 'Aucun bordereau créé'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">N° Bordereau</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden lg:table-cell">Livré par</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden lg:table-cell">Paiement</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map((note) => (
                  <tr key={note.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-primary-600">{note.number}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-800">{note.client_detail?.name}</td>
                    <td className="py-3 px-4 hidden md:table-cell text-gray-600">
                      {format(new Date(note.date), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-gray-600">
                      {note.delivered_by || '-'}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-gray-600">
                      {note.payment_method_display || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/delivery-notes/${note.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleDownloadPdf(note.id, note.number)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Télécharger PDF"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
