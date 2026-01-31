import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'

export default function ClientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (id) {
      fetchClient()
    }
  }, [id])

  const fetchClient = async () => {
    try {
      const response = await api.get(`/clients/${id}/`)
      reset(response.data)
    } catch (error) {
      toast.error('Client non trouvé')
      navigate('/clients')
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (id) {
        await api.put(`/clients/${id}/`, data)
        toast.success('Client modifié')
      } else {
        await api.post('/clients/', data)
        toast.success('Client créé')
      }
      navigate('/clients')
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
          onClick={() => navigate('/clients')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? 'Modifier le client' : 'Nouveau client'}
        </h1>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'entreprise / Client *
            </label>
            <input
              {...register('name', { required: 'Ce champ est requis' })}
              className="input-field"
              placeholder="Nom du client"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                {...register('phone')}
                className="input-field"
                placeholder="+221 XX XXX XX XX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="input-field"
                placeholder="email@exemple.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <textarea
              {...register('address')}
              className="input-field"
              rows={3}
              placeholder="Adresse complète"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NINEA
            </label>
            <input
              {...register('ninea')}
              className="input-field"
              placeholder="Numéro NINEA (optionnel)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Save size={20} />
                  {id ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
