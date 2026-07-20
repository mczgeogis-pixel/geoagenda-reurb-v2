export type Appointment = {
  id: string;
  date: string;
  time: string;
  name: string;
  cpf: string;
  phone: string;
  district: string;
  address: string;
  reference: string;
  notes: string | null;
  assigned_to: string;
  status: string;
  pendencies: string[];
  created_at: string;
  updated_at: string;
};
