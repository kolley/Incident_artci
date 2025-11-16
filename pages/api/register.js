import prisma from "../../service/config/prisma";
import bcrypt from "bcryptjs";
import { verifyToken } from "../../service/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  // ✅ Vérifier l'authentification
  const auth = verifyToken(req);
  
  if (!auth.success) {
    console.log("❌ Tentative de création sans authentification");
    return res.status(401).json({ message: "Vous devez être connecté pour créer un utilisateur" });
  }

  const { profil: userProfil } = auth.user;

  // ✅ Seuls SUP_AD0 et SUPER_1 peuvent créer des utilisateurs
  if (!["SUP_AD0", "SUPER_1"].includes(userProfil)) {
    console.log("❌ Tentative de création par profil non autorisé:", userProfil);
    return res.status(403).json({ 
      message: "Vous n'avez pas la permission de créer des utilisateurs" 
    });
  }

  const { email, password, nom_user, id_Profil } = req.body;

  if (!email || !password || !nom_user || !id_Profil) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires" });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom_user,
        id_Profil,
      },
    });

    console.log("✅ Utilisateur créé par", userProfil, ":", newUser.email);

    return res.status(201).json({ 
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser.id_user,
        email: newUser.email,
        nom_user: newUser.nom_user,
        profil: newUser.id_Profil
      }
    });

  } catch (error) {
    console.error("❌ Erreur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
}