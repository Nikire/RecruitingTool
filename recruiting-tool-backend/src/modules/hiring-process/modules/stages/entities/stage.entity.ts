import { Stage, StageNote, User } from '@prisma/client';

export function StageMapper(stage: Stage) {
  return {
    uid: stage.uid,
    title: stage.title,
    type: stage.type,
    description: stage.description,
    position: stage.position,
    status: stage.status,
    estimatedTime: stage.estimatedTime,
  };
}

type StageWithNotes = Stage & {
  notes?: Array<StageNote & { author: User }>;
};

/**
 * Maps a stage to a response DTO including the note for the given hiring process (if any).
 * Each stage can have at most one note per hiring process (enforced by unique constraint).
 */
export function StageWithNoteMapper(stage: StageWithNotes, hiringProcessUid: string) {
  const notes = stage.notes ?? [];
  const note = notes[0] ?? null;

  return {
    uid: stage.uid,
    title: stage.title,
    type: stage.type,
    description: stage.description,
    position: stage.position,
    status: stage.status,
    estimatedTime: stage.estimatedTime,
    note: note
      ? {
          uid: note.uid,
          content: note.content,
          rating: note.rating,
          stageUid: stage.uid,
          hiringProcessUid,
          author: {
            uid: note.author.uid,
            name: note.author.name,
            email: note.author.email,
          },
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        }
      : null,
  };
}
