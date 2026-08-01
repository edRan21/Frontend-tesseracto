interface CardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
}

export const Card = ({ title, value, subtitle }: CardProps) => {
  return (
    <div className="metric-card">
      <span>{title}</span>
      {value !== undefined && <strong>{value}</strong>}
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};