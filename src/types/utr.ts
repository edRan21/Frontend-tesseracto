export interface UTR {
  id: number;
  nsue: string;
  nsm: string | null;
  nsut: string;
  client_id: number;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
}