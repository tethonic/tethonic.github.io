import TethonicConfig from "../../tethonic.config";
import type I18nKeys from "./keys";
import { en } from "./languages/en";
import { ar } from "./languages/ar";
import { fa } from "./languages/fa";

export type Translation = {
  [K in I18nKeys]: string;
};

const map: { [key: string]: Translation } = {
  en: en,
  ar: ar,
  fa: fa,
};

export function getTranslation(lang: string): Translation {
  return map[lang.toLowerCase()] || en;
}

export function i18n(key: I18nKeys, ...interpolations: string[]): string {
  const lang = TethonicConfig.locale;
  let translation = getTranslation(lang)[key];
  interpolations.forEach((interpolation) => {
    translation = translation.replace("{{}}", interpolation);
  });
  return translation;
}
