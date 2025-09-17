import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    window.location.href = "/login";
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 flex justify-between items-center shadow-md">
      {/* Titolo scuola */}
      <Link
        href="/"
        className="text-lg md:text-2xl font-extrabold tracking-wide text-white"
      >
        Dance School Espaço Ballet di Jheniellen Lima
      </Link>

      {/* Links */}
      <div className="flex space-x-6 items-center text-white font-medium">
        <Link
          href="/"
          className="hover:text-yellow-300 transition-colors duration-300"
        >
          Dashboard
        </Link>

        {!token && (
          <>
            <Link
              href="/login"
              className="hover:text-yellow-300 transition-colors duration-300"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="hover:text-yellow-300 transition-colors duration-300"
            >
              Register
            </Link>
          </>
        )}

        {token && (
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}