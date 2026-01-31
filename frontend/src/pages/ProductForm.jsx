import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      tva_rate: '18'
    }
  })

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}/`)
      reset(response.data)
    } catch (error) {
      toast.error('Produit non trouvé')
      navigate('/products')
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (id) {
        await api.put(`/products/${id}/`, data)
        toast.success('Produit modifié')
      } else {
        await api.post('/products/', data)
        toast.success('Produit créé')
      }
      navigate('/products')
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
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? 'Modifier le produit' : 'Nouveau produit'}
        </h1>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du produit *
            </label>
            <input
              {...register('name', { required: 'Ce champ est requis' })}
              className="input-field"
              placeholder="Nom du produit"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              className="input-field"
              rows={3}
              placeholder="Description du produit"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix unitaire (FCFA) *
              </label>
              <input
                {...register('unit_price', { 
                  required: 'Ce champ est requis',
                  min: { value: 0, message: 'Le prix doit être positif' }
                })}
                type="number"
                step="0.01"
                className="input-field"
                placeholder="0"
              />
              {errors.unit_price && <p className="text-red-500 text-sm mt-1">{errors.unit_price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux TVA *
              </label>
              <select
                {...register('tva_rate', { required: 'Ce champ est requis' })}
                className="input-field"
              >
                <option value="18">18%</option>
                <option value="0">0%</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/products')}
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
