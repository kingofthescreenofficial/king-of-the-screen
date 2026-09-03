import { ShieldAlert } from "lucide-react";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-black text-gray-200 flex items-center justify-center p-6 font-mono">
      <section className="max-w-lg w-full text-center bg-[#111119] p-8 rounded-2xl border-2 border-yellow-500/50 space-y-4">
        <ShieldAlert className="w-10 h-10 text-yellow-400 mx-auto" />
        <h1 className="text-xl font-black text-yellow-400">ADMIN ACCESS IS OFFLINE</h1>
        <p className="text-sm text-gray-400 leading-relaxed">
          The admin console is unavailable while server-side authentication is being upgraded.
        </p>
      </section>
    </main>
  );
}
