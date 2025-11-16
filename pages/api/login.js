import prisma from "../../service/config/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("❌ Utilisateur non trouvé:", email);
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log("❌ Mot de passe incorrect");
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    console.log("✅ Authentification réussie pour:", email);

    // 🔐 Création du token avec les bons champs
    const token = jwt.sign(
      { 
        id: user.id_user,           // 👈 Corrigé : id_user au lieu de id
        profil: user.id_Profil      // 👈 Corrigé : id_Profil au lieu de role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("🔑 Token créé pour user ID:", user.id_user);

    // 🍪 Cookie (optionnel)
    res.setHeader('Set-Cookie', 
      `token=${token}; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`
    );

    // ✅ Renvoyer le token dans la réponse JSON
    return res.status(200).json({ 
      message: "Connexion réussie",
      token: token,
      userName: user.nom_user,
      profil: user.id_Profil
    });

  } catch (error) {
    console.error("❌ Erreur login:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
}