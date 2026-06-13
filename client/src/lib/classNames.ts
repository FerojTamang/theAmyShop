type ClassValue = string | false | null | undefined;

export function classNames(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}
