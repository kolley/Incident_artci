    import { useState } from "react";
    import { useRouter } from "next/router";
    import axios from "axios";

    export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        // Envoie des infos de connexion au backend
        const response = await axios.post("/api/login", { email, password });

        // Stocker le token dans localStorage
        localStorage.setItem("token", response.data.token);

        // Redirection vers la page formulaire
        router.push("/formulaire");
        } catch (error) {
        console.error("Échec de la connexion :", error);
        alert("Email ou mot de passe incorrect");
        }
    };

    return (
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
        <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="border p-2 rounded"
        />
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Se connecter
        </button>

        


        </form>
    );
    }
