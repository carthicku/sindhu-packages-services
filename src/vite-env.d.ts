/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENQUIRY_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
