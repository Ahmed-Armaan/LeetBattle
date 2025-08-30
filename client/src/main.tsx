//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { WsContextProvider } from './context/wsContext'
import { TeamContextProvider } from './context/teamContext'
import { ProblemContextProvider } from './context/problemContext'
import { TimerContextProvider } from './context/TimerContext'
import router from './app'

createRoot(document.getElementById('root')!).render(
  <TimerContextProvider>
    <ProblemContextProvider>
      <TeamContextProvider>
        <WsContextProvider>
          <RouterProvider router={router} />
        </WsContextProvider>
      </TeamContextProvider>
    </ProblemContextProvider>
  </TimerContextProvider>
)
