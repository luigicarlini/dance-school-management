import Layout from "../src/components/Layout";

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-10">
        {/* Intestazione */}
        <div>
          <h1 className="text-2xl font-bold mb-2">Buonasera, Demo!</h1>
          <p className="text-gray-600">
            Ecco un riepilogo delle tue attività
          </p>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600">Lezioni Prenotate</p>
            <p className="text-3xl font-bold text-blue-600">3</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600">Lezioni Completate</p>
            <p className="text-3xl font-bold text-green-600">5</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600">Crediti Rimanenti</p>
            <p className="text-3xl font-bold text-purple-600">8</p>
          </div>
        </div>

        {/* Corsi disponibili */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Corsi Disponibili</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="font-bold">Salsa Base</h3>
              <p className="text-gray-600 mb-4">Corso introduttivo di Salsa</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
                Prenota
              </button>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="font-bold">Hip Hop</h3>
              <p className="text-gray-600 mb-4">Corso base Hip Hop per principianti</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
                Prenota
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}