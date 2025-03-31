import { getSession } from "next-auth/react";
import Dashboard from "../components/dashboard/dashboard";

export default function ImportPage() {
  return (
    <main>
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
