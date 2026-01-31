import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Search, Edit, Trash2, Phone, Mail } from 'lucide-react'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients/')
      setClients(response.data.results || response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des clients')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return
    
    try {
      await api.delete(`/clients/${id}/`)
      toast.success('Client supprimé')
      fetchClients()
    } catch (error) {
      toast.error('Impossible de supprimer ce client')
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.phone?.includes(search) ||
    client.email?.toLowerCase().includes(search.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
        <Link to="/clients/new" className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={20} />
          Nouveau client
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {search ? 'Aucun client trouvé' : 'Aucun client enregistré'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Nom</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">Téléphone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden lg:table-cell">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden lg:table-cell">NINEA</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-800">{client.name}</div>
                      <div className="text-sm text-gray-500 md:hidden">
                        {client.phone && <span className="flex items-center gap-1"><Phone size={12} /> {client.phone}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-gray-600">{client.phone || '-'}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-gray-600">{client.email || '-'}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-gray-600">{client.ninea || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/clients/${client.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
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
