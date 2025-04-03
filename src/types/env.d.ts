// env.d.ts
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // Puedes agregar otras variables de entorno aquí si las tienes
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}