import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'

export default function ProformaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [formData, setFormData] = useState({
    client: '',
    date: new Date().toISOString().split('T')[0],
    validity_date: '',
    notes: '',
    items: [{ description: '', quantity: 1, unit_price: 0, tva_rate: 18 }]
  })

  useEffect(() => {
    fetchClients()
    if (id) fetchProforma()
  }, [id])

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients/')
      setClients(response.data.results || response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des clients')
    }
  }

  const fetchProforma = async () => {
    try {
      const response = await api.get(`/proformas/${id}/`)
      const proforma = response.data
      setFormData({
        client: proforma.client,
        date: proforma.date,
        validity_date: proforma.validity_date || '',
        notes: proforma.notes || '',
        items: proforma.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tva_rate: item.tva_rate
        }))
      })
    } catch (error) {
      toast.error('Proforma non trouvée')
      navigate('/proformas')
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
      items: [...formData.items, { description: '', quantity: 1, unit_price: 0, tva_rate: 18 }]
    })
  }

  const removeItem = (index) => {
    if (formData.items.length === 1) return
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const calculateTotals = () => {
    let totalHT = 0
    let totalTVA = 0
    formData.items.forEach(item => {
      const ht = item.quantity * item.unit_price
      const tva = ht * (item.tva_rate / 100)
      totalHT += ht
      totalTVA += tva
    })
    return { totalHT, totalTVA, totalTTC: totalHT + totalTVA }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
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
        await api.put(`/proformas/${id}/`, formData)
        toast.success('Proforma modifiée')
      } else {
        await api.post('/proformas/', formData)
        toast.success('Proforma créée')
      }
      navigate('/proformas')
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/proformas')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? 'Modifier la proforma' : 'Nouvelle proforma'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Valide jusqu'au</label>
              <input
                type="date"
                value={formData.validity_date}
                onChange={(e) => setFormData({ ...formData, validity_date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Articles</h2>
            <button type="button" onClick={addItem} className="btn-secondary flex items-center gap-2">
              <Plus size={18} /> Ajouter
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="input-field"
                      placeholder="Description de l'article"
                      required
                    />
                  </div>
                  <div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix unit. *</label>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="input-field"
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TVA</label>
                    <select
                      value={item.tva_rate}
                      onChange={(e) => handleItemChange(index, 'tva_rate', parseFloat(e.target.value))}
                      className="input-field"
                    >
                      <option value="18">18%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-600">
                    Total ligne: <strong className="text-primary-600">{formatCurrency(item.quantity * item.unit_price)}</strong>
                  </span>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Notes ou conditions..."
              />
            </div>
            <div className="w-full md:w-72 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Total HT</span>
                <span className="font-medium">{formatCurrency(totals.totalHT)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">TVA</span>
                <span className="font-medium">{formatCurrency(totals.totalTVA)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                <span className="text-lg font-semibold">Total TTC</span>
                <span className="text-lg font-bold text-primary-600">{formatCurrency(totals.totalTTC)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/proformas')} className="btn-secondary">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Save size={20} />
                {id ? 'Modifier' : 'Créer la proforma'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
