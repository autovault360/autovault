export type StickyNoteRow = {
  id: string;
  dealership_id: string;
  user_id: string;
  color: string;
  text: string;
  is_pinned: boolean;
  dashboard_path: string;
  created_at: string;
  updated_at: string;
};

export type StickyNoteUser = {
  id: string;
  fullName: string;
};

export type StickyNoteWithUser = StickyNoteRow & {
  user: StickyNoteUser;
};

export type CreateStickyNoteParams = {
  color?: string;
  text: string;
  is_pinned?: boolean;
  dashboard_path: string;
};

export type UpdateStickyNoteParams = {
  id: string;
  color?: string;
  text?: string;
  is_pinned?: boolean;
};
