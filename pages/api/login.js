import prisma from "../../service/config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { email, password } = req.body;

  // Vérification des champs
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    // Vérifie si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }

    // Vérifie le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    // Génère un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "c9136e124091b7b58e4e24280a11d27e", //  mon nom hacher
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erreur API Login:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}