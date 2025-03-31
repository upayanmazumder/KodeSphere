import { getSession } from "next-auth/react";
import Import from "../components/import/import";

export default function ImportPage() {
  return (
    <main>
      <div className="heading">
        <h1>Import</h1>
        <h2>Import and setup a docker image</h2>
      </div>
      <Import />
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
