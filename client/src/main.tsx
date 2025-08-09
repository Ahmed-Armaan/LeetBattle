//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { WsContextProvider } from './context/wsContext'
import { TeamContextProvider } from './context/teamContext'
import { ProblemContextProvider } from './context/problemContext'
import router from './app'

createRoot(document.getElementById('root')!).render(
  <ProblemContextProvider>
    <TeamContextProvider>
      <WsContextProvider>
        <RouterProvider router={router} />
      </WsContextProvider>
    </TeamContextProvider>
  </ProblemContextProvider>
)
