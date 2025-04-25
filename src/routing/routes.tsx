import { RouteObject } from "react-router-dom";
import { AddPlace, PlaceDetail, PlacesList } from "../features/places";

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
        element: <AddPlace />,
    },
    {
        path: "/addplace/:id",
        element: <AddPlace />,
    }
]

export default routes;