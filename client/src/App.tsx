import { createBrowserRouter } from "react-router";
import Home from "./Home";
import Rooms from "./Rooms";

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
    path: "*",
    element: <Home />
  },
])

export default router
