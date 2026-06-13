type LoaderProps = {
  label?: string;
};

export function Loader({ label = "Loading" }: LoaderProps) {
  return (
    <div className="inline-flex items-center gap-3 text-sm font-medium text-stone-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-700" />
      <span>{label}</span>
    </div>
  );
}
