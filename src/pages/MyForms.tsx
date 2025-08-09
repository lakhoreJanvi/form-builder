import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { Box, Paper, List, ListItem, ListItemText, ListItemButton, Button, ListItemSecondaryAction, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { deleteSaved } from "../store/formSlice";

export default function MyForms() {
  const saved = useSelector((s: RootState) => s.form.saved);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>My Forms</Typography>
      {saved.length === 0 ? (
        <Typography>No saved forms yet.</Typography>
      ) : (
        <List>
          {saved.map((s) => (
            <ListItem key={s.id} disablePadding>
                <ListItemButton onClick={() => navigate(`/preview/${s.id}`)}>
                    <ListItemText
                    primary={s.name}
                    secondary={new Date(s.createdAt).toLocaleString()}
                    />
                </ListItemButton>
                <ListItemSecondaryAction>
                    <Button size="small" onClick={() => dispatch(deleteSaved(s.id))}>
                    Delete
                    </Button>
                </ListItemSecondaryAction>
                </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
