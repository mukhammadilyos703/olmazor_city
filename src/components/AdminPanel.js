import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel() {
  // Parol state
  const [isAuthed, setIsAuthed] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changeMsg, setChangeMsg] = useState('');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Default parol: admin123
  useEffect(() => {
    if (!localStorage.getItem('admin_password')) {
      localStorage.setItem('admin_password', 'admin123');
    }
    // Avtorizatsiya flagini tekshirish
    if (localStorage.getItem('admin_authed') === 'true') {
      setIsAuthed(true);
    } else {
      setShowPasswordModal(true);
    }
  }, []);

  const checkPassword = () => {
    const saved = localStorage.getItem('admin_password');
    if (passwordInput === saved) {
      setIsAuthed(true);
      setShowPasswordModal(false);
      setPasswordError('');
      localStorage.setItem('admin_authed', 'true');
    } else {
      setPasswordError('Noto‘g‘ri parol!');
    }
  };

  const handleLogout = () => {
    setIsAuthed(false);
    localStorage.setItem('admin_authed', 'false');
    setShowPasswordModal(true);
    setPasswordInput('');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    const saved = localStorage.getItem('admin_password');
    if (oldPassword !== saved) {
      setChangeMsg('Eski parol noto‘g‘ri!');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setChangeMsg('Yangi parol kamida 4 ta belgidan iborat bo‘lishi kerak!');
      return;
    }
    localStorage.setItem('admin_password', newPassword);
    setChangeMsg('Parol muvaffaqiyatli o‘zgartirildi! Qayta kirishingiz kerak.');
    setTimeout(() => {
      setChangeMsg('');
      setShowChangePasswordModal(false);
      handleLogout();
    }, 1500);
  };

  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: "Osh",
      description: "An'anaviy o'zbek oshi, go'sht, sabzavot va guruch bilan",
      price: 25000,
      category: "milliy",
      rating: 4.9,
      spiceLevel: 2,
      popular: true
    },
    {
      id: 2,
      name: "Lag'mon",
      description: "Uzun ugra, go'sht va sabzavotlar bilan",
      price: 22000,
      category: "milliy",
      rating: 4.7,
      spiceLevel: 3,
      popular: true
    }
  ]);

  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const categories = ['milliy', 'fastfood', 'ichimliklar', 'shirinliklar', 'salatlar', 'non'];
  const categoryNames = {
    'milliy': 'Milliy taomlar',
    'fastfood': 'Fast Food',
    'ichimliklar': 'Ichimliklar',
    'shirinliklar': 'Shirinliklar',
    'salatlar': 'Salatlar',
    'non': 'Non va pishiriqlar'
  };

  const addMenuItem = (newItem) => {
    const item = {
      ...newItem,
      id: Date.now(),
      rating: parseFloat(newItem.rating),
      price: parseInt(newItem.price),
      spiceLevel: parseInt(newItem.spiceLevel),
      popular: newItem.popular === 'true'
    };
    setMenuItems([...menuItems, item]);
    setShowAddForm(false);
  };

  const updateMenuItem = (updatedItem) => {
    setMenuItems(menuItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingItem(null);
  };

  const deleteMenuItem = (id) => {
    if (window.confirm('Bu elementni o\'chirishni xohlaysizmi?')) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  if (!isAuthed) {
    return (
      <div className="admin-panel">
        {showPasswordModal && (
          <div className="form-overlay">
            <div className="form-modal">
              <h3>Admin parolni kiriting</h3>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Parol..."
                style={{ marginBottom: 8, width: '100%' }}
                onKeyDown={e => { if (e.key === 'Enter') checkPassword(); }}
                autoFocus
              />
              {passwordError && <div style={{ color: 'red', marginBottom: 8 }}>{passwordError}</div>}
              <button className="save-btn" onClick={checkPassword}>Kirish</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🍽️ Olmazor City - Admin Panel</h1>
        <p>Menu elementlarini boshqarish</p>
        <div style={{ margin: '16px 0', display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button className="delete-btn" onClick={handleLogout}>Chiqish</button>
          <a href="#change-password" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', fontSize: 16 }} onClick={e => { e.preventDefault(); setShowChangePasswordModal(true); }}>
            🔑 Parolni o‘zgartirish
          </a>
        </div>
      </div>
      {showChangePasswordModal && (
        <div className="form-overlay">
          <div className="form-modal">
            <h3>Parolni o‘zgartirish</h3>
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: 8 }}>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="Eski parol"
                  style={{ marginRight: 8 }}
                  required
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Yangi parol"
                  required
                />
              </div>
              <button type="submit" className="save-btn">O‘zgartirish</button>
              <button type="button" className="cancel-btn" style={{ marginLeft: 8 }} onClick={() => setShowChangePasswordModal(false)}>Bekor qilish</button>
              {changeMsg && <div style={{ color: changeMsg.includes('muvaffaqiyat') ? 'green' : 'red', marginTop: 8 }}>{changeMsg}</div>}
            </form>
          </div>
        </div>
      )}

      <div className="admin-controls">
        <button 
          className="add-btn-admin"
          onClick={() => setShowAddForm(true)}
        >
          ➕ Yangi taom qo'shish
        </button>
      </div>

      {showAddForm && (
        <AddItemForm 
          onAdd={addMenuItem} 
          onCancel={() => setShowAddForm(false)}
          categories={categories}
          categoryNames={categoryNames}
        />
      )}

      {editingItem && (
        <EditItemForm 
          item={editingItem}
          onUpdate={updateMenuItem}
          onCancel={() => setEditingItem(null)}
          categories={categories}
          categoryNames={categoryNames}
        />
      )}

      <div className="menu-items-admin">
        <h2>Menu elementlari ({menuItems.length})</h2>
        {menuItems.map(item => (
          <div key={item.id} className="menu-item-admin">
            <div className="item-info-admin">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="item-details">
                <span className="price-admin">{item.price.toLocaleString()} so'm</span>
                <span className="category-admin">{categoryNames[item.category]}</span>
                <span className="rating-admin">⭐ {item.rating}</span>
                {item.spiceLevel > 0 && (
                  <span className="spice-admin">🌶️ {item.spiceLevel}</span>
                )}
                {item.popular && <span className="popular-admin">🔥 Mashhur</span>}
              </div>
            </div>
            <div className="item-actions">
              <button 
                className="edit-btn"
                onClick={() => setEditingItem(item)}
              >
                ✏️ Tahrirlash
              </button>
              <button 
                className="delete-btn"
                onClick={() => deleteMenuItem(item.id)}
              >
                🗑️ O'chirish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddItemForm({ onAdd, onCancel, categories, categoryNames }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'milliy',
    rating: '4.5',
    spiceLevel: '0',
    popular: 'false'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <h3>Yangi taom qo'shish</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nomi:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Tavsif:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Narxi (so'm):</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Kategoriya:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{categoryNames[cat]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Baho:</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Achchiqlik darajasi:</label>
              <select
                value={formData.spiceLevel}
                onChange={(e) => setFormData({...formData, spiceLevel: e.target.value})}
              >
                <option value="0">Achchiq emas</option>
                <option value="1">O'rtacha</option>
                <option value="2">Achchiq</option>
                <option value="3">Juda achchiq</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.popular === 'true'}
                onChange={(e) => setFormData({...formData, popular: e.target.checked.toString()})}
              />
              Mashhur taom
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">💾 Saqlash</button>
            <button type="button" className="cancel-btn" onClick={onCancel}>❌ Bekor qilish</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditItemForm({ item, onUpdate, onCancel, categories, categoryNames }) {
  const [formData, setFormData] = useState({
    ...item,
    popular: item.popular.toString()
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedItem = {
      ...formData,
      rating: parseFloat(formData.rating),
      price: parseInt(formData.price),
      spiceLevel: parseInt(formData.spiceLevel),
      popular: formData.popular === 'true'
    };
    onUpdate(updatedItem);
  };

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <h3>Taomni tahrirlash</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nomi:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Tavsif:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Narxi (so'm):</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Kategoriya:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{categoryNames[cat]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Baho:</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Achchiqlik darajasi:</label>
              <select
                value={formData.spiceLevel}
                onChange={(e) => setFormData({...formData, spiceLevel: e.target.value})}
              >
                <option value="0">Achchiq emas</option>
                <option value="1">O'rtacha</option>
                <option value="2">Achchiq</option>
                <option value="3">Juda achchiq</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.popular === 'true'}
                onChange={(e) => setFormData({...formData, popular: e.target.checked.toString()})}
              />
              Mashhur taom
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">💾 Saqlash</button>
            <button type="button" className="cancel-btn" onClick={onCancel}>❌ Bekor qilish</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel; 