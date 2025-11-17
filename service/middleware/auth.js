// service/middleware/auth.js
import jwt from "jsonwebtoken";

/**
 * ✅ CORRECTION MAJEURE : Vérifier le token dans les COOKIES
 * (et non plus dans Authorization header)
 */
export function verifyToken(req) {
  // ✅ Récupérer le token depuis les cookies
  const token = req.cookies?.token;

  console.log("🔍 [Middleware] Token présent:", token ? "✅ OUI" : "❌ NON");

  if (!token) {
    return { success: false, error: "Token manquant" };
  }

  if (typeof token !== "string") {
    console.log("❌ [Middleware] Token invalide (type incorrect):", typeof token);
    return { success: false, error: "Token invalide (format incorrect)" };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log("✅ [Middleware] Token décodé - User ID:", decoded.id_user, "Profil:", decoded.id_Profil);

    // ✅ Retourner le decoded complet
    return { success: true, user: decoded };

  } catch (error) {
    console.error("❌ [Middleware] Erreur de vérification du token:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return { success: false, error: "Token expiré" };
    }
    return { success: false, error: "Token invalide" };
  }
}

/**
 * Vérifier si un profil a la permission
 */
export function checkPermission(userProfil, requiredProfils) {
  return requiredProfils.includes(userProfil);
}