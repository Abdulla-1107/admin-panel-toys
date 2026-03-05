import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-5 sticky top-0 z-30">
      <button onClick={onMenuClick} className="lg:hidden mr-3 text-muted-foreground">
        <Menu size={20} />
      </button>
      <h2 className="text-sm font-medium text-muted-foreground">Admin Panel</h2>
    </header>
  );
}
