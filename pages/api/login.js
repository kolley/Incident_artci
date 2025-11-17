// pages/api/login.js
import prisma from "../../service/config/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { setCookie } from "cookies-next";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { email, password } = req.body;

  try {
    // ✅ Récupérer l'utilisateur avec son profil
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        nom_profil: {
          select: {
            id_Profil: true,
            nom_profil: true,
            description: true
          }
        }
      }
    });

    if (!user) {
      console.log("❌ Utilisateur non trouvé:", email);
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    console.log("🔍 Vérification du mot de passe pour:", email);
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log("❌ Mot de passe incorrect");
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    console.log("✅ Authentification réussie pour:", email);

    // 🔐 Création du token avec TOUS les champs nécessaires
    const token = jwt.sign(
      { 
        id_user: user.id_user,        // ✅ IMPORTANT : id_user (pas "id")
        email: user.email,
        id_Profil: user.id_Profil,    // ✅ IMPORTANT : id_Profil
        nom_user: user.nom_user
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("🔑 Token créé pour user ID:", user.id_user, "- Profil:", user.id_Profil);

    // 🍪 Enregistrer le token dans un cookie HTTP-ONLY sécurisé
    setCookie("token", token, {
      req,
      res,
      httpOnly: true,                                    // ✅ Protection XSS
      secure: process.env.NODE_ENV === "production",    // ✅ HTTPS en production
      sameSite: "lax",                                   // ✅ CORRIGÉ : "lax" au lieu de "strict"
      maxAge: 60 * 60 * 24,                             // 24 heures
      path: "/"
    });

    console.log("🍪 Cookie créé avec succès");

    // ✅ Retourner les informations utilisateur
    return res.status(200).json({
      message: "Connexion réussie",
      user: {
        id_user: user.id_user,
        nom_user: user.nom_user,
        email: user.email,
        id_Profil: user.id_Profil,
        nom_profil: user.nom_profil?.nom_profil || null
      }
    });

  } catch (error) {
    console.error("❌ Erreur login:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
}