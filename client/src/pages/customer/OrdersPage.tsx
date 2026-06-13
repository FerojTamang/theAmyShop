import { PackageCheck } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";

export function OrdersPage() {
  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-950">Orders</h1>
        <p className="mt-2 text-stone-600">
          A clean order history shell for future status timelines and payment details.
        </p>
      </div>
      <EmptyState
        action={<PackageCheck className="h-5 w-5 text-rose-700" />}
        description="Order cards will connect to /api/orders/my in the customer workflow sprint."
        title="Order history ready"
      />
    </section>
  );
}
