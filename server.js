/**
 * Digitaltechnik Lernprogramm - Server
 * =====================================
 * Optimiert für Railway Deployment
 * 
 * Railway Features:
 * - Automatische PORT-Erkennung
 * - Health-Check Endpoint
 * - Automatisches HTTPS
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const app = express();

// Railway setzt PORT automatisch
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Statische Dateien
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// E-Mail Konfiguration
// ============================================
const EMAIL_CONFIG = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
};

const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'modic@akademie.bpi.ac.at';

let transporter = null;

async function initializeMailer() {
    if (!EMAIL_CONFIG.host || !EMAIL_CONFIG.auth.user) {
        console.log('⚠️  E-Mail nicht konfiguriert (optional)');
        console.log('   Setzen Sie SMTP_HOST, SMTP_USER, SMTP_PASS in Railway Variables');
        return;
    }
    
    try {
        transporter = nodemailer.createTransport(EMAIL_CONFIG);
        await transporter.verify();
        console.log('✅ E-Mail-Versand aktiviert');
    } catch (error) {
        console.error('❌ E-Mail-Konfigurationsfehler:', error.message);
        transporter = null;
    }
}

// ============================================
// PDF Zertifikat Generierung
// ============================================
function generateCertificatePDF(data) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ 
                layout: 'landscape', 
                size: 'A4', 
                margin: 50,
                info: {
                    Title: `Zertifikat - ${data.studentName}`,
                    Author: 'BPI Mödling - GINF'
                }
            });
            
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            
            const pageWidth = doc.page.width;
            
            // Dekorativer Rahmen
            doc.strokeColor('#6366f1').lineWidth(3);
            doc.rect(30, 30, pageWidth - 60, doc.page.height - 60).stroke();
            doc.strokeColor('#10b981').lineWidth(1);
            doc.rect(40, 40, pageWidth - 80, doc.page.height - 80).stroke();
            
            // Titel
            doc.fillColor('#6366f1').font('Helvetica-Bold').fontSize(36)
               .text('ZERTIFIKAT', 0, 70, { align: 'center', width: pageWidth });
            
            doc.fillColor('#666666').font('Helvetica').fontSize(14)
               .text('Dieses Zertifikat wird verliehen an', 0, 120, { align: 'center', width: pageWidth });
            
            // Name
            doc.fillColor('#1e1e1e').font('Helvetica-Bold').fontSize(32)
               .text(data.studentName, 0, 150, { align: 'center', width: pageWidth });
            
            // Linie unter Name
            const centerX = pageWidth / 2;
            doc.strokeColor('#10b981').lineWidth(2);
            doc.moveTo(centerX - 120, 190).lineTo(centerX + 120, 190).stroke();
            
            // Kurs Info
            doc.fillColor('#666666').font('Helvetica').fontSize(12)
               .text('für die erfolgreiche Teilnahme am', 0, 210, { align: 'center', width: pageWidth });
            
            doc.fillColor('#6366f1').font('Helvetica-Bold').fontSize(20)
               .text('Digitaltechnik Lernprogramm', 0, 235, { align: 'center', width: pageWidth });
            
            doc.fillColor('#666666').font('Helvetica').fontSize(14)
               .text('Grundlagen der Informatik (GINF)', 0, 262, { align: 'center', width: pageWidth });
            
            // Kapitel-Ergebnisse Box
            if (data.chapterResults && data.chapterResults.length > 0) {
                const boxY = 295;
                const boxWidth = pageWidth - 140;
                const boxX = 70;
                
                doc.fillColor('#f8fafc').rect(boxX, boxY, boxWidth, 55).fill();
                doc.strokeColor('#e2e8f0').lineWidth(0.5).rect(boxX, boxY, boxWidth, 55).stroke();
                
                doc.fillColor('#666666').font('Helvetica').fontSize(9)
                   .text('KAPITEL-ERGEBNISSE', boxX, boxY + 8, { align: 'center', width: boxWidth });
                
                const colWidth = boxWidth / (data.chapterResults.length + 1);
                
                data.chapterResults.forEach((chapter, idx) => {
                    const x = boxX + (idx * colWidth) + 10;
                    const shortName = chapter.name.length > 10 ? chapter.name.substring(0, 10) + '.' : chapter.name;
                    
                    doc.fillColor('#888888').font('Helvetica').fontSize(7)
                       .text(shortName, x, boxY + 22, { width: colWidth - 15 });
                    
                    const scoreColor = chapter.score !== null ? (chapter.score >= 60 ? '#22c55e' : '#ef4444') : '#999999';
                    doc.fillColor(scoreColor).font('Helvetica-Bold').fontSize(11)
                       .text(chapter.score !== null ? chapter.score + '%' : '—', x, boxY + 35, { width: colWidth - 15 });
                });
                
                // Abschlusstest in der Box
                const finalX = boxX + (data.chapterResults.length * colWidth) + 10;
                doc.fillColor('#6366f1').font('Helvetica-Bold').fontSize(7)
                   .text('ABSCHLUSS', finalX, boxY + 22);
                doc.fillColor('#10b981').fontSize(14)
                   .text(data.finalScore + '%', finalX, boxY + 33);
            }
            
            // Ergebnis-Highlight
            const resultY = 365;
            doc.fillColor('#eff6ff').roundedRect(centerX - 100, resultY, 200, 45, 8).fill();
            doc.strokeColor('#6366f1').lineWidth(1).roundedRect(centerX - 100, resultY, 200, 45, 8).stroke();
            
            doc.fillColor('#10b981').font('Helvetica-Bold').fontSize(18)
               .text(`Bestanden: ${data.finalScore}%`, 0, resultY + 10, { align: 'center', width: pageWidth });
            
            doc.fillColor('#666666').font('Helvetica').fontSize(10)
               .text(`${data.correctAnswers} von ${data.totalQuestions} Fragen richtig`, 0, resultY + 30, { align: 'center', width: pageWidth });
            
            // Datum und Institution
            const dateStr = new Date().toLocaleDateString('de-AT', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
            
            doc.fillColor('#666666').font('Helvetica').fontSize(11)
               .text(`Ausgestellt am ${dateStr}`, 0, resultY + 65, { align: 'center', width: pageWidth });
            
            doc.font('Helvetica-Bold').fontSize(12)
               .text('BPI Mödling', 0, resultY + 85, { align: 'center', width: pageWidth });
            
            doc.font('Helvetica').fontSize(10).fillColor('#888888')
               .text('Grundlagen der Informatik', 0, resultY + 100, { align: 'center', width: pageWidth });
            
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

// ============================================
// API Endpunkte
// ============================================

// Health Check (wichtig für Railway)
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        emailConfigured: transporter !== null,
        environment: process.env.RAILWAY_ENVIRONMENT || 'local'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        emailConfigured: transporter !== null,
        version: '1.0.0'
    });
});

// Zertifikat senden
app.post('/api/send-certificate', async (req, res) => {
    try {
        const { studentName, finalScore, correctAnswers, totalQuestions, chapterResults } = req.body;
        
        // Validierung
        if (!studentName || studentName.trim().length < 2) {
            return res.status(400).json({ error: 'Ungültiger Studentenname' });
        }
        
        if (finalScore < 60) {
            return res.status(400).json({ error: 'Mindestens 60% erforderlich' });
        }
        
        console.log(`📝 Zertifikat erstellen: ${studentName} (${finalScore}%)`);
        
        // PDF generieren
        const pdfBuffer = await generateCertificatePDF({
            studentName: studentName.trim(),
            finalScore,
            correctAnswers,
            totalQuestions,
            chapterResults: chapterResults || []
        });
        
        console.log(`✅ PDF erstellt (${Math.round(pdfBuffer.length / 1024)} KB)`);
        
        // E-Mail senden falls konfiguriert
        if (transporter) {
            let kapitelText = '';
            if (chapterResults && chapterResults.length > 0) {
                chapterResults.forEach(ch => {
                    const status = ch.score !== null ? (ch.score >= 60 ? '✓' : '✗') : '-';
                    kapitelText += `  ${status} ${ch.name}: ${ch.score !== null ? ch.score + '%' : 'nicht absolviert'}\n`;
                });
            }
            
            const completedChapters = (chapterResults || []).filter(ch => ch.score !== null);
            const avgScore = completedChapters.length > 0 
                ? Math.round(completedChapters.reduce((sum, ch) => sum + ch.score, 0) / completedChapters.length)
                : 0;
            
            await transporter.sendMail({
                from: EMAIL_CONFIG.auth.user,
                to: RECIPIENT_EMAIL,
                subject: `Zertifikat Digitaltechnik - ${studentName}`,
                text: `
══════════════════════════════════════════════════════════════
                    ZERTIFIKAT-EINREICHUNG
══════════════════════════════════════════════════════════════

TEILNEHMER
────────────────────────────────────────────────────────────────
Name: ${studentName}
Datum: ${new Date().toLocaleDateString('de-AT')}
Uhrzeit: ${new Date().toLocaleTimeString('de-AT')}

KAPITEL-ERGEBNISSE
────────────────────────────────────────────────────────────────
${kapitelText || '  (Keine Daten)\n'}
  Durchschnitt: ${avgScore}%

ABSCHLUSSTEST
────────────────────────────────────────────────────────────────
  Ergebnis: ${finalScore}%
  Richtige Antworten: ${correctAnswers} von ${totalQuestions}
  Status: BESTANDEN ✓

══════════════════════════════════════════════════════════════

Automatisch generiert - BPI Mödling GINF
                `,
                attachments: [{
                    filename: `Zertifikat_${studentName.replace(/\s+/g, '_')}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }]
            });
            
            console.log(`📧 E-Mail gesendet an: ${RECIPIENT_EMAIL}`);
            
            res.json({ 
                success: true, 
                message: `Zertifikat erfolgreich an ${RECIPIENT_EMAIL} gesendet!`
            });
        } else {
            // Kein E-Mail konfiguriert - PDF als Base64 zurückgeben
            res.json({
                success: true,
                message: 'Zertifikat erstellt (E-Mail-Versand nicht konfiguriert)',
                pdf: pdfBuffer.toString('base64'),
                emailConfigured: false
            });
        }
        
    } catch (error) {
        console.error('❌ Fehler:', error);
        res.status(500).json({ error: 'Serverfehler', details: error.message });
    }
});

// PDF generieren (ohne E-Mail)
app.post('/api/generate-pdf', async (req, res) => {
    try {
        const { studentName, finalScore, correctAnswers, totalQuestions, chapterResults } = req.body;
        
        const pdfBuffer = await generateCertificatePDF({
            studentName: (studentName || 'Teilnehmer').trim(),
            finalScore: finalScore || 0,
            correctAnswers: correctAnswers || 0,
            totalQuestions: totalQuestions || 0,
            chapterResults: chapterResults || []
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Zertifikat_${(studentName || 'Teilnehmer').replace(/\s+/g, '_')}.pdf"`);
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('PDF-Fehler:', error);
        res.status(500).json({ error: 'PDF-Generierung fehlgeschlagen' });
    }
});

// E-Mail Test
app.get('/api/test-email', async (req, res) => {
    if (!transporter) {
        return res.json({ 
            success: false, 
            message: 'E-Mail nicht konfiguriert',
            hint: 'Setzen Sie SMTP_HOST, SMTP_USER, SMTP_PASS in Railway Variables'
        });
    }
    
    try {
        await transporter.verify();
        res.json({ success: true, message: 'E-Mail-Konfiguration OK', recipient: RECIPIENT_EMAIL });
    } catch (error) {
        res.json({ success: false, message: 'E-Mail-Fehler', error: error.message });
    }
});

// Hauptseite - Lernprogramm ausliefern
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback für SPA
app.get('*', (req, res) => {
    // API-Routen nicht abfangen
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint nicht gefunden' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// Server starten
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║     🚀 Digitaltechnik Lernprogramm - Server                   ║
╠═══════════════════════════════════════════════════════════════╣
║  Port: ${String(PORT).padEnd(54)}║
║  Environment: ${(process.env.RAILWAY_ENVIRONMENT || 'local').padEnd(46)}║
║                                                               ║
║  Endpoints:                                                   ║
║  • GET  /              → Lernprogramm                         ║
║  • GET  /health        → Health Check                         ║
║  • POST /api/send-certificate → Zertifikat senden             ║
║  • POST /api/generate-pdf     → PDF erstellen                 ║
║  • GET  /api/test-email       → E-Mail testen                 ║
╚═══════════════════════════════════════════════════════════════╝
    `);
    
    initializeMailer();
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM empfangen - Server wird beendet...');
    process.exit(0);
});

module.exports = app;
