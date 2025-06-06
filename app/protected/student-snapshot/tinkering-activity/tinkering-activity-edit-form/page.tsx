import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Box } from "@mui/material";
import { Button } from "@/components/Button";
import { EditActivityDialogProps } from "@/lib/db/tinkering-activity/type";

const EditActivityDialog: React.FC<EditActivityDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editFormData,
  handleEditFormChange,
  handleArrayFieldChange,
  handleAddArrayItem,
  handleRemoveArrayItem,
  selectedSubject,
  setSelectedSubject,
  selectedTopic,
  setSelectedTopic,
  selectedSubtopic,
  setSelectedSubtopic,
  subjects,
  topics,
  subtopics,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Tinkering Activity</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Activity Name"
              fullWidth
              value={editFormData.name || ""}
              onChange={(e) => handleEditFormChange("name", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                label="Subject"
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id.toString()}>
                    {subject.subject_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Topic</InputLabel>
              <Select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                label="Topic"
                disabled={!selectedSubject}
              >
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id.toString()}>
                    {topic.topic_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Subtopic</InputLabel>
              <Select
                value={selectedSubtopic}
                onChange={(e) => setSelectedSubtopic(e.target.value)}
                label="Subtopic"
                disabled={!selectedTopic}
              >
                {subtopics.map((subtopic) => (
                  <MenuItem key={subtopic.id} value={subtopic.id.toString()}>
                    {subtopic.subtopic_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {[
            "introduction",
            "goals",
            "materials",
            "instructions",
            "tips",
            "observations",
            "extensions",
            "resources",
          ].map((field) => (
            <Grid item xs={12} key={field}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Typography>
              {Array.isArray(editFormData[field]) &&
                editFormData[field].map((item: string, index: number) => (
                  <Box key={index} sx={{ display: "flex", mb: 1 }}>
                    <TextField
                      fullWidth
                      value={item}
                      onChange={(e) =>
                        handleArrayFieldChange(field, index, e.target.value)
                      }
                    />
                    <Button
                      variant="default"
                      color="error"
                      onClick={() => handleRemoveArrayItem(field, index)}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </Box>
                ))}

              <Button
                variant="default"
                onClick={() => handleAddArrayItem(field)}
              >
                Add{" "}
                {field.charAt(0).toUpperCase() + field.slice(1).slice(0, -1)}
              </Button>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="default" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditActivityDialog;
