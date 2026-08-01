interface SidebarItem {
  label: string;
  href: string;
}

interface SidebarProps {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
}

export const Sidebar = ({ title, subtitle, items }: SidebarProps) => {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">T</div>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}

      <nav>
        {items.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
};