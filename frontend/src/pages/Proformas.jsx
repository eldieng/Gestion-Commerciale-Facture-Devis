import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Search, Eye, Download, FileCheck } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  converted: 'bg-purple-100 text-purple-700',
}

export default function Proformas() {
  const [proformas, setProformas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchProformas()
  }, [statusFilter])

  const fetchProformas = async () => {
    try {
      let url = '/proformas/'
      if (statusFilter) url += `?status=${statusFilter}`
      const response = await api.get(url)
      setProformas(response.data.results || response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des proformas')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async (id, number) => {
    try {
      const response = await api.get(`/proformas/${id}/pdf/`, { responseType: 'blob' })
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const filteredProformas = proformas.filter(proforma =>
    proforma.number.toLowerCase().includes(search.toLowerCase()) ||
    proforma.client_detail?.name.toLowerCase().includes(search.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-800">Factures Proforma</h1>
        <Link to="/proformas/new" className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={20} />
          Nouvelle proforma
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyée</option>
            <option value="accepted">Acceptée</option>
            <option value="rejected">Refusée</option>
            <option value="converted">Convertie</option>
          </select>
        </div>

        {filteredProformas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileCheck size={48} className="mx-auto mb-4 text-gray-300" />
            {search || statusFilter ? 'Aucune proforma trouvée' : 'Aucune proforma créée'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">N° Proforma</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Total TTC</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Statut</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProformas.map((proforma) => (
                  <tr key={proforma.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-primary-600">{proforma.number}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-800">{proforma.client_detail?.name}</td>
                    <td className="py-3 px-4 hidden md:table-cell text-gray-600">
                      {format(new Date(proforma.date), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      {formatCurrency(proforma.total_ttc)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[proforma.status]}`}>
                        {proforma.status_display}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/proformas/${proforma.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleDownloadPdf(proforma.id, proforma.number)}
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
