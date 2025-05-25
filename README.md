# Cloud_Native_Engineering_Groep7

Dit is het project van groep 7 voor het vak **Cloud Native Engineering**.

## 🔗 Inzending Eindproject
De uploadzone voor het eindproject is geopend. Je hoeft enkel een **link naar dit GitHub-project** te plaatsen onder "Assignments" op Toledo. Zorg ervoor dat je deze README goed volgt om het project lokaal uit te voeren.

---

## ⚙️ Installatie-instructies

Volg onderstaande stappen om het project lokaal uit te voeren.

### 📁 1. Clone deze repository

```bash
git clone https://github.com/ArthurCoget/Cloud_Native_Engineering_Groep7.git
cd Cloud_Native_Engineering_Groep7
```

---

### 🛠️ 2. Configureer de `.env` bestanden

#### Backend `.env`

Maak een `.env` bestand aan in de `back-end/` map met onderstaande inhoud:

```env
DATABASE_URL="postgresql://<Jouw_Gebruikersnaam>:<Jouw_Wachtwoord>@localhost:5432/JBClothing?schema=public"
APP_PORT=3000
JWT_SECRET="b36c0da563ba1e2052abd258ed001d3077878c2c65f445db5af6182957f3ad27="
JWT_EXPIRES_HOURS=8
REDIS_HOST_NAME="cache-groep7.redis.cache.windows.net"
REDIS_ACCESS_KEY="BNZkjXbsiBa3X19KsAVMe8vsfA4WQEGwnAzCaEKNAEU="
```

> ⚠️ Zorg ervoor dat PostgreSQL draait en dat je een database hebt genaamd `JBClothing`.

#### Frontend `.env`

Maak ook een `.env` bestand aan in de `front-end/` map met:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

### 📦 3. Installeer dependencies

Voer deze commando’s uit in zowel de backend als frontend map:

```bash
# In de hoofd map
npm install
# Ga naar backend map
cd back-end
npm install

# Ga naar frontend map
cd ../front-end
npm install
```

---

### 🌱 4. Database migratie en seed uitvoeren

Terug in de `back-end/` folder:

```bash
npx prisma db push
npx ts-node util/seed.ts
```

---

### 🚀 5. Start de applicatie

Gebruik onderstaande commando’s in beide mappen om de applicatie lokaal te draaien:

```bash
# In back-end map
npm start

# In front-end map
npm start
```

---

## 🖥️ Beschikbare URL’s

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3000/api](http://localhost:3000/api)

---

## ✅ Opmerkingen

- Zorg ervoor dat je Node.js (v18+) en PostgreSQL lokaal geïnstalleerd hebt.
- Eventuele foutmeldingen bij het seeden kunnen ontstaan door dubbele reviews (zelfde `productId` + `customerId`); los dit eventueel op door dubbele entries te verwijderen of uniek te maken.

Veel succes!
