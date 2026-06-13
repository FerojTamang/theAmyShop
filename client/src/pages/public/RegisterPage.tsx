import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { normalizeApiError } from "../../lib/apiError";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    "/account";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? "") || undefined,
        phone: String(formData.get("phone") ?? ""),
        password: String(formData.get("password") ?? ""),
        referralCode: String(formData.get("referralCode") ?? "") || undefined,
      });
      navigate(redirectTo, { replace: true });
    } catch (apiError) {
      setError(normalizeApiError(apiError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div className="flex flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#b94767]">
          Join The AMY Shop
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-[#332522]">
          Create your gifting account.
        </h1>
        <p className="mt-4 text-[#6b5550]">
          Save your gift details, order history, rewards, and future custom
          gifting preferences in one calm account space.
        </p>
      </div>
      <Card className="bg-white/82">
        <form className="grid gap-5" onSubmit={(event) => void handleSubmit(event)}>
          <Input label="Full name" name="fullName" placeholder="QA Customer" />
          <Input label="Email" name="email" placeholder="qa@example.test" />
          <Input label="Phone" name="phone" placeholder="9800000001" />
          <Input label="Password" name="password" type="password" />
          <Input label="Referral code" name="referralCode" placeholder="Optional" />
          {error ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm shadow-red-100">
              {error}
            </p>
          ) : null}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-sm text-[#6b5550]">
            Already have an account?{" "}
            <Link className="font-semibold text-[#b94767]" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </section>
  );
}
