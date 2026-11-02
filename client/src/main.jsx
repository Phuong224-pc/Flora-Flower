import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Wishlist from './pages/Wishlist'
import TrackOrder from './pages/TrackOrder'
import FAQ from './pages/FAQ'
import Profile from './pages/Profile'
import About from './pages/About'
import Contact from './pages/Contact'
import Policy from './pages/Policy'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import OccasionPage from './pages/OccasionPage'

import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminCustomerDetail from './pages/admin/AdminCustomerDetail'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminSettings from './pages/admin/AdminSettings'
import AdminOccasions from './pages/admin/AdminOccasions'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="shop"              element={<Shop />} />
          <Route path="shop/:category"    element={<Shop />} />
          <Route path="product/:slug"     element={<ProductDetail />} />
          <Route path="dip/:slug"         element={<OccasionPage />} />
          <Route path="cart"              element={<Cart />} />
          <Route path="checkout"          element={<Checkout />} />
          <Route path="order-success/:orderId" element={<OrderSuccess />} />
          <Route path="orders"            element={<Orders />} />
          <Route path="orders/:orderId"   element={<OrderDetail />} />
          <Route path="wishlist"          element={<Wishlist />} />
          <Route path="track-order"       element={<TrackOrder />} />
          <Route path="faq"               element={<FAQ />} />
          <Route path="profile"           element={<Profile />} />
          <Route path="about"             element={<About />} />
          <Route path="contact"           element={<Contact />} />
          <Route path="policy"            element={<Policy />} />
          <Route path="*"                 element={<NotFound />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                  element={<AdminDashboard />} />
          <Route path="orders"          element={<AdminOrders />} />
          <Route path="products"        element={<AdminProducts />} />
          <Route path="customers"       element={<AdminCustomers />} />
          <Route path="customers/:id"   element={<AdminCustomerDetail />} />
          <Route path="coupons"         element={<AdminCoupons />} />
          <Route path="occasions"       element={<AdminOccasions />} />
          <Route path="settings"        element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
