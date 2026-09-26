import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Profile from './components/Profile/Profile.jsx'
import ProductSection from './components/ProductSection/ProductSection.jsx'
import Cart from './components/Cart/Cart.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product" element={<ProductSection />} />
        <Route path="/product/:id" element={<ProductSection />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>,
)
