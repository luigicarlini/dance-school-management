import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setError("❌ Credenziali non valide");
      }
    } catch (err) {
      setError("⚠️ Errore di connessione");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-100 via-teal-100 to-blue-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 rounded-lg w-full p-3 mb-4 focus:ring focus:ring-green-400"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 rounded-lg w-full p-3 mb-6 focus:ring focus:ring-green-400"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded-lg font-semibold">
          Login
        </button>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </form>
    </div>
  );
}