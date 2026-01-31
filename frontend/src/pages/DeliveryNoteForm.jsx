import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'

export default function DeliveryNoteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [formData, setFormData] = useState({
    client: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: '',
    delivered_by: '',
    notes: '',
    items: [{ description: '', quantity: 1, observation: '' }]
  })

  useEffect(() => {
    fetchClients()
    if (id) fetchDeliveryNote()
  }, [id])

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients/')
      setClients(response.data.results || response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des clients')
    }
  }

  const fetchDeliveryNote = async () => {
    try {
      const response = await api.get(`/delivery-notes/${id}/`)
      const note = response.data
      setFormData({
        client: note.client,
        date: note.date,
        payment_method: note.payment_method || '',
        delivered_by: note.delivered_by || '',
        notes: note.notes || '',
        items: note.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          observation: item.observation || ''
        }))
      })
    } catch (error) {
      toast.error('Bordereau non trouvé')
      navigate('/delivery-notes')
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, observation: '' }]
    })
  }

  const removeItem = (index) => {
    if (formData.items.length === 1) return
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.client) {
      toast.error('Veuillez sélectionner un client')
      return
    }
    if (formData.items.some(item => !item.description || item.quantity <= 0)) {
      toast.error('Veuillez remplir tous les articles')
      return
    }

    setLoading(true)
    try {
      if (id) {
        await api.put(`/delivery-notes/${id}/`, formData)
        toast.success('Bordereau modifié')
      } else {
        await api.post('/delivery-notes/', formData)
        toast.success('Bordereau créé')
      }
      navigate('/delivery-notes')
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/delivery-notes')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? 'Modifier le bordereau' : 'Nouveau bordereau de livraison'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="input-field"
              >
                <option value="">Sélectionner</option>
                <option value="cash">Espèces</option>
                <option value="check">Chèque</option>
                <option value="transfer">Virement</option>
                <option value="mobile">Mobile Money</option>
                <option value="credit">Crédit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Livré par</label>
              <input
                type="text"
                value={formData.delivered_by}
                onChange={(e) => setFormData({ ...formData, delivered_by: e.target.value })}
                className="input-field"
                placeholder="Nom du livreur"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Articles livrés</h2>
            <button type="button" onClick={addItem} className="btn-secondary flex items-center gap-2">
              <Plus size={18} /> Ajouter
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="input-field"
                      placeholder="Description du produit"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="input-field"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observation</label>
                    <input
                      type="text"
                      value={item.observation}
                      onChange={(e) => handleItemChange(index, 'observation', e.target.value)}
                      className="input-field"
                      placeholder="Observation"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg mb-0.5"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observations générales</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="input-field"
            rows={3}
            placeholder="Observations ou remarques..."
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/delivery-notes')} className="btn-secondary">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Save size={20} />
                {id ? 'Modifier' : 'Créer le bordereau'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
