import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Download, Edit, CheckCircle, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  finalized: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}/`)
      setInvoice(response.data)
    } catch (error) {
      toast.error('Facture non trouvée')
      navigate('/invoices')
    } finally {
      setLoading(false)
    }
  }

  const handleFinalize = async () => {
    try {
      await api.post(`/invoices/${id}/finalize/`)
      toast.success('Facture finalisée')
      fetchInvoice()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur')
    }
  }

  const handleMarkPaid = async () => {
    try {
      await api.post(`/invoices/${id}/mark_paid/`)
      toast.success('Facture marquée comme payée')
      fetchInvoice()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur')
    }
  }

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/invoices/${id}/pdf/`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoice.number}.pdf`)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (!invoice) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{invoice.number}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
              {invoice.status_display}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {invoice.status === 'draft' && (
            <>
              <Link to={`/invoices/${id}/edit`} className="btn-secondary flex items-center gap-2">
                <Edit size={18} /> Modifier
              </Link>
              <button onClick={handleFinalize} className="btn-primary flex items-center gap-2">
                <CheckCircle size={18} /> Finaliser
              </button>
            </>
          )}
          {invoice.status === 'finalized' && (
            <button onClick={handleMarkPaid} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2">
              <CreditCard size={18} /> Marquer payée
            </button>
          )}
          <button onClick={handleDownloadPdf} className="btn-secondary flex items-center gap-2">
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Articles</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Qté</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Prix unit.</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">TVA</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-800">{item.description}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{item.tva_rate}%</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-800">{formatCurrency(item.total_ht)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {invoice.notes && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Notes</h2>
              <p className="text-gray-600">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Client</h2>
            <div className="space-y-2 text-gray-600">
              <p className="font-medium text-gray-800">{invoice.client_detail?.name}</p>
              {invoice.client_detail?.address && <p>{invoice.client_detail.address}</p>}
              {invoice.client_detail?.phone && <p>Tél: {invoice.client_detail.phone}</p>}
              {invoice.client_detail?.email && <p>Email: {invoice.client_detail.email}</p>}
              {invoice.client_detail?.ninea && <p>NINEA: {invoice.client_detail.ninea}</p>}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Détails</h2>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Date:</span> {format(new Date(invoice.date), 'dd MMMM yyyy', { locale: fr })}</p>
              {invoice.due_date && (
                <p><span className="font-medium">Échéance:</span> {format(new Date(invoice.due_date), 'dd MMMM yyyy', { locale: fr })}</p>
              )}
              <p><span className="font-medium">Créée par:</span> {invoice.created_by_name || 'N/A'}</p>
            </div>
          </div>

          <div className="card bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total HT</span>
                <span className="font-medium">{formatCurrency(invoice.total_ht)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TVA</span>
                <span className="font-medium">{formatCurrency(invoice.total_tva)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold">Total TTC</span>
                <span className="text-lg font-bold text-primary-600">{formatCurrency(invoice.total_ttc)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
