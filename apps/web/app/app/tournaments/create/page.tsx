import { CreateTournamentForm } from "./CreateTournamentForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { redirect } from "next/navigation";

export default async function CreateTournamentPage() {
  const session = await getServerSession(authOptions);
  const isAdminOrManager = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'MANAGER';

  if (!isAdminOrManager) {
    redirect("/app/tournaments");
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Neues Turnier erstellen</h1>
        <p className="text-muted-foreground">Konfiguriere die Einstellungen für dein Beerpong-Turnier.</p>
      </div>
      <CreateTournamentForm />
    </div>
  );
}
