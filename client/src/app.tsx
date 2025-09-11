import { createBrowserRouter } from "react-router";
import Home from "./home";
import Rooms from "./rooms";
import Lobby from "./lobby";
import PlayGround from "./playground";
import HistoryPage from "./history";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/rooms",
    element: <Rooms />,
  },
  {
    path: "/lobby/:roomId/:playerId",
    element: <Lobby />
  },
  {
    path: "/playground",
    element: <PlayGround />
  },
  {
    path: "/history",
    element: <HistoryPage />
  },
  {
    path: "*",
    element: <Home />
  },
])

export default router
