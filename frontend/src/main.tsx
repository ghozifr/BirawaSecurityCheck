import {BrowserRouter as Router} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from 'react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRoutes from './AppRoutes.tsx'
import './global.css'
import { Toaster } from './components/ui/toaster.tsx'
// import {Sonner} from "sonner"; block dlu mike Toaster lebih customize


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <QueryClientProvider client={queryClient}>
        <AppRoutes/>
        <Toaster/>
        {/* <Sonner visibleToasts={1} position='top-right' richColors /> */}
      </QueryClientProvider>
    </Router>
  </StrictMode>,
)
