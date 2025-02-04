import { Stage } from '@prisma/client';

export function StageMapper(stage: Stage) {
  return {
    uid: stage.uid,
    title: stage.title,
    type: stage.type,
    description: stage.description,
    position: stage.position,
    status: stage.status,
  };
}
