import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
    <AppShell>
      <div className="text-3xl font-bold">
        Coming Soon
      </div>
    </AppShell>
    </ProtectedRoute>
  );
}
