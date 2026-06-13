import { UsersRound } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";

export function AdminCustomersPage() {
  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-950">Admin customers</h1>
        <p className="mt-2 text-stone-600">
          Customer search, status controls, rewards, and referral summaries will build on this page.
        </p>
      </div>
      <EmptyState
        action={<UsersRound className="h-5 w-5 text-rose-700" />}
        description="The route is ready for /api/admin/customers."
        title="Customer management shell"
      />
    </section>
  );
}
