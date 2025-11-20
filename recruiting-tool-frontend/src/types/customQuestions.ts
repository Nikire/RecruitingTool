export enum QuestionType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  CHECKBOX = 'CHECKBOX',
}

export interface CustomQuestion {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options?: string[];
}

export interface CustomAnswers {
  [questionId: string]: string | string[] | undefined;
}
