import { getServerAuthSession } from "~/server/auth";
import { Avatar } from "./ui/avatar";
import Link from "next/link";

export async function NavBar() {
  const session = await getServerAuthSession();
  return (
    <div className="navbar bg-white md:px-10">
      <div className="flex-none">
        <button className="btn btn-square btn-ghost md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-5 w-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">DelayBahn</a>
      </div>
      <div className="flex-none">
        {session?.user.name && (
          <span className="text-sm hidden md:block">Hello, {session.user.name}</span>
        )}
        <button>
          <Link
            tabIndex={0}
            href={session ? "/stats" : "/"}
            className="rounded-full border-2 bg-white/10 mx-4 px-10 py-2 font-semibold no-underline transition hover:bg-slate-50"
          >
            Stats
          </Link>
          <Link
            tabIndex={0}
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full border-2 bg-white/10 mr-4 px-10 py-2 font-semibold no-underline transition hover:bg-slate-50"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
        </button>
        <div className="dropdown dropdown-end dropdown-bottom">
          {session?.user.image && (
            <Avatar
              url={session?.user.image}
              className="h-10 w-10 rounded-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
