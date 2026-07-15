import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type NavigationState = {
  successMessage?: string;
};

export function NavigationSuccessNotice() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationMessage = (location.state as NavigationState | null)?.successMessage;
  const [message, setMessage] = useState(navigationMessage ?? null);

  useEffect(() => {
    if (!navigationMessage) return;

    setMessage(navigationMessage);
    navigate(
      { pathname: location.pathname, search: location.search, hash: location.hash },
      { replace: true, state: null },
    );
  }, [location.hash, location.pathname, location.search, navigate, navigationMessage]);

  useEffect(() => {
    if (!message) return;

    const timeoutId = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  if (!message) return null;

  return (
    <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700" role="status">
      {message}
    </div>
  );
}
