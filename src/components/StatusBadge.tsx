interface StatusBadgeProps {
  status: 'Activa' | 'Advertencia' | 'Inactiva' | string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span className={`badge ${status.toLowerCase()}`}>
      {status}
    </span>
  );
};