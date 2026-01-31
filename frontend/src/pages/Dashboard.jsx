import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { 
  FileText, 
  FileCheck, 
  Truck, 
  Users, 
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar
} from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [proformaStats, setProformaStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [invoiceRes, proformaRes] = await Promise.all([
        api.get('/invoices/dashboard/'),
        api.get('/proformas/stats/')
      ])
      setStats(invoiceRes.data)
      setProformaStats(proformaRes.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec logo */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Bienvenue sur Moultazam</h1>
            <p className="text-primary-100 mt-1">Distribution & Fournitures Industrielles</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
            <Calendar size={18} />
            <span className="text-sm">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Factures ce mois</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.total_invoices_month || 0}</p>
            </div>
            <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center">
              <FileText className="text-primary-500" size={28} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Link to="/invoices" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              Voir les factures <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total facturé</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(stats?.total_amount_month)}
              </p>
            </div>
            <div className="w-14 h-14 bg-accent-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-accent-600" size={28} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Ce mois-ci</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Factures payées</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats?.paid_invoices || 0}</p>
              <p className="text-xs text-gray-400 mt-1">{formatCurrency(stats?.paid_amount)}</p>
            </div>
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
              <FileCheck className="text-green-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="text-3xl font-bold text-orange-500 mt-1">{stats?.pending_invoices || 0}</p>
            </div>
            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center">
              <FileText className="text-orange-500" size={28} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-orange-500 font-medium">À traiter</span>
          </div>
        </div>
      </div>

      {/* Proforma et Bordereaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Proformas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Factures Proforma</h2>
            <Link to="/proformas" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Voir tout
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <p className="text-2xl font-bold text-primary-600">{proformaStats?.total_proformas_month || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Ce mois</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{proformaStats?.accepted || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Acceptées</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{proformaStats?.converted || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Converties</p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/invoices/new"
              className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Nouvelle facture</span>
            </Link>

            <Link
              to="/proformas/new"
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Nouvelle proforma</span>
            </Link>

            <Link
              to="/delivery-notes/new"
              className="flex items-center gap-3 p-3 bg-accent-50 rounded-xl hover:bg-accent-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Nouveau bordereau</span>
            </Link>

            <Link
              to="/clients/new"
              className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Nouveau client</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/clients" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-800">Clients</p>
            <p className="text-xs text-gray-500">Gérer les clients</p>
          </div>
        </Link>

        <Link to="/invoices" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <FileText className="text-primary-600" size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-800">Factures</p>
            <p className="text-xs text-gray-500">Toutes les factures</p>
          </div>
        </Link>

        <Link to="/proformas" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileCheck className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-800">Devis</p>
            <p className="text-xs text-gray-500">Factures proforma</p>
          </div>
        </Link>

        <Link to="/delivery-notes" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
            <Truck className="text-accent-600" size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-800">Bordereaux</p>
            <p className="text-xs text-gray-500">Livraisons</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
