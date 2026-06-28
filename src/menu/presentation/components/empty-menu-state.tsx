interface EmptyMenuStateProps {
  readonly title: string;
  readonly body: string;
}

export function EmptyMenuState({ title, body }: EmptyMenuStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="font-heading text-2xl font-medium text-stone-700">{title}</p>
      <p className="max-w-md text-sm text-stone-500">{body}</p>
    </div>
  );
}
