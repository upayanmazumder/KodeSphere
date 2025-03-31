import { getSession } from "next-auth/react";
import Dashboard from "../components/dashboard/dashboard";

export default function ImportPage() {
  return (
    <main>
      <div className="heading">
        <h1>Dashboard</h1>
        <h2>Manage your repositories</h2>
      </div>
      <Dashboard />
    </main>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
