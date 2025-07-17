# 🚀 Choyxona Menu - O'rnatish ko'rsatmalari

## 📋 Talablar

Loyihani ishga tushirish uchun quyidagi dasturlar o'rnatilgan bo'lishi kerak:

### 1. Node.js o'rnatish

**Windows uchun:**
1. [Node.js rasmiy saytiga](https://nodejs.org/) o'ting
2. LTS versiyasini yuklab oling
3. O'rnatish faylini ishga tushiring
4. Barcha standart sozlamalarni qoldiring
5. O'rnatish tugagandan so'ng kompyuterni qayta ishga tushiring

**Tekshirish:**
```bash
node --version
npm --version
```

### 2. Git o'rnatish (ixtiyoriy)

**Windows uchun:**
1. [Git rasmiy saytiga](https://git-scm.com/) o'ting
2. Windows uchun Git yuklab oling
3. O'rnatish jarayonida standart sozlamalarni qoldiring

## 📦 Loyihani o'rnatish

### 1. Loyihani yuklab olish

```bash
# Agar Git o'rnatilgan bo'lsa:
git clone <repository-url>
cd choyxona-menu

# Yoki fayllarni to'g'ridan-to'g'ri yuklab oling
```

### 2. Kerakli paketlarni o'rnatish

```bash
npm install
```

### 3. Loyihani ishga tushirish

```bash
npm start
```

Brauzer avtomatik ravishda `http://localhost:3000` manzilida ochiladi.

## 🌐 Production ga deploy qilish

### 1. Build yaratish

```bash
npm run build
```

### 2. Deploy platformalari

**Netlify:**
1. [Netlify](https://netlify.com/) ga ro'yxatdan o'ting
2. "New site from Git" ni tanlang
3. GitHub repository ni ulang
4. Build command: `npm run build`
5. Publish directory: `build`

**Vercel:**
1. [Vercel](https://vercel.com/) ga ro'yxatdan o'ting
2. "New Project" ni tanlang
3. GitHub repository ni ulang
4. Framework preset: Create React App
5. Deploy qiling

**GitHub Pages:**
1. `package.json` ga qo'shing:
```json
{
  "homepage": "https://yourusername.github.io/repository-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

2. Deploy qiling:
```bash
npm install --save-dev gh-pages
npm run deploy
```

## 🔧 Sozlash

### Menu ma'lumotlarini o'zgartirish

`src/data/menuData.js` faylini tahrirlang:

```javascript
export const menuData = [
  {
    id: 1,
    name: "Yangi taom",
    description: "Taom tavsifi",
    price: 15000,
    category: "milliy",
    rating: 4.5,
    spiceLevel: 1,
    popular: false
  }
  // ...
];
```

### Kategoriyalarni o'zgartirish

`src/components/CategoryList.js` faylida:

```javascript
const categoryIcons = {
  'yangi_kategoriya': '🍽️'
};

const categoryNames = {
  'yangi_kategoriya': 'Yangi kategoriya'
};
```

### Ranglarni o'zgartirish

`src/index.css` va komponentlarda ranglarni o'zgartiring:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #ff6b6b;
}
```

## 📱 QR Kod yaratish

1. `qr-generator.html` faylini brauzerda oching
2. Menu URL manzilini kiriting
3. QR kodni yarating va yuklab oling
4. Chop etib, choyxonada joylashtiring

## 🐛 Xatoliklarni tuzatish

### "npm install" xatosi

```bash
# Node.js versiyasini tekshiring
node --version

# npm cache ni tozalang
npm cache clean --force

# package-lock.json ni o'chirib qayta o'rnating
rm package-lock.json
npm install
```

### "npm start" xatosi

```bash
# Port 3000 band bo'lsa
# package.json da o'zgartiring:
"scripts": {
  "start": "PORT=3001 react-scripts start"
}
```

### Brauzer xatolari

1. Developer Tools oching (F12)
2. Console tab ni tekshiring
3. Xatolik xabarini o'qing va tuzating

## 📞 Yordam

Agar muammolar yuzaga kelsa:

1. README.md faylini o'qing
2. GitHub Issues da qidiring
3. Stack Overflow da savol bering
4. Developer bilan bog'laning

## 🔄 Yangilanishlar

Loyihani yangilash uchun:

```bash
# Yangi versiyani yuklab oling
git pull origin main

# Paketlarni yangilang
npm install

# Loyihani qayta ishga tushiring
npm start
```

## 📊 Monitoring

Loyihani kuzatish uchun:

1. Google Analytics qo'shing
2. Error tracking (Sentry) o'rnating
3. Performance monitoring qo'shing
4. User feedback tizimi yarating 