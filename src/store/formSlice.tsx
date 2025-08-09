import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FormSchema, Field } from "../types";
import { v4 as uuid } from "uuid";

const LOCAL_KEY = "upl_forms_v1";

interface PersistedForm {
  id: string;
  name: string;
  createdAt: number;
  fields: Field[];
}

interface FormState {
  draft: FormSchema;
  saved: PersistedForm[];
}

const initialDraft: FormSchema = {
  id: uuid(),
  name: "Untitled",
  createdAt: Date.now(),
  fields: []
};

function loadSaved(): PersistedForm[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PersistedForm[];
  } catch {
    return [];
  }
}

function persistSaved(saved: PersistedForm[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(saved));
}

const initialState: FormState = {
  draft: initialDraft,
  saved: loadSaved()
};

const slice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setDraftFields(state, action: PayloadAction<Field[]>) {
      state.draft.fields = action.payload;
    },
    addField(state, action: PayloadAction<Field>) {
      state.draft.fields.push(action.payload);
    },
    updateField(state, action: PayloadAction<Field>) {
      const idx = state.draft.fields.findIndex((f) => f.id === action.payload.id);
      if (idx >= 0) state.draft.fields[idx] = action.payload;
    },
    removeField(state, action: PayloadAction<string>) {
      state.draft.fields = state.draft.fields.filter((f) => f.id !== action.payload);
    },
    reorderFields(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      const arr = state.draft.fields;
      if (from < 0 || to < 0 || from >= arr.length || to >= arr.length) return;
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
    },
    resetDraft(state) {
      state.draft = {
        id: uuid(),
        name: "Untitled",
        createdAt: Date.now(),
        fields: []
      };
    },
    saveForm(state, action: PayloadAction<{ name: string }>) {
      const newSaved: PersistedForm = {
        id: state.draft.id,
        name: action.payload.name,
        createdAt: Date.now(),
        fields: state.draft.fields
      };
      state.saved.unshift(newSaved);
      persistSaved(state.saved);
    },
    loadSavedIntoDraft(state, action: PayloadAction<string>) {
      const found = state.saved.find((s) => s.id === action.payload);
      if (found) {
        state.draft = {
          id: found.id,
          name: found.name,
          createdAt: found.createdAt,
          fields: JSON.parse(JSON.stringify(found.fields))
        };
      }
    },
    deleteSaved(state, action: PayloadAction<string>) {
      state.saved = state.saved.filter((s) => s.id !== action.payload);
      persistSaved(state.saved);
    }
  }
});

export const {
  setDraftFields,
  addField,
  updateField,
  removeField,
  reorderFields,
  resetDraft,
  saveForm,
  loadSavedIntoDraft,
  deleteSaved
} = slice.actions;

export default slice.reducer;
