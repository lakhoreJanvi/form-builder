import React, { useState } from "react";
import { Field } from "../types";
import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  MenuItem,
  Checkbox,
  FormGroup,
  Typography
} from "@mui/material";

export type FieldEditorProps = {
  initial: Field;
  allFields: Field[];
  onSave: (f: Field) => void;
};

export default function FieldEditor({ initial, allFields, onSave }: FieldEditorProps) {
  const [field, setField] = useState<Field>({ ...initial });

  function update<K extends keyof Field>(k: K, v: Field[K]) {
    setField((s) => ({ ...s, [k]: v }));
  }

  function updateValidation<K extends keyof NonNullable<Field["validation"]>>(k: K, v: any) {
    const validation = { ...(field.validation || {}) } as any;
    validation[k] = v;
    setField((s) => ({ ...s, validation }));
  }

  function save() {
    // basic normalization
    if (
      (field.type === "select" || field.type === "radio") &&
      field.options &&
      field.options.length === 0
    ) {
      field.options = ["Option 1"];
    }
    onSave(field);
  }

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        label="Label"
        fullWidth
        value={field.label}
        onChange={(e) => update("label", e.target.value)}
        sx={{ mb: 1 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={field.required}
            onChange={(e) => update("required", e.target.checked)}
          />
        }
        label="Required"
      />

      <TextField
        label="Default value"
        fullWidth
        value={field.defaultValue ?? ""}
        onChange={(e) => update("defaultValue", e.target.value)}
        sx={{ mt: 1 }}
      />

      {(field.type === "select" ||
        field.type === "radio" ||
        field.type === "checkbox") && (
        <TextField
          label="Options (comma separated)"
          fullWidth
          value={(field.options || []).join(",")}
          onChange={(e) =>
            update(
              "options",
              e.target.value.split(",").map((s) => s.trim())
            )
          }
          sx={{ mt: 1 }}
        />
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2">Validation</Typography>
        <TextField
          label="Min length"
          type="number"
          value={field.validation?.minLength ?? ""}
          onChange={(e) =>
            updateValidation(
              "minLength",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          sx={{ mt: 1, mr: 1 }}
        />
        <TextField
          label="Max length"
          type="number"
          value={field.validation?.maxLength ?? ""}
          onChange={(e) =>
            updateValidation(
              "maxLength",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          sx={{ mt: 1 }}
        />
        <FormGroup row sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!field.validation?.email}
                onChange={(e) =>
                  updateValidation("email", e.target.checked)
                }
              />
            }
            label="Email format"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!field.validation?.passwordRule}
                onChange={(e) =>
                  updateValidation("passwordRule", e.target.checked)
                }
              />
            }
            label="Password rule (min 8 + number)"
          />
        </FormGroup>
      </Box>

      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={!!field.derived}
              onChange={(e) => update("derived", e.target.checked)}
            />
          }
          label="Derived field (computed)"
        />

        {field.derived && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption">Choose parent fields</Typography>
            <TextField
              select
              label="Parent fields"
              SelectProps={{
                multiple: true
              }}
              fullWidth
              value={field.parents ?? []}
              onChange={(e) => {
                const { value } = e.target;
                update("parents", Array.isArray(value) ? value : [value]);
                }}

              sx={{ mt: 1 }}
            >
              {allFields
                .filter((f) => f.id !== field.id)
                .map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.label}
                  </MenuItem>
                ))}
            </TextField>

            <TextField
              label="Formula (use {{fieldId}} placeholders)"
              helperText={
                'E.g. Math.floor((new Date() - new Date({{dob}})) / (365.25*24*60*60*1000)) or "{{a}} + {{b}}".'
              }
              fullWidth
              value={field.formula ?? ""}
              onChange={(e) => update("formula", e.target.value)}
              sx={{ mt: 1 }}
              multiline
              minRows={2}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={save}>
          Save field
        </Button>
      </Box>
    </Box>
  );
}
