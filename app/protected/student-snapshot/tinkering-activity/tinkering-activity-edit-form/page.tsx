import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Box,
  Paper,
  IconButton,
} from "@mui/material";
import { Input } from "@/components/Input";
import SelectField from "@/components/SelectField";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
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
      <div className="mb-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          Edit Tinkering Activity
        </h1>
        <p className="text-gray-600 mt-2">
          Update the details of this tinkering activity.
        </p>
      </div>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          {/* Activity Name */}
          <Grid item xs={12}>
            <Input
              name="Activity Name"
              label="Activity Name"
              value={editFormData.name || ""}
              onChange={(e) => handleEditFormChange("name", e.target.value)}
              className="focus:border-blue-500 focus:ring-blue-500"
            />
          </Grid>

          {/* Subject, Topic, Subtopic */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <SelectField
                    name="subject"
                    label="Subject"
                    options={subjects.map((subject) => ({
                      value: subject.id.toString(),
                      label: subject.subject_name,
                    }))}
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <SelectField
                    name="Topic"
                    label="Topic"
                    options={topics.map((topic) => ({
                      value: topic.id.toString(),
                      label: topic.topic_name,
                    }))}
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <SelectField
                    name="Subtopic"
                    label="Subtopic"
                    options={subtopics.map((subtopic) => ({
                      value: subtopic.id.toString(),
                      label: subtopic.subtopic_name,
                    }))}
                    value={selectedSubtopic}
                    onChange={(e) => setSelectedSubtopic(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Introduction */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography
                variant="h6"
                color="text.primary"
                sx={{ mb: 1, fontWeight: "bold" }}
              >
                Introduction
              </Typography>
              <textarea
                name="introduction"
                value={editFormData.introduction || ""}
                onChange={(e) =>
                  handleEditFormChange("introduction", e.target.value)
                }
                required
                rows={4}
                className="flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
              />
            </Paper>
          </Grid>

          {/* Dynamic Array Fields */}
          {[
            "goals",
            "materials",
            "instructions",
            "tips",
            "observations",
            "extensions",
            "resources",
          ].map((field) => (
            <Grid item xs={12} key={field}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography
                  variant="h6"
                  color="text.primary"
                  sx={{ mb: 1, fontWeight: "bold" }}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Typography>

                {(() => {
                  let arrayValue = editFormData[field];
                  if (!Array.isArray(arrayValue)) {
                    arrayValue = arrayValue ? [arrayValue] : [""];
                  }

                  return arrayValue.map((item: string, index: number) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                    >
                      <Input
                        name={`${field}-${index}`}
                        value={item}
                        onChange={(e) =>
                          handleArrayFieldChange(field, index, e.target.value)
                        }
                        className="focus:border-blue-500 focus:ring-blue-500"
                      />

                      <IconButton
                        onClick={() => handleRemoveArrayItem(field, index)}
                        sx={{
                          ml: 1,
                          color: "error.main",
                        }}
                      >
                        <RemoveCircleIcon sx={{ fontSize: 36 }} />
                      </IconButton>
                    </Box>
                  ));
                })()}

                <Box display="flex" alignItems="center" mt={1}>
                  <IconButton
                    onClick={() => handleAddArrayItem(field)}
                    sx={{
                      color: "success.main",
                    }}
                  >
                    <AddCircleIcon sx={{ fontSize: 36 }} />
                  </IconButton>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Add{" "}
                    {field.charAt(0).toUpperCase() +
                      field.slice(1).replace(/s$/, "")}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="ghost" color="secondary">
          Cancel
        </Button>
        <Button onClick={onSubmit} color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditActivityDialog;
