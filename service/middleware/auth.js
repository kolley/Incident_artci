import jwt from "jsonwebtoken";

export function verifyToken(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { success: false, error: "Token manquant" };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { success: true, user: decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { success: false, error: "Token expiré" };
    }
    return { success: false, error: "Token invalide" };
  }
}

export function checkPermission(userProfil, requiredProfils) {
  return requiredProfils.includes(userProfil);
}
