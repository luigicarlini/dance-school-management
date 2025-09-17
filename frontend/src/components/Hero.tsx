import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative w-full h-[80vh] bg-cover bg-center"
      style={{ backgroundImage: "url('/dance-web1.jpg')" }}
    >
      {/* Overlay scuro */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Contenuto centrato */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white h-full px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
          Vivi la Passione per la Danza 💃
        </h1>

        <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-2xl">
          Benvenuto alla{" "}
          <span className="font-bold">Dance School Espaço Ballet di Jheniellen Lima</span>.  
          Corsi di danza per tutti i livelli — dal principiante al professionista.
        </p>

        <div className="space-x-4">
          <Link
            href="/register"
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold shadow hover:bg-yellow-300 transition"
          >
            Iscriviti Ora
          </Link>
          <Link
            href="/dashboard"
            className="bg-white text-purple-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-200 transition"
          >
            Vai alla Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}