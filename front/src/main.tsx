import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/sonner"
import axios from 'axios'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Ensure axios always targets the current deployed origin (Cloud Run)
// This avoids accidental calls to localhost due to environment tooling or proxies
axios.defaults.baseURL = window.location.origin
axios.defaults.headers.common['Accept'] = 'application/json'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />

        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
