import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import { menuData } from './data/menuData';
import AdminPanel from './components/AdminPanel';
import { getLang, setLang } from './utils/lang';
import MenuItem from './components/MenuItem';

function LanguageSwitcher() {
  const lang = getLang();
  const handleChange = (e) => {
    setLang(e.target.value);
    window.location.reload();
  };
  return (
    <select value={lang} onChange={handleChange} style={{ marginLeft: 16, padding: 4, borderRadius: 6 }}>
      <option value="uz">O'zbekcha</option>
      <option value="ru">Русский</option>
    </select>
  );
}

function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [showPopular, setShowPopular] = useState(false);
  const lang = getLang();

  const texts = {
    menuTitle: {
      uz: "To'liq Menu",
      ru: "Полное меню"
    },
    menuSubtitle: {
      uz: "Barcha taomlarimiz va ichimliklarimiz",
      ru: "Все наши блюда и напитки"
    },
    rating: {
      uz: "ta baho",
      ru: "оценок"
    }
  };

  // Qidiruv, kategoriya, mashhurlik va saralash bo'yicha filtr
  let filteredMenu = menuData.filter(item => {
    // Kategoriya bo'yicha
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    // Qidiruv bo'yicha (nom va tavsif, tanlangan tilga mos)
    let name = item.name;
    let description = item.description;
    if (lang === 'ru') {
      if (item.name_ru) name = item.name_ru;
      if (item.description_ru) description = item.description_ru;
    }
    const searchMatch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase());
    // Mashhurlik bo'yicha
    const popularMatch = !showPopular || item.popular;
    return categoryMatch && searchMatch && popularMatch;
  });

  // Saralash
  if (sort === 'price_asc') {
    filteredMenu = [...filteredMenu].sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    filteredMenu = [...filteredMenu].sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    filteredMenu = [...filteredMenu].sort((a, b) => b.rating - a.rating);
  } else if (sort === 'popular') {
    filteredMenu = [...filteredMenu].sort((a, b) => (b.popular === a.popular ? 0 : b.popular ? 1 : -1));
  }

  const categories = ['all', ...new Set(menuData.map(item => item.category))];

  const categoryNames = {
    uz: {
      all: 'Hammasi',
      milliy: 'Milliy taomlar',
      fastfood: 'Fast Food',
      ichimliklar: 'Ichimliklar',
      shirinliklar: 'Shirinliklar',
      salatlar: 'Salatlar',
      non: 'Non va pishiriqlar'
    },
    ru: {
      all: 'Все',
      milliy: 'Национальные блюда',
      fastfood: 'Фастфуд',
      ichimliklar: 'Напитки',
      shirinliklar: 'Сладости',
      salatlar: 'Салаты',
      non: 'Хлеб и выпечка'
    }
  };

  const categoryTitle = {
    uz: 'Kategoriyalar',
    ru: 'Категории'
  };

  const categoryIcons = {
    'all': '🍽️',
    'milliy': '🏺',
    'fastfood': '🍔',
    'ichimliklar': '🥤',
    'shirinliklar': '🍰',
    'salatlar': '🥗',
    'non': '🥖'
  };

  return (
    <div className="menu-page">
      {/* Header */}
      <div className="header">
        <div className="logo">🍽️</div>
        <LanguageSwitcher />
        <h1>
          <span>{texts.menuTitle[lang]}</span>
        </h1>
        <p>
          <span>{texts.menuSubtitle[lang]}</span>
        </p>
        <div className="rating">
          ⭐⭐⭐⭐⭐ 4.8 (156 {texts.rating[lang]})
        </div>
      </div>

      {/* Qidiruv paneli va filtrlar */}
      <div style={{ padding: 20, background: '#fff' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'ru' ? 'Поиск по меню...' : 'Menyudan qidirish...'}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee', fontSize: 16, marginBottom: 10 }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
            <option value="default">{lang === 'ru' ? 'Saralash' : 'Saralash'}</option>
            <option value="price_asc">{lang === 'ru' ? 'Narx: arzon → qimmat' : 'Narx: arzon → qimmat'}</option>
            <option value="price_desc">{lang === 'ru' ? 'Narx: qimmat → arzon' : 'Narx: qimmat → arzon'}</option>
            <option value="rating">{lang === 'ru' ? 'Reyting bo‘yicha' : 'Reyting bo‘yicha'}</option>
            <option value="popular">{lang === 'ru' ? 'Mashhurlik bo‘yicha' : 'Mashhurlik bo‘yicha'}</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="checkbox" checked={showPopular} onChange={e => setShowPopular(e.target.checked)} />
            <span>{lang === 'ru' ? 'Faqat mashhur' : 'Faqat mashhur'}</span>
          </label>
        </div>
      </div>

      {/* Categories */}
      <div className="categories">
        <h2>
          <span>{categoryTitle[lang]}</span>
        </h2>
        <div className="category-list">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              <span>{categoryIcons[category] || '🍽️'}</span>
              <span>{categoryNames[lang][category]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="menu-items">
        {filteredMenu.map(item => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function Navigation() {
  const location = useLocation();
  
  return (
      <div className="bottom-nav">
      <Link 
        to="/" 
        className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`}
        >
          🏠 Menu
      </Link>
      <Link 
        to="/admin" 
        className={`nav-btn ${location.pathname === '/admin' ? 'active' : ''}`}
      >
        ⚙️ Admin
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <div className="content">
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
        <Navigation />
      </div>
    </Router>
  );
}

export default App; 