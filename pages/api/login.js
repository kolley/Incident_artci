// pages/api/login.js
import prisma from "../../service/config/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { setCookie } from "cookies-next";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      message: "Méthode non autorisée",
      redirect: "/login_register"
    });
  }

  const { email, password } = req.body;

  // ✅ Validation des champs
  if (!email || !password) {
    return res.status(400).json({ 
      message: "Email et mot de passe sont obligatoires",
      redirect: "/login_register"
    });
  }

  try {
    // ✅ Récupérer l&apos;utilisateur avec son profil
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
      return res.status(401).json({ 
        message: "Email ou mot de passe incorrect",
        redirect: "/login_register"
      });
    }

    console.log("🔍 Vérification du mot de passe pour:", email);
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log("❌ Mot de passe incorrect");
      return res.status(401).json({ 
        message: "Email ou mot de passe incorrect",
        redirect: "/login_register"
      });
    }

    console.log("✅ Authentification réussie pour:", email);

    // 🔐 Création du token avec TOUS les champs nécessaires
    const token = jwt.sign(
      { 
        id_user: user.id_user,
        email: user.email,
        id_Profil: user.id_Profil,
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
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/"
    });

    console.log("🍪 Cookie créé avec succès");

    // ✅ Retourner les informations utilisateur avec redirection vers le dashboard
    return res.status(200).json({
      success: true,
      message: "Connexion réussie",
      redirect: "/dashboard", // ✅ Redirection vers le dashboard après succès
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
    return res.status(500).json({ 
      message: "Erreur interne du serveur",
      redirect: "/login_register"
    });
  }
}