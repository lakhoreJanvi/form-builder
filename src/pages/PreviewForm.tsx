import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { Box, Paper, TextField, Button, FormControlLabel, Checkbox, RadioGroup, Radio, MenuItem, Typography } from "@mui/material";
import { evaluateFormula } from "../utils/evaluator";
import { useParams, useNavigate } from "react-router-dom";
import { loadSavedIntoDraft } from "../store/formSlice";

export default function PreviewForm() {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const saved = useSelector((s: RootState) => s.form.saved);
  const draft = useSelector((s: RootState) => s.form.draft);

  // if url contains id, load that saved form into draft for preview
  useEffect(() => {
    if (params.id) {
      dispatch(loadSavedIntoDraft(params.id));
    }
  }, [params.id]);

  const fields = draft.fields;
  // local form state
  const [values, setValues] = useState<Record<string, any>>(() =>
    fields.reduce((acc, f) => {
      acc[f.id] = f.defaultValue ?? (f.type === "checkbox" ? [] : "");
      return acc;
    }, {} as Record<string, any>)
  );

  // sync when fields change (e.g., when navigating to a saved form)
  useEffect(() => {
    const init: Record<string, any> = {};
    fields.forEach((f) => (init[f.id] = f.defaultValue ?? (f.type === "checkbox" ? [] : "")));
    setValues(init);
  }, [draft.id, draft.fields.length]);

  // compute derived fields whenever values change
  useEffect(() => {
    const derivedUpdates: Record<string, any> = {};
    for (const f of fields.filter((x) => x.derived)) {
      const { ok, value } = evaluateFormula(f.formula, values);
      derivedUpdates[f.id] = ok ? value : `Err: ${value}`;
    }
    if (Object.keys(derivedUpdates).length) {
      setValues((prev) => ({ ...prev, ...derivedUpdates }));
    }
  }, [values, draft.fields.map((f) => f.id).join("|")]); // re-run if fields change

  function onChange(id: string, val: any) {
    setValues((v) => ({ ...v, [id]: val }));
  }

  function validate(): { [id: string]: string } {
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const v = values[f.id];
      if (f.required && (v === "" || v === null || (Array.isArray(v) && v.length === 0))) {
        errs[f.id] = "Required";
        continue;
      }
      if (f.validation?.minLength && typeof v === "string") {
        if (v.length < (f.validation.minLength ?? 0)) errs[f.id] = `Min length ${f.validation.minLength}`;
      }
      if (f.validation?.maxLength && typeof v === "string") {
        if (v.length > (f.validation.maxLength ?? 0)) errs[f.id] = `Max length ${f.validation.maxLength}`;
      }
      if (f.validation?.email && typeof v === "string") {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        if (!ok) errs[f.id] = "Invalid email";
      }
      if (f.validation?.passwordRule && typeof v === "string") {
        const ok = v.length >= 8 && /\d/.test(v);
        if (!ok) errs[f.id] = "Password must be ≥8 chars and include a number";
      }
    }
    return errs;
  }

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      alert("Form valid — (we don't store user input per assignment). You could now submit this.");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{draft.name ?? "Preview form"}</Typography>
      {fields.length === 0 ? (
        <Typography>No fields in form. Go to Create to build one.</Typography>
      ) : (
        <Box component="form" sx={{ display: "grid", gap: 2 }}>
          {fields.map((f) => {
            const err = errors[f.id];
            if (f.derived) {
              return (
                <TextField key={f.id} label={`${f.label} (derived)`} value={values[f.id] ?? ""} InputProps={{ readOnly: true }} helperText={err} error={!!err} />
              );
            }
            switch (f.type) {
              case "text":
              case "number":
                return (
                  <TextField
                    key={f.id}
                    label={f.label}
                    type={f.type === "number" ? "number" : "text"}
                    value={values[f.id] ?? ""}
                    onChange={(e) => onChange(f.id, f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                    helperText={err}
                    error={!!err}
                  />
                );
              case "textarea":
                return (
                  <TextField key={f.id} label={f.label} multiline minRows={3} value={values[f.id] ?? ""} onChange={(e) => onChange(f.id, e.target.value)} helperText={err} error={!!err} />
                );
              case "select":
                return (
                  <TextField key={f.id} select label={f.label} value={values[f.id] ?? ""} onChange={(e) => onChange(f.id, e.target.value)} helperText={err} error={!!err} >
                    {(f.options || []).map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </TextField>
                );
              case "radio":
                return (
                  <Box key={f.id}>
                    <Typography>{f.label}</Typography>
                    <RadioGroup value={values[f.id] ?? ""} onChange={(e) => onChange(f.id, e.target.value)}>
                      {(f.options || []).map((o) => (
                        <FormControlLabel key={o} value={o} control={<Radio />} label={o} />
                      ))}
                    </RadioGroup>
                    {err && <Typography color="error">{err}</Typography>}
                  </Box>
                );
              case "checkbox":
                return (
                  <Box key={f.id}>
                    <Typography>{f.label}</Typography>
                    {(f.options || []).map((o) => {
                      const arr: string[] = values[f.id] ?? [];
                      const checked = arr.includes(o);
                      return (
                        <FormControlLabel
                          key={o}
                          label={o}
                          control={<Checkbox checked={checked} onChange={(e) => {
                            const next = checked ? arr.filter((x) => x !== o) : [...arr, o];
                            onChange(f.id, next);
                          }} />}
                        />
                      );
                    })}
                    {err && <Typography color="error">{err}</Typography>}
                  </Box>
                );
              case "date":
                return (
                  <TextField key={f.id} type="date" label={f.label} InputLabelProps={{ shrink: true }} value={values[f.id] ?? ""} onChange={(e) => onChange(f.id, e.target.value)} helperText={err} error={!!err} />
                );
              default:
                return null;
            }
          })}

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" onClick={handleSubmit}>Validate</Button>
            <Button variant="outlined" onClick={() => navigate("/create")}>Back to Create</Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
