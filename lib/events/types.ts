export type EventRow = {
  id: string;
  dealership_id: string;
  created_by: string;
  event_date: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type EventWithCreator = EventRow & {
  creator?: {
    id: string;
    fullName: string;
  };
};

export type CreateEventInput = {
  event_date: string;
  title: string;
  description?: string | null;
};
