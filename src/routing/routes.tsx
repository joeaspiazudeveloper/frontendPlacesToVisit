import { RouteObject } from "react-router-dom";
import { AddEditPlace, PlacesList } from "../features/places";
import { FeatureFlagsPage } from "../features/flags";

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
        path: "/places/:id",
        element: <PlacesList />,
    },
    {
        path: "/addplace",
        element: <AddEditPlace />,
    },
    {
        path: "/addplace/:id",
        element: <AddEditPlace />,
    },
    {
        path: "/admin/flags",
        element: <FeatureFlagsPage />,
    }

]

export default routes;