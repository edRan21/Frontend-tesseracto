export interface TelemetryData {
  id?: number;
  utr_id?: number;
  nsut?: string;
  flow_instant: number;
  flow_accumulated?: number;
  flow_velocity?: number;
  flow_direction?: number;
  ker_code: string;
  unit_measurement?: string;
  timestamp?: string;
}