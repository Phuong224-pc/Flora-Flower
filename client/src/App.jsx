import { Outlet } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ToastContainer from './components/ui/ToastContainer'

export default function App() {
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
