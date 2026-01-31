import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import ClientForm from './pages/ClientForm'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import Invoices from './pages/Invoices'
import InvoiceForm from './pages/InvoiceForm'
import InvoiceDetail from './pages/InvoiceDetail'
import Proformas from './pages/Proformas'
import ProformaForm from './pages/ProformaForm'
import ProformaDetail from './pages/ProformaDetail'
import DeliveryNotes from './pages/DeliveryNotes'
import DeliveryNoteForm from './pages/DeliveryNoteForm'
import DeliveryNoteDetail from './pages/DeliveryNoteDetail'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/new" element={<ClientForm />} />
            <Route path="clients/:id/edit" element={<ClientForm />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<InvoiceForm />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            <Route path="invoices/:id/edit" element={<InvoiceForm />} />
            <Route path="proformas" element={<Proformas />} />
            <Route path="proformas/new" element={<ProformaForm />} />
            <Route path="proformas/:id" element={<ProformaDetail />} />
            <Route path="proformas/:id/edit" element={<ProformaForm />} />
            <Route path="delivery-notes" element={<DeliveryNotes />} />
            <Route path="delivery-notes/new" element={<DeliveryNoteForm />} />
            <Route path="delivery-notes/:id" element={<DeliveryNoteDetail />} />
            <Route path="delivery-notes/:id/edit" element={<DeliveryNoteForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
