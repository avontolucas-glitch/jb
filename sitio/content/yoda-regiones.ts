/**
 * Cómo se habla en cada país (lo usa content/yoda-habla.ts). Lo generó
 * herramientas/yoda_regiones.py con fichas escritas y revisadas por zona.
 * Las listas de detección van en minúsculas, sin tildes ni signos.
 */
export type Ficha = {
  id: string;
  nombre: string;
  tratamiento: "vos" | "tu" | "usted";
  pistas: string[];
  saludos: string[];
  comoEstas: string[];
  gracias: string[];
  chau: string[];
  si: string[];
  no: string[];
  risas: string[];
  genial: string[];
  enojo: string[];
  vocativos: string[];
  sinonimos: Partial<Record<string, string[]>>;
  trampas: string[];
  respuestas: Record<"saludo" | "comoEstas" | "gracias" | "chau" | "noEntendi" | "enojo" | "risa" | "genial" | "dale" | "no", string[]>;
};

export const REGIONES: Ficha[] = [];
