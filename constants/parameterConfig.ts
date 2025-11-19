// constants/parameterConfig.ts
import { AppTheme } from "./theme";

export type AquariumType = "marine" | "freshwater";

export type ParameterKey =
  | "kh"
  | "ca"
  | "mg"
  | "no3"
  | "po4"
  | "salinity"
  | "temp"
  | "ph"
  | "gh"
  | "ammonia"
  | "nitrite"
  | "nitrate"
  | "iron"
  | "co2"
  | "tds";

export type ParameterDef = {
  /** key de i18n: aquarium.paramNames.<key> */
  key: ParameterKey;
  /** nombre por defecto (fallback) */
  defaultName: string;
  unit: string;
  /** opcional: nombre de icono FontAwesome */
  icon?: string;
  /** color para la línea del gráfico (opcional) */
  color?: string;
};

/** Config general por tipo de acuario */
export const PARAMETER_CONFIG: Record<AquariumType, Record<ParameterKey, ParameterDef>> = {
  marine: {
    kh: {
      key: "kh",
      defaultName: "Alcalinidad (KH)",
      unit: "dKH",
      icon: "tint",
      color: AppTheme.COLORS.secondary,
    },
    ca: {
      key: "ca",
      defaultName: "Calcio (Ca)",
      unit: "ppm",
      icon: "flask",
      color: AppTheme.COLORS.primary,
    },
    mg: {
      key: "mg",
      defaultName: "Magnesio (Mg)",
      unit: "ppm",
      icon: "cube",
    },
    no3: {
      key: "no3",
      defaultName: "Nitrato (NO₃)",
      unit: "ppm",
      icon: "arrow-up",
    },
    po4: {
      key: "po4",
      defaultName: "Fosfato (PO₄)",
      unit: "ppm",
      icon: "arrow-down",
    },
    salinity: {
      key: "salinity",
      defaultName: "Salinidad",
      unit: "ppt",
      icon: "anchor",
    },
    temp: {
      key: "temp",
      defaultName: "Temperatura",
      unit: "°C",
      icon: "thermometer-half",
    },
    ph: {
      key: "ph",
      defaultName: "pH",
      unit: "",
      icon: "balance-scale",
    },

    // estos no son tan típicos en marino, pero los dejamos definidos
    gh: { key: "gh", defaultName: "Dureza General (GH)", unit: "°dGH" },
    ammonia: { key: "ammonia", defaultName: "Amonio", unit: "ppm" },
    nitrite: { key: "nitrite", defaultName: "Nitrito", unit: "ppm" },
    nitrate: { key: "nitrate", defaultName: "Nitrato", unit: "ppm" },
    iron: { key: "iron", defaultName: "Hierro (Fe)", unit: "ppm" },
    co2: { key: "co2", defaultName: "CO₂", unit: "ppm" },
    tds: { key: "tds", defaultName: "TDS", unit: "ppm" },
  },

  freshwater: {
    ph: {
      key: "ph",
      defaultName: "pH",
      unit: "",
      icon: "balance-scale",
    },
    gh: {
      key: "gh",
      defaultName: "Dureza General (GH)",
      unit: "°dGH",
      icon: "tint",
    },
    kh: {
      key: "kh",
      defaultName: "Carbonatos (KH)",
      unit: "°dKH",
      icon: "tint",
    },
    ammonia: {
      key: "ammonia",
      defaultName: "Amonio",
      unit: "ppm",
      icon: "exclamation-triangle",
    },
    nitrite: {
      key: "nitrite",
      defaultName: "Nitrito",
      unit: "ppm",
    },
    nitrate: {
      key: "nitrate",
      defaultName: "Nitrato",
      unit: "ppm",
    },
    iron: {
      key: "iron",
      defaultName: "Hierro (Fe)",
      unit: "ppm",
      icon: "leaf",
    },
    co2: {
      key: "co2",
      defaultName: "CO₂",
      unit: "ppm",
      icon: "cloud",
    },
    tds: {
      key: "tds",
      defaultName: "TDS",
      unit: "ppm",
    },
    temp: {
      key: "temp",
      defaultName: "Temperatura",
      unit: "°C",
      icon: "thermometer-half",
    },

    // estos quedan definidos aunque los uses menos en dulce
    ca: { key: "ca", defaultName: "Calcio (Ca)", unit: "ppm" },
    mg: { key: "mg", defaultName: "Magnesio (Mg)", unit: "ppm" },
    no3: { key: "no3", defaultName: "Nitrato (NO₃)", unit: "ppm" },
    po4: { key: "po4", defaultName: "Fosfato (PO₄)", unit: "ppm" },
    salinity: { key: "salinity", defaultName: "Salinidad", unit: "ppt" },
  },
};

/** Devuelve solo los parámetros relevantes según tipo de acuario */
export function getParametersForAquariumType(
  type?: string
): Record<ParameterKey, ParameterDef> {
  if (type === "freshwater") return PARAMETER_CONFIG.freshwater;
  // por defecto, marino
  return PARAMETER_CONFIG.marine;
}
