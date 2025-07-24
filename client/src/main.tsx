import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { WsContextProvider } from './context/wsContext'
import router from './app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WsContextProvider>
      <RouterProvider router={router} />
    </WsContextProvider>
  </StrictMode>,
)
