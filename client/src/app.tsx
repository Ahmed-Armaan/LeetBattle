import { createBrowserRouter } from "react-router";
import Home from "./home";
import Rooms from "./rooms";
import Lobby from "./lobby";

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
    path: "*",
    element: <Home />
  },
])

export default router
