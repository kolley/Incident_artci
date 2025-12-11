import prisma from "../../service/config/prisma";
import bcrypt from "bcryptjs";
import { verifyToken } from "../../service/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      message: "Méthode non autorisée",
      redirect: "/error" // ou une autre page appropriée
    });
  }

  // Vérifier l&apos;authentification
  const auth = verifyToken(req);
  
  if (!auth.success) {
    return res.status(401).json({ 
      message: "Vous devez être connecté pour créer un utilisateur",
      redirect: "/login" // Rediriger vers la page de connexion
    });
  }

  const { id_Profil: userProfil } = auth.user;
  console.log("Profil de l&apos;utilisateur connecté:", userProfil);

  // Seuls SUP_AD0 et SUPER_1 peuvent créer des utilisateurs
  if (!["SUP_AD0", "SUPER_1"].includes(userProfil)) {
    return res.status(403).json({
      message: "Vous n&apos;avez pas la permission de créer des utilisateurs",
      redirect: "/dashboard" // Rediriger vers le tableau de bord
    });
  }

  const { email, password, nom_user, id_Profil, id_operateur } = req.body;
  // Convertir id_operateur en entier
  const idOperateurInt = parseInt(id_operateur, 10);

  // Validation des champs obligatoires
  if (!email || !password || !nom_user || !id_Profil || !id_operateur) {
    return res.status(400).json({ 
      message: "Tous les champs sont obligatoires",
      redirect: "/dashboard/create" // Rester sur le formulaire de création
    });
  }

  try {
    // Vérifier si l&apos;utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        message: "Cet email est déjà utilisé",
        redirect: "/dashboard" // Rester sur le formulaire
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l&apos;utilisateur (opérateur ajouté)
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom_user,
        id_Profil,
        id_operateur: idOperateurInt,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      redirect: "/dashboard", // Rediriger vers la liste des utilisateurs
      user: {
        id: newUser.id_user,
        email: newUser.email,
        nom_user: newUser.nom_user,
        profil: newUser.id_Profil,
        id_operateur: newUser.id_operateur
      }
    });

  } catch (error) {
    console.error("Erreur:", error);
    return res.status(500).json({ 
      message: "Erreur interne du serveur",
      redirect: "/dashboard" // Rester sur le formulaire ou rediriger vers une page d&apos;erreur
    });
  }
}