import { getSession } from "next-auth/react";
import Settings from "../components/settings/settings";

export default function SettingsPage() {
  return (
    <main>
      <div className="heading">
        <h1>Settings</h1>
        <h2>Manage your settings and preferences.</h2>
      </div>
      <Settings />
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
