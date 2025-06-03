import { RouteObject } from "react-router-dom";
import { AddEditPlace, PlacesList } from "../features/places";

const routes: RouteObject[] = [
    {
        path: "/",
        element: <PlacesList />,
    },
    {
        path: "/places",
        element: <PlacesList />,
    },
    {
        path: "/addplace",
        element: <AddEditPlace />,
    },
    {
        path: "/addplace/:id",
        element: <AddEditPlace />,
    }
]

export default routes;