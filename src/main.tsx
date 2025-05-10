import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import { Toaster } from 'react-hot-toast';
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
// import { Analytics } from "@vercel/analytics/react"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
          <Toaster />
          {/* <Analytics/> */}
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>
)
