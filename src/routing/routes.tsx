import { RouteObject } from "react-router-dom";
import { AddEditPlace, PlaceDetail, PlacesList } from "../features/places";

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
        path: "/places/:placeId",
        element: <PlaceDetail />,
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