import prisma from "../../service/config/prisma";
import bcrypt from "bcryptjs";
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { email, password } = req.body;

  // Vérification basique des champs
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    // Vérifier si l’utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Enregistrer l’utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true, // ⚠️ On ne retourne pas le mot de passe
      },
    });

    return res.status(201).json({ message: "Inscription réussie", user: newUser });
  } catch (error) {
    console.error("Erreur API Register:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}