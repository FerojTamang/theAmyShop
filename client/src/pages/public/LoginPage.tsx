import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { normalizeApiError } from "../../lib/apiError";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    "/account";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ identifier, password });
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
          Welcome back
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-[#332522]">
          Sign in to manage gifts, orders, and rewards.
        </h1>
        <p className="mt-4 max-w-md text-[#6b5550]">
          Your personal gift dashboard keeps orders, rewards, referrals, and
          account details ready for future storefront workflows.
        </p>
      </div>
      <Card className="bg-white/82">
        <form className="grid gap-5" onSubmit={(event) => void handleSubmit(event)}>
          <Input
            label="Phone or email"
            name="identifier"
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="9800000001"
            value={identifier}
          />
          <Input
            label="Password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            type="password"
            value={password}
          />
          {error ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm shadow-red-100">
              {error}
            </p>
          ) : null}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-sm text-[#6b5550]">
            New here?{" "}
            <Link className="font-semibold text-[#b94767]" to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </Card>
    </section>
  );
}
