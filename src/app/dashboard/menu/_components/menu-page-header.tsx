interface MenuPageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function MenuPageHeader({ title, description, action }: MenuPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="text-xl font-medium text-neutral-900">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
