export function getLang() {
  if (typeof window !== 'undefined') {
    if (window.localStorage && localStorage.getItem('lang')) {
      return localStorage.getItem('lang');
    }
    if (window.lang) {
      return window.lang;
    }
  }
  return 'uz';
}

export function setLang(lang) {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('lang', lang);
    window.lang = lang;
  }
} 