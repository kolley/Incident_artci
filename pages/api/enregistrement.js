import prisma from "../../service/config/prisma";

export default async function handler(req, res) {
if (req.method !== "GET") {
return res.status(405).json({ success: false, message: "Méthode non autorisée" });
}

try {
const incidents = await prisma.formulaire.findMany({
orderBy: { createdAt: "desc" },
});


return res.status(200).json({ success: true, data: incidents });


} catch (error) {
console.error("Erreur lors de la récupération des incidents :", error);
return res.status(500).json({ success: false, message: "Erreur interne du serveur" });
}
}
