# 🚀 Render.com Deployment (Backend)

## 1. GitHub'ga yuklash
1. GitHub repository yarating.
2. Terminalda:
   ```sh
   git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NOMI.git
git push -u origin main
   ```

## 2. Render.com'da yangi Web Service
1. New Web Service → GitHub repo tanlang
2. Environment: Python 3
3. Build Command:
   ```sh
   pip install -r requirements.txt
   ```
4. Start Command:
   ```sh
   gunicorn app:app
   ```
5. Statik va templates papkalari joyida bo'lsin

## 3. Frontend (React) uchun (ixtiyoriy)
Agar React frontendni ham deploy qilmoqchi bo'lsangiz:
- `npm run build` qiling
- `build/` papkasini Flask static papkasiga ko'chiring yoki alohida Netlify/Vercel'da deploy qiling

---

# Choyxona Menu - QR Kod orqali kirish mumkin bo'lgan mobil menu

Bu loyiha choyxona uchun zamonaviy mobil menu tizimi bo'lib, mijozlar QR kod orqali kirib, ovqatlar ro'yxatini ko'rish va buyurtma berish imkoniyatiga ega.

## 🚀 Xususiyatlar

- **QR Kod orqali kirish** - Mijozlar mobil kamera orqali QR kodni skaner qilib menuga kirishadi
- **Kategoriyalar bilan tahlangan** - Ovqatlar kategoriyalar bo'yicha tahlangan
- **Zamonaviy dizayn** - Chiroyli va foydalanuvchi uchun qulay interfeys
- **Savatcha tizimi** - Tanlangan ovqatlarni savatchaga qo'shish va boshqarish
- **Responsive dizayn** - Barcha qurilmalarda yaxshi ko'rinadi
- **Animatsiyalar** - Framer Motion bilan chiroyli animatsiyalar

## 📱 Kategoriyalar

- **Milliy taomlar** - Osh, Lag'mon, Manti, Somsa va boshqalar
- **Fast Food** - Burger, Pizza, Hot Dog, Kartoshka fri
- **Ichimliklar** - Choy, Kofe, Coca Cola, Fanta, Sprite
- **Shirinliklar** - Halva, Baklava, Tort, Muzqaymoq
- **Salatlar** - Achchiq chuchuk, Olivye, Sezar, Grecheskiy
- **Non va pishiriqlar** - Non, Lepyoshka, Katlama, Belyash

## 🛠️ Texnologiyalar

- **React** - Frontend framework
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Animatsiyalar
- **React Icons** - Ikonlar
- **React Router** - Navigatsiya

## 📦 O'rnatish

1. Loyihani klonlang:
```bash
git clone <repository-url>
cd choyxona-menu
```

2. Kerakli paketlarni o'rnating:
```bash
npm install
```

3. Loyihani ishga tushiring:
```bash
npm start
```

4. Brauzerda oching:
```
http://localhost:3000
```

## 🏗️ Loyiha strukturasi

```
src/
├── components/
│   ├── MenuHeader.js      # Menu sarlavhasi
│   ├── CategoryList.js    # Kategoriyalar ro'yxati
│   ├── MenuItem.js        # Alohida ovqat elementi
│   └── Cart.js           # Savatcha komponenti
├── data/
│   └── menuData.js       # Menu ma'lumotlari
├── App.js                # Asosiy komponent
└── index.js              # Kirish nuqtasi
```

## 🎨 Dizayn xususiyatlari

- **Gradient ranglar** - Chiroyli gradient fonlar
- **Karta dizayni** - Har bir ovqat uchun alohida karta
- **Animatsiyalar** - Hover va tap animatsiyalari
- **Responsive** - Mobil va desktop qurilmalarga moslashgan
- **O'zbek tilida** - To'liq o'zbek tilida interfeys

## 📊 Menu ma'lumotlari

Har bir ovqat uchun quyidagi ma'lumotlar saqlanadi:
- Nomi va tavsifi
- Narxi (so'mda)
- Kategoriyasi
- Reytingi (1-5 yulduz)
- Achchiqlik darajasi (0-3 nuqta)
- Mashhurlik belgisi

## 🔧 Sozlash

Menu ma'lumotlarini o'zgartirish uchun `src/data/menuData.js` faylini tahrirlang.

Yangi kategoriya qo'shish uchun:
1. `menuData.js` da yangi kategoriya qo'shing
2. `CategoryList.js` da kategoriya ikonini va nomini qo'shing

## 📱 Mobil optimizatsiya

- Touch-friendly tugmalar
- Swipe navigatsiya
- Responsive dizayn
- Fast loading

## 🚀 Deploy qilish

Loyihani production ga deploy qilish uchun:

```bash
npm run build
```

Build qilingan fayllar `build/` papkasida saqlanadi.

## 📞 Aloqa

Agar savollaringiz bo'lsa yoki yordam kerak bo'lsa, iltimos bog'laning.

## 📄 Litsenziya

Bu loyiha MIT litsenziyasi ostida tarqatiladi. 