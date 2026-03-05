import { Inbox } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = "Ma'lumot topilmadi" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Inbox size={48} strokeWidth={1.5} />
      <p className="mt-3 text-sm">{message}</p>
    </div>
  );
}
