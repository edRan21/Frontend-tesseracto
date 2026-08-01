interface HeaderProps {
  title: string;
  subtitle?: string;
  onLogout?: () => void;
}

export const Header = ({ title, subtitle, onLogout }: HeaderProps) => {
  return (
    <header className="app-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {onLogout && (
        <button className="header-button" onClick={onLogout}>
          Cerrar sesión
        </button>
      )}
    </header>
  );
};
