export const Loader = ({ text = 'Cargando...' }: { text?: string }) => {
  return (
    <div className="loader">
      <div className="loader-dot" />
      <p>{text}</p>
    </div>
  );
};