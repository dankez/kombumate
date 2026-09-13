# 🍃 Kombucha Hub – Osobný Kombucha Asistent

**Kombucha Hub** je moderná webová aplikácia navrhnutá pre nadšencov domácej výroby kombuchy, ktorí pracujú s nádobami s objemom **3 až 4 litre**. Pomáha sledovať primárnu aj sekundárnu fermentáciu, plánovať degustácie a kontroly, správne prepočítavať suroviny a automaticky zbierať dáta z IoT senzorov (Raspberry Pi / ESP32).

---

## 🚀 Hlavné Funkcie

- **Fermentačný Engine:** Sledovanie stavov váriek (`FIRST_FERMENTATION`, `READY_TO_TASTE`, `OVERDUE_FOR_CHECK`, `SECOND_FERMENTATION`, `READY_TO_CHILL`, `REFRIGERATED`, `COMPLETED`).
- **Interaktívna Kalkulačka Ingrediencií:** Dynamické prepočty pre 1L, 2L, 3L, 3.5L, 4L aj vlastný objem s prepočtom na gramy, mililitre a kuchynské jednotky (lyžičky, polievkové lyžice, hrnčeky).
- **Ochucovanie a Druhá Fermentácia (2F):** Kalkulačka ovocia, štiav a dodatočného cukru s bezpečnostnými upozorneniami na tlak vo fľašiach.
- **Upozornenia a Degustačné Pripomienky:** Lokálne aj prehliadačové notifikácie o potrebe ochutnania alebo kontroly CO₂.
- **SCOBY Hotel:** Inventár a evidencia zdravia materských kultúr, odpočet kŕmenia čajom a sledovanie acidity.
- **Raspberry Pi IoT API (`/api/pi/measurements`):** REST API pre pripojenie teplotných snímačov (DS18B20) a pH metrov s bezpečnými API kľúčmi.
- **Botanický Dizajn & Slovenčina:** Vizuálny štýl prispôsobený prírodným a čajovým tónom v slovenskom jazyku.

---

## 🛠️ Architektúra a Štek

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS (Botanical Palette - lesná zelená, jantárová, plátno)
- **Databáza & Autentifikácia:** Supabase (PostgreSQL + Google OAuth 2.0 s lokálnym fallbackom pre offline demo)
- **Testovanie:** Jest (Unit testy pre fermentačný engine a kalkulačku)

---

## 📂 Prieskum Open-Source Projektov (`TECHNICAL_REPORT.md`)

Pred začiatkom vývoja bol vykonaný technický prieskum dostupných open-source riešení:
1. **Kefir Control** (Flutter/Dart, AGPLv3) – Použitý ako inšpirácia pre UX kalendára a časovej osi.
2. **AutoBooch** (Python/Cron, No License) – Použitý ako referenčný vzor pre IoT zapojenie snímača DS18B20 na GPIO4 a 30-minútovú samplovaciu periódu pre 3-4L nádoby.

Podrobná správa a rozhodovacia tabuľka sa nachádza v súbore [`TECHNICAL_REPORT.md`](./TECHNICAL_REPORT.md).

---

## 💻 Spustenie Projektu

1. Inštalácia závislostí: `npm install`
2. Spustenie vývojového servera: `npm run dev &`
3. Spustenie unit testov: `npm test`
4. Príprava produkčného buildu: `npm run build`

---

## 🔌 API Rozhranie pre Raspberry Pi (IoT)

Senzory môžu odosielať namerané údaje cez HTTP POST na endpoint `/api/pi/measurements`:

```bash
curl -X POST http://localhost:3000/api/pi/measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PI_API_KEY" \
  -d '{
    "deviceId": "rpi-booch-01",
    "batchId": "kb-active-1",
    "temperature": 24.2,
    "ph": 3.1
  }'
```

---

## 📜 Licencia & Podmienky

Projekt Kombucha Hub bol vyvinutý ako nezávislá aplikácia. Nápady z externých projektov boli použité výhradne v rozsahu všeobecnej inšpirácie v súlade s licenčnými podmienkami.
