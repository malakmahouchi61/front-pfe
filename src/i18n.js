import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importer directement les traductions (copie les objets JSON que tu as fournis)
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';

i18n
  .use(LanguageDetector) // détecte la langue du navigateur
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      es: { translation: es },
      de: { translation: de }
    },
    fallbackLng: 'fr',
    debug: true, // mets true pour voir les logs dans la console
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;