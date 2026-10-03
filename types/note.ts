export type NoteColor =
  | "default"
  | "yellow"
  | "blue"
  | "green"
  | "pink";

export type Note = {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  createdAt: Date | null;
  updatedAt: Date | null;

  isPinned: boolean;
  isFavorite: boolean;
  color: NoteColor;
};