# TECHNICKÁ SPRÁVA: PRIESKUM EXISTUJÚCICH OPEN-SOURCE RIEŠENÍ

Tento dokument obsahuje technickú analýzu dvoch významných open-source projektov z oblasti domácej fermentácie a IoT monitorovania. Prieskum bol vykonaný pred začiatkom vývoja portálu **Kombucha Hub**.

---

## 1. DETAILNÁ ANALÝZA PROJEKTOV

### 1.1 Kefir Control
* **URL repozitára:** https://github.com/raulmoralesruiz/kefir-control
* **Programovací jazyk:** Dart
* **Framework / Tech Stack:** Flutter (Android, iOS, Web, Linux, macOS, Windows)
* **Databáza / Ukladanie údajov:** Lokálne úložisko pomocou Flutter Provider a local storage / shared preferences
* **Licencia:** GNU Affero General Public License v3.0 (`AGPL-3.0-or-later`)
* **Aktuálny stav projektu:** Aktívny (verzia 2.3.0, pravidelné aktualizácie, podporuje i18n v EN, ES, RU, AND)
* **Kľúčové funkcie:**
  - Sledovanie trvania fermentácie s vizuálnym kruhovým indicatorom pokroku.
  - Kalendárový pohľad s vyznačenými fermentačnými dňami.
  - História ukončených fermentácií.
  - Lokálne upozornenia (Mobile Push / Local notifications).
  - Informačný sprievodca pre rôzne druhy fermentovaných potravín (kefír, kombucha, kvások, kimchi).
  - Prispôsobenie trvania fermentácie a upozornení.
* **Použiteľné funkcie pre Kombucha Hub:**
  - Architektúra stavového modelu fermentácie (sledovanie fázy a odhadovaného času dokončenia).
  - Logika vizualizácie pokroku (zobrazenie zostávajúcich dní/hodín).
  - Koncept časovej osi a kalendára pre kontrolné body.
* **Možné problémy a obmedzenia:**
  - Vývoj v Dart/Flutter nie je priamo prenosný do webového Next.js/React ekosystému.
  - Silná licencia AGPL-3.0 vyžaduje zverejnenie zdrojového kódu pri akejkoľvek sieťovej modifikácii.
* **Odporúčanie:** **Použiť výhradne ako inšpiračný zdroj pre UX/UI, stavovú logiku a plánovanie kontrol.** Nekopírovať žiadny zdrojový kód z dôvodu rozdielneho stacku (Dart vs TypeScript) a licenčných obmedzení.

---

### 1.2 AutoBooch
* **URL repozitára:** https://github.com/RaInta/AutoBooch
* **Programovací jazyk:** Python 3, Jupyter Notebook
* **Framework / Tech Stack:** Cron, Linux Kernel w1-gpio / w1-therm moduly, RPi.GPIO
* **Databáza / Ukladanie údajov:** Textové súbory (`brew_log.txt`, `brew_log_updated.txt`, `heating_pad_state.txt`)
* **Licencia:** Žiadna licencia (No License - autorské práva sú vyhradené autorovi)
* **Aktuálny stav projektu:** Neaktívny / Archívny (posledný commit október 2018)
* **Kľúčové funkcie:**
  - Automatické meranie teploty kombuchy pomocou vodotesného snímača DS18B20 pripojeného na GPIO4 Raspberry Pi.
  - Spínanie ohrevnej podložky cez releový modul (GPIO17) pri poklese teploty.
  - Pravidelné spúšťanie cez Linux Cron v 30-minútových intervaloch (vzhľadom na tepelnú zotrvačnosť 3-4 litrov tekutiny).
  - Expost analýza nameraných dát v Jupyter Notebooku s grafickým znázornením teplotných výkyvov.
* **Použiteľné funkcie pre Kombucha Hub:**
  - Hardware architektúra IoT modulu (snímač DS18B20, 30-minútový samplovací interval pre domáce 3-4L nádoby).
  - Logika spínania ohrevu s hysterezou (ochrana SCOBY pred prehriatím alebo podchladením).
* **Možné problémy a obmedzenia:**
  - Chýbajúca licencia (kód nie je možné voľne re-distribuovať ani začleniť).
  - Zastarané textové logovanie bez REST API alebo databázového spojenia.
* **Odporúčanie:** **Použiť výhradne ako referenciu pre IoT zapojenie Raspberry Pi, výber senzorov a periodicitu samplovania.** Vybudovať vlastné REST API rozhranie v Kombucha Hub pre prijímanie JSON dát zo snímačov.

---

## 2. ROZHODNOVACIA TABUĽKA VYUŽITIA KÓDU

| Projekt | Čo sa oplatí použiť | Čo nepoužiť | Licencia | Rozhodnutie |
| :--- | :--- | :--- | :--- | :--- |
| **Kefir Control** | - UX koncept kalendára a kontrolných bodov<br>- Stavový model (čakanie, prebieha, na stočenie)<br>- Štruktúra sprievodcu fermentáciou | - Zdrojový kód v Dart/Flutter<br>- Lokálne Flutter ukladanie<br>- Mobilný layout | AGPL-3.0 | **1. Použiť iba nápady a inšpiráciu** |
| **AutoBooch** | - Koncept merania teploty snímačom DS18B20<br>- 30-minútový interval vzorkovania pre 3-4L nádoby<br>- Logika riadenia ohrevnej podložky | - Python skripty a Cron zápisy<br>- Ukladanie do flat-file `.txt`<br>- Chýbajúce webové API | Bez licencie (No License) | **1. Použiť iba nápady a inšpiráciu** |

---

## 3. ZÁVER A NÁVRH ARCHITEKTÚRY KOMBUCHA HUB

Na základe vykonaného prieskumu boli prijaté nasledujúce rozhodnutia pre **Kombucha Hub**:

1. **Vlastná implementácia na modernom stacku:**
   - **Framework:** Next.js (React + TypeScript + Tailwind CSS).
   - **Databáza & Auth:** Supabase (PostgreSQL, Row Level Security, Google OAuth 2.0).
   - **Jazyk:** Slovenčina.

2. **Fermentačný engine:**
   - Implementujeme robustný stavový stroj podporujúci **1. fermentáciu (1F)** aj **2. fermentáciu (2F)** s príchuťami, fľaškovaním a bezpečnosťou (tlak vo fľašiach).
   - Každá zmena stavu je logovaná s časovou pečiatkou, meraniami (pH, teplota) a ochutnávkovými poznámkami.

3. **Plánovač a Upozornenia:**
   - Použijeme Web Notifications API a Push službu s odkladom (Snooze), pripomienkami kontrol a ochutnávok.

4. **Kalkulačka a Recepty:**
   - Dynamický výpočet ingrediencií pre 1L, 2L, 3L, 3.5L, 4L aj vlastné objemy, prepočet medzi gramami, mililitrami a kuchynskými jednotkami.

5. **Raspberry Pi IoT API:**
   - Vytvoríme samostatný bezpečný REST API endpoint `/api/pi/measurements`, ktorý umožní pripojenie Raspberry Pi alebo ESP32 s API kľúčom na automatické zaznamenávanie teploty a pH.
