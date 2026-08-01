import { apiRequest } from './api';
import type { UTR } from '../types/utr';
import type { TelemetryData } from '../types/telemetry';

export const getUtrsRequest = async (): Promise<UTR[]> => {
  /*
    Endpoint pendiente en backend.

    Cuando exista una ruta como:
    GET /api/utrs
    o
    GET /api/client/:id/utrs

    aquí se reemplazará la lógica mock por la petición real.
  */

  return [];
};

export const getUtrTelemetryRequest = async (
  id: number
): Promise<TelemetryData> => {
  const response = await apiRequest<{
    success: boolean;
    data: TelemetryData;
  }>(`/utr/${id}`);

  return response.data;
};