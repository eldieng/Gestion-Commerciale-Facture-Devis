import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Download, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function DeliveryNoteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deliveryNote, setDeliveryNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeliveryNote()
  }, [id])

  const fetchDeliveryNote = async () => {
    try {
      const response = await api.get(`/delivery-notes/${id}/`)
      setDeliveryNote(response.data)
    } catch (error) {
      toast.error('Bordereau non trouvé')
      navigate('/delivery-notes')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/delivery-notes/${id}/pdf/`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${deliveryNote.number}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error('Erreur lors du téléchargement')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (!deliveryNote) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/delivery-notes')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{deliveryNote.number}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/delivery-notes/${id}/edit`} className="btn-secondary flex items-center gap-2">
            <Edit size={18} /> Modifier
          </Link>
          <button onClick={handleDownloadPdf} className="btn-primary flex items-center gap-2">
            <Download size={18} /> Télécharger PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Articles livrés</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Quantité</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Observation</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryNote.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-800">{item.description}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-3 px-4 text-gray-600">{item.observation || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {deliveryNote.notes && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Observations</h2>
              <p className="text-gray-600">{deliveryNote.notes}</p>
            </div>
          )}

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Signatures</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="h-24 border-b-2 border-gray-300 mb-2"></div>
                <p className="text-gray-600">Signature Client</p>
              </div>
              <div className="text-center">
                <div className="h-24 border-b-2 border-gray-300 mb-2"></div>
                <p className="text-gray-600">Signature Livreur</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Client</h2>
            <div className="space-y-2 text-gray-600">
              <p className="font-medium text-gray-800">{deliveryNote.client_detail?.name}</p>
              {deliveryNote.client_detail?.address && <p>{deliveryNote.client_detail.address}</p>}
              {deliveryNote.client_detail?.phone && <p>Tél: {deliveryNote.client_detail.phone}</p>}
              {deliveryNote.client_detail?.email && <p>Email: {deliveryNote.client_detail.email}</p>}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Détails de livraison</h2>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Date:</span> {format(new Date(deliveryNote.date), 'dd MMMM yyyy', { locale: fr })}</p>
              {deliveryNote.delivered_by && (
                <p><span className="font-medium">Livré par:</span> {deliveryNote.delivered_by}</p>
              )}
              {deliveryNote.payment_method_display && (
                <p><span className="font-medium">Paiement:</span> {deliveryNote.payment_method_display}</p>
              )}
              <p><span className="font-medium">Créé par:</span> {deliveryNote.created_by_name || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
