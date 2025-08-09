import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import {
  addField,
  updateField,
  removeField,
  reorderFields,
  saveForm as saveFormAction,
  resetDraft
} from "../store/formSlice";
import Grid from "@mui/material/Grid";
import {
  Box,
  Paper,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction
} from "@mui/material";
import { v4 as uuid } from "uuid";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditIcon from "@mui/icons-material/Edit";
import FieldEditor, { FieldEditorProps } from "../shared/FieldEditor";

export default function CreateForm() {
  const draft = useSelector((s: RootState) => s.form.draft);
  const dispatch = useDispatch();
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [formName, setFormName] = useState(draft.name || "Untitled");

  function handleAdd(fieldType: FieldEditorProps["initial"]["type"]) {
    const newField = {
      id: uuid(),
      type: fieldType,
      label: `${fieldType} label`,
      required: false,
      defaultValue: "",
      options:
        fieldType === "select" || fieldType === "radio"
          ? ["Option 1", "Option 2"]
          : undefined,
      validation: {},
      derived: false,
      parents: [],
      formula: ""
    };
    dispatch(addField(newField));
    setSelectedFieldId(newField.id);
  }

  function handleRemove(id: string) {
    dispatch(removeField(id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  }

  function move(idx: number, dir: number) {
    const to = idx + dir;
    if (to >= 0 && to < draft.fields.length) {
      dispatch(reorderFields({ from: idx, to }));
    }
  }

  function handleSaveConfirm() {
    dispatch(saveFormAction({ name: formName }));
    setSaveOpen(false);
    dispatch(resetDraft());
  }

  return (
    <Grid container spacing={2}>
      {/* Left Panel */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <strong>Add Field</strong>
          </Box>
          <Grid container spacing={1}>
            {["text", "number", "textarea", "select", "radio", "checkbox", "date"].map((t) => (
              <Grid item key={t}>
                <Button
                    variant="outlined"
                    onClick={() => handleAdd(t as FieldEditorProps["initial"]["type"])}
                >
                    {t}
                </Button>
                </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3 }}>
            <strong>Fields</strong>
            <List>
              {draft.fields.map((f, idx) => (
                <ListItem
                  key={f.id}
                  disablePadding
                  secondaryAction={
                    <>
                      <IconButton onClick={() => move(idx, -1)} size="small">
                        <ArrowUpwardIcon />
                      </IconButton>
                      <IconButton onClick={() => move(idx, 1)} size="small">
                        <ArrowDownwardIcon />
                      </IconButton>
                      <IconButton onClick={() => setSelectedFieldId(f.id)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleRemove(f.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemButton selected={selectedFieldId === f.id} onClick={() => setSelectedFieldId(f.id)}>
                    <ListItemText
                      primary={`${f.label} (${f.type}${f.derived ? " • derived" : ""})`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {draft.fields.length === 0 && (
                <ListItem>
                  <ListItemText primary="No fields yet" />
                </ListItem>
              )}
            </List>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => setSaveOpen(true)}
              disabled={draft.fields.length === 0}
            >
              Save Form
            </Button>
          </Box>
        </Paper>
      </Grid>

      {/* Right Panel */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <strong>Field Editor</strong>
          {selectedFieldId ? (
            <FieldEditor
              key={selectedFieldId}
              initial={draft.fields.find((f) => f.id === selectedFieldId)!}
              allFields={draft.fields}
              onSave={(updated) => dispatch(updateField(updated))}
            />
          ) : (
            <Box sx={{ mt: 2 }}>Select a field to edit</Box>
          )}
        </Paper>
      </Grid>

      {/* Save Dialog */}
      <Dialog open={saveOpen} onClose={() => setSaveOpen(false)}>
        <DialogTitle>Save Form</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Form name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConfirm} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
