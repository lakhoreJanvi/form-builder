export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date";

export interface ValidationRules {
  minLength?: number | null;
  maxLength?: number | null;
  email?: boolean;
  passwordRule?: boolean; // e.g., min 8 + number
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // for select/radio/checkbox
  validation?: ValidationRules;
  derived?: boolean;
  parents?: string[]; // parent field ids
  formula?: string; // formula string using {{parentId}} placeholders
}

export interface FormSchema {
  id: string;
  name?: string;
  createdAt?: number;
  fields: Field[];
}
