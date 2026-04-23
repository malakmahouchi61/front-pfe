import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';

const languages = [
  { code: 'fr', name: 'Français', flag: 'fr' },
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'de', name: 'Deutsch', flag: 'de' }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Récupère la langue actuelle en ignorant les sous-codes (ex: fr-FR → fr)
  const currentLangCode = i18n.language?.split('-')[0] || 'fr';
  const currentLang = languages.find(lang => lang.code === currentLangCode) || languages[0];

  return (
    <div className="lang-dropdown" ref={dropdownRef}>
      <button className="lang-dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        <FaGlobe size={20} />
        <span className={`fi fi-${currentLang.flag} current-flag`}></span>
      </button>
      {isOpen && (
        <div className="lang-dropdown-menu">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`lang-option ${i18n.language?.split('-')[0] === lang.code ? 'active' : ''}`}
            >
              <span className={`fi fi-${lang.flag}`}></span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;