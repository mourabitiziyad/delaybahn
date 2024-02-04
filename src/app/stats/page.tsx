import Stats from "~/components/viz/stats";
import { getServerAuthSession } from "~/server/auth";

export default async function Page() {

  const session = await getServerAuthSession()

  if(!session) {
    return (
      <div className="flex items-center justify-center mt-24">
        <div className="">You have to sign in to access this page</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="flex flex-wrap justify-center gap-4">
        <Stats />
      </div>
    </div>
  );
}
