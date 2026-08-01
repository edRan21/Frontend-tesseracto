import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export interface TelemetryChartPoint {
  timestamp: string;
  flow_instant: number;
  flow_accumulated: number;
  flow_velocity: number;
}

interface TelemetryChartProps {
  data: TelemetryChartPoint[];
}

/*
  TODO BACKEND:
  Este componente espera un arreglo con histórico o datos en tiempo real:

  [
    {
      timestamp: "2026-06-18T10:30:00",
      flow_instant: 25.6,
      flow_accumulated: 12450,
      flow_velocity: 1.8
    }
  ]

  Endpoint sugerido:
  GET /api/utr/:id/telemetry/history
  o WebSocket/SSE para tiempo real.
*/

export const TelemetryChart = ({ data }: TelemetryChartProps) => {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <strong>Gráficas listas para conexión</strong>
        <span>
          Cuando el backend entregue histórico o datos en tiempo real, aquí se
          visualizarán las variables de flujo.
        </span>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,.08)" />
          <XAxis dataKey="timestamp" stroke="#8f8f8f" />
          <YAxis stroke="#8f8f8f" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="flow_instant"
            name="Flujo instantáneo"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="flow_accumulated"
            name="Flujo acumulado"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="flow_velocity"
            name="Velocidad"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};