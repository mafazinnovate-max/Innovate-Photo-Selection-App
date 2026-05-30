import Link from "next/link";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Events",
    href: "/events",
  },
  {
    name: "Uploads",
    href: "/uploads",
  },
  {
    name: "Settings",
    href: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-900 p-4">
      <h2 className="mb-8 text-2xl font-bold">
        Innovate
      </h2>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="block rounded-lg px-4 py-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}