// pages/api/accuser-reception/send.js
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Méthode non autorisée" });
  }

  const { id_formulaire } = req.body;

  if (!id_formulaire) {
    return res.status(400).json({ success: false, message: "ID incident manquant" });
  }

  try {
    // 1️⃣ Récupérer l'incident avec les infos de l'utilisateur
    const incident = await prisma.formulaire.findUnique({
      where: { id_formulaire: parseInt(id_formulaire) },
      include: {
        user: true,
        operateur: true
      }
    });

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident non trouvé" });
    }

    // 2️⃣ Vérifier si l'accusé a déjà été envoyé
    if (incident.accuseEnvoye) {
      return res.status(200).json({ 
        success: true, 
        message: "Accusé de réception déjà envoyé",
        alreadySent: true 
      });
    }

    // 3️⃣ Configuration du transporteur Nodemailer pour Office 365
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // true pour le port 465, false pour les autres ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });

    // 4️⃣ Formater les dates
    const formatDate = (date) => {
      if (!date) return "Non définie";
      return new Date(date).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };

    // 5️⃣ Contenu de l'email (HTML détaillé)
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f97316; border-radius: 5px; }
          .label { font-weight: bold; color: #f97316; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .badge { display: inline-block; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .badge-critique { background: #fee2e2; color: #dc2626; }
          .badge-majeur { background: #fef3c7; color: #d97706; }
          .badge-mineur { background: #dbeafe; color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Accusé de Réception</h1>
            <p>Votre incident a été consulté</p>
          </div>
          
          <div class="content">
            <p>Bonjour <strong>${incident.user.nom_user}</strong>,</p>
            
            <p>Nous accusons réception de votre déclaration d'incident. Voici le récapitulatif :</p>
            
            <div class="info-box">
              <p><span class="label">📋 Référence :</span> ${incident.reference || "N/A"}</p>
              <p><span class="label">🏢 Opérateur :</span> ${incident.operateur.nom_operateur}</p>
              <p><span class="label">📌 Intitulé :</span> ${incident.intitule}</p>
              <p><span class="label">📝 Description :</span> ${incident.descriptif}</p>
            </div>
            
            <div class="info-box">
              <p><span class="label">🎯 Type d'incident :</span> 
                <span class="badge ${
                  incident.typeIncident_infrastructure === "CRITIQUE" ? "badge-critique" :
                  incident.typeIncident_infrastructure === "MAJEUR" ? "badge-majeur" : "badge-mineur"
                }">${incident.typeIncident_infrastructure}</span>
              </p>
              <p><span class="label">📍 Zone :</span> ${incident.zone}</p>
              <p><span class="label">🏘️ Localité :</span> ${incident.localite}</p>
              <p><span class="label">🏙️ Communes :</span> ${incident.communes}</p>
            </div>
            
            <div class="info-box">
              <p><span class="label">👥 Abonnés impactés :</span> ${parseInt(incident.abonnesimpactes || 0).toLocaleString()}</p>
              <p><span class="label">🔌 Nœuds touchés :</span> ${incident.noeudsTouches}</p>
              <p><span class="label">💥 Impacts :</span> ${incident.impacts}</p>
              <p><span class="label">🔧 Résolution :</span> ${incident.resolution}</p>
            </div>
            
            <div class="info-box">
              <p><span class="label">📅 Date de notification :</span> ${formatDate(incident.dateNotification)}</p>
              <p><span class="label">⏱️ Date de début :</span> ${formatDate(incident.dateDebut)}</p>
              <p><span class="label">⏱️ Date de fin :</span> ${formatDate(incident.dateFin)}</p>
              <p><span class="label">📊 État :</span> <strong>${incident.etat}</strong></p>
            </div>
            
            ${incident.observation ? `
              <div class="info-box">
                <p><span class="label">📝 Observation :</span> ${incident.observation}</p>
              </div>
            ` : ""}
            
            <p style="margin-top: 30px;">Cet email confirme que votre incident a été pris en compte par notre système.</p>
            
            <p>Cordialement,<br><strong>L'équipe ARTCI</strong></p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} ARTCI - Autorité de Régulation des Télécommunications de Côte d'Ivoire</p>
            <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 6️⃣ Options de l'email
    const mailOptions = {
      from: `"ARTCI - Gestion des Incidents" <${process.env.EMAIL_USER}>`,
      to: incident.user.email,
      subject: `✅ Accusé de réception - Incident ${incident.reference || incident.id_formulaire}`,
      html: emailHTML,
    };

    // 7️⃣ Envoi de l'email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${incident.user.email}`);

    // 8️⃣ Mettre à jour le champ accuseEnvoye dans la base de données
    await prisma.formulaire.update({
      where: { id_formulaire: parseInt(id_formulaire) },
      data: { accuseEnvoye: true }
    });

    return res.status(200).json({ 
      success: true, 
      message: "Accusé de réception envoyé avec succès",
      emailSent: true 
    });

  } catch (error) {
    console.error("❌ Erreur envoi email:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'envoi de l'email",
      error: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}