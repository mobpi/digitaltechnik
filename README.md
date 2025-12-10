# 🔌 Digitaltechnik Lernprogramm

Interaktives Lernprogramm für Digitaltechnik im Rahmen des GINF-Unterrichts (Grundlagen der Informatik).

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 📚 **7 interaktive Lektionen** zu Logikgattern und digitalen Schaltungen
- 🎮 **Interaktive Simulatoren** mit aktiven Leitungen
- 📝 **Quizze** mit zufälliger Fragen- und Antwort-Reihenfolge
- 🏆 **Abschlusstest** mit PDF-Zertifikat
- 📧 **E-Mail-Versand** der Ergebnisse (optional)
- 📱 **Responsive Design** für alle Geräte

## 🚀 Schnellstart

### Lokal ausführen

```bash
# Repository klonen
git clone https://github.com/IHR-USERNAME/digitaltechnik-lernprogramm.git
cd digitaltechnik-lernprogramm

# Dependencies installieren
npm install

# Server starten
npm start
```

Öffnen Sie http://localhost:3000 im Browser.

---

## 🚂 Railway Deployment

### Schritt 1: GitHub Repository erstellen

1. Erstellen Sie ein neues Repository auf [GitHub](https://github.com/new)
2. Pushen Sie den Code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/IHR-USERNAME/digitaltechnik-lernprogramm.git
git push -u origin main
```

### Schritt 2: Railway Projekt erstellen

1. Gehen Sie zu [railway.app](https://railway.app)
2. Klicken Sie **"Start a New Project"**
3. Wählen Sie **"Deploy from GitHub repo"**
4. Autorisieren Sie Railway für Ihr GitHub-Konto
5. Wählen Sie das Repository **"digitaltechnik-lernprogramm"**
6. Railway erkennt automatisch Node.js und startet das Deployment

### Schritt 3: Domain generieren

1. Im Railway Dashboard: Klicken Sie auf Ihr Projekt
2. Gehen Sie zu **"Settings"** → **"Networking"**
3. Klicken Sie **"Generate Domain"**
4. Ihre App ist jetzt unter `https://xxx.up.railway.app` erreichbar

### Schritt 4: E-Mail konfigurieren (optional)

1. Im Railway Dashboard: **"Variables"** Tab
2. Fügen Sie folgende Variablen hinzu:

| Variable | Wert |
|----------|------|
| `SMTP_HOST` | `smtp.office365.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `ihre-email@domain.at` |
| `SMTP_PASS` | `ihr-passwort` |
| `RECIPIENT_EMAIL` | `modic@akademie.bpi.ac.at` |

3. Railway startet automatisch neu

---

## 📁 Projektstruktur

```
digitaltechnik-lernprogramm/
├── server.js           # Express Server
├── package.json        # Node.js Konfiguration
├── .gitignore          # Git Ignore Regeln
├── .env.example        # Beispiel Umgebungsvariablen
├── README.md           # Diese Datei
└── public/
    └── index.html      # Lernprogramm (Single Page App)
```

---

## 🔧 API Endpunkte

| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| GET | `/` | Lernprogramm |
| GET | `/health` | Health Check |
| GET | `/api/health` | API Status |
| POST | `/api/send-certificate` | Zertifikat per E-Mail senden |
| POST | `/api/generate-pdf` | PDF herunterladen |
| GET | `/api/test-email` | E-Mail-Konfiguration testen |

---

## 📧 E-Mail Provider Konfiguration

### Office 365 / Microsoft 365

```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=benutzer@organisation.at
SMTP_PASS=passwort
```

### Gmail

⚠️ Erfordert App-Passwort (2FA muss aktiviert sein)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ihre-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
```

[App-Passwort erstellen](https://myaccount.google.com/apppasswords)

### GMX

```
SMTP_HOST=mail.gmx.net
SMTP_PORT=587
SMTP_SECURE=false
```

---

## 📚 Lernmodule

1. **Einführung** - Was ist Digitaltechnik?
2. **Basis-Gatter** - AND, OR, NOT
3. **Erweiterte Gatter** - NAND, NOR, XOR
4. **Wahrheitstabellen** - Systematische Analyse
5. **Kombinierte Schaltungen** - Mehrere Gatter
6. **Addierer** - Halbaddierer, Volladdierer
7. **Komplexe Schaltungen** - Sicherheitsschaltung, De Morgan
8. **Abschlusstest** - 12 Fragen, Zertifikat bei ≥60%

---

## 🛠️ Entwicklung

```bash
# Mit automatischem Neuladen (nodemon erforderlich)
npm install -g nodemon
nodemon server.js
```

---

## 📄 Lizenz

MIT License - BPI Mödling, GINF

---

## 🙏 Credits

Entwickelt für den GINF-Unterricht am BPI Mödling.
