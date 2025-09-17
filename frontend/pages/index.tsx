import Layout from "../src/components/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold">Benvenuto nella Dashboard</h2>
        <p>Questa è un’anteprima dei corsi disponibili.</p>
      </div>
    </Layout>
  );
}