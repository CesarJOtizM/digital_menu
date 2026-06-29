"use client";

import { cn } from "@/lib/cn";

interface ActionFormProps {
  action: (formData: FormData) => void | Promise<void>;
  fields?: Record<string, string>;
  children: React.ReactNode;
  className?: string;
}

export function ActionForm({
  action,
  fields = {},
  children,
  className,
}: ActionFormProps) {
  return (
    <form action={action} className={cn(className)}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {children}
    </form>
  );
}
