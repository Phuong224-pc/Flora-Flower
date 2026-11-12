import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ToastContainer from './components/ui/ToastContainer'

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <>
      <Header />
      <main style={{ minHeight: '70vh' }}>
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </>
  )
}
