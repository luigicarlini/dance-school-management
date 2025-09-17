import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("✅ Registrazione completata! Vai al login.");
      } else {
        setMessage("❌ Errore nella registrazione.");
      }
    } catch (err) {
      setMessage("⚠️ Errore di connessione.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Registrati
        </h1>

        <input
          type="text"
          placeholder="Nome"
          className="border border-gray-300 rounded-lg w-full p-3 mb-4 focus:ring focus:ring-blue-400"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 rounded-lg w-full p-3 mb-4 focus:ring focus:ring-blue-400"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 rounded-lg w-full p-3 mb-6 focus:ring focus:ring-blue-400"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg font-semibold">
          Registrati
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </form>
    </div>
  );
}