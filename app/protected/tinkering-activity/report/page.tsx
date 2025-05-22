"use client";

import { useState, useEffect } from "react";
import { 
  DataGrid, 
  GridColDef, 
  GridActionsCellItem,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarColumnsButton,
} from "@mui/x-data-grid";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { TinkeringActivityWithSubtopic } from "@/lib/db/tinkering-activity/type";




const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

export default function TinkeringActivityReport() {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [missingRelationships, setMissingRelationships] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<TinkeringActivityWithSubtopic | null>(null);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/tinkering-activities");
      if (!response.ok) {
        throw new Error("Failed to fetch tinkering activities");
      }
      const data = await response.json();
      setActivities(data);
      
      // Check if all activities are missing data
      if (data.length > 0) {
        const allMissingData = data.every((activity: any) => 
          !activity.subtopic_name && !activity.topic_name && !activity.subject_name
        );
        if (allMissingData) {
          setMissingRelationships(true);
        }
      }
    } catch (error) {
      setError("Error loading tinkering activities");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools");
      if (!response.ok) {
        throw new Error("Failed to fetch schools");
      }
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const fetchStudents = async (schoolId: string) => {
    try {
      const response = await fetch(`/api/students?school_id=${schoolId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (assignDialogOpen) {
      fetchSchools();
    }
  }, [assignDialogOpen]);

  useEffect(() => {
    if (selectedSchool) {
      fetchStudents(selectedSchool);
    } else {
      setStudents([]);
      setSelectedStudents([]);
    }
  }, [selectedSchool]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tinkering activity?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tinkering-activities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete tinkering activity");
      }

      // Refresh the data
      fetchActivities();
    } catch (error) {
      console.error("Error deleting tinkering activity:", error);
    }
  };

  const handleRowClick = (params: any) => {
    if (!params || !params.row) return;
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const formatValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return "N/A";
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-5">
          {value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === "object") {
      // Special handling for nested objects
      if (value.subtopic_name) return value.subtopic_name;
      if (value.topic_name) return value.topic_name;
      if (value.subject_name) return value.subject_name;
      // For other objects, format as before
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    }
    return String(value);
  };

  const handleAssign = (activity: TinkeringActivityWithSubtopic) => {
    setSelectedActivity(activity);
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedStudents.length || !selectedActivity) return;

    try {
      setAssignLoading(true);
      setAssignError(null);

      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const promises = selectedStudents.map(studentId =>
        fetch('/api/customised-tinkering-activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: selectedActivity.name,
            subtopic_id: selectedActivity.subtopic_id,
            introduction: selectedActivity.introduction,
            goals: selectedActivity.goals,
            materials: selectedActivity.materials,
            instructions: selectedActivity.instructions,
            tips: selectedActivity.tips,
            observations: selectedActivity.observations,
            extensions: selectedActivity.extensions,
            resources: selectedActivity.resources,
            base_ta_id: selectedActivity.id,
            student_id: studentId,
            status: [`Assigned - ${formattedDate}`]
          }),
        })
      );

      await Promise.all(promises);
      setAssignDialogOpen(false);
      setSelectedStudents([]);
      setSelectedSchool('');
      setSelectedActivity(null);
      setSuccess('Tinkering activity assigned successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error assigning tinkering activity:', error);
      setAssignError('Failed to assign tinkering activity');
    } finally {
      setAssignLoading(false);
    }
  };

  const closeAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedSchool("");
    setSelectedStudents([]);
    setAssignError(null);
    setSelectedActivity(null);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
  
    {
      field: 'name',
      headerName: 'Activity Name',
      width: 200,
      renderCell: (params) => (
        <div className="whitespace-pre-line break-words p-2 flex items-center justify-center w-full h-full text-center">
          {params.value}
        </div>
      ),
    },
    {
      field: 'introduction',
      headerName: 'Introduction',
      width: 200,
      renderCell: (params) => (
        <div className="whitespace-pre-line break-words p-2 flex items-center justify-center w-full h-full text-center">
          {params.value}
        </div>
      ),
    },
    {
      field: "subtopic_name",
      headerName: "Subtopic",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center h-full">
          {params.value}
        </div>
      ),
    },
    {
      field: "topic_name",
      headerName: "Topic",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center h-full">
          {params.value}
        </div>
      ),
    },
    {
      field: "subject_name",
      headerName: "Subject",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center h-full">
          {params.value}
        </div>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 w-full h-full">
          <Button
            variant="default"
            color="primary"
            size="sm"
            onClick={() => handleAssign(params.row)}
          >
            Assign
          </Button>
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={() => router.push(`/protected/tinkering-activity/form/${params.row.id}`)}
          />
          <GridActionsCellItem
            key="delete"
            icon={<DeleteOutlineIcon />}
            label="Delete"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex justify-center items-start h-screen  w-screen bg-gray-500">

    
      <div className="pt-20 ">
      {missingRelationships && (
        <Alert 
          severity="warning" 
          className="mb-4"
          sx={{ 
            borderRadius: '8px',
            backgroundColor: '#FFF8E1',
            border: '1px solid #FFE082',
            padding: '10px 16px'
          }}
        >
          <div className="font-medium">Incomplete Data</div>
          <div className="text-sm mt-1">
            Some tinkering activities don't have proper subject, topic, or subtopic associations. 
            Please ensure you select the proper Subject, Topic, and Subtopic when creating activities.
          </div>
        </Alert>
      )}

      {error && (
        <Alert 
          severity="error" 
          className="mb-4"
          sx={{ 
            borderRadius: '8px',
            backgroundColor: '#FFEBEE',
            border: '1px solid #FFCDD2',
            padding: '10px 16px'
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          className="mb-4"
          sx={{ 
            borderRadius: '8px',
            backgroundColor: '#E3F2E8',
            border: '1px solid #A5D6A7',
            padding: '10px 16px'
          }}
        >
          {success}
        </Alert>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <DataGrid
          rows={activities}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'}
          autoHeight
          onRowClick={handleRowClick}
          sx={{
            borderRadius: "12px",
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal !important',
              wordWrap: 'break-word',
              alignItems: 'center',
              color: '#1f2937',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f3f4f6',
              color: '#1f2937',
            },
          }}
          slots={{
            toolbar: () => (
              <GridToolbarContainer className="bg-gray-50 p-2">
                <GridToolbarQuickFilter sx={{ width: "100%" }} />
                <GridToolbarColumnsButton />
              </GridToolbarContainer>
            ),
          }}
        />
      </div>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: "40%",
            padding: 3,
            backgroundColor: "#ffffff",
          },
        }}
      >
        {selectedRow ? (
          <Box>
            <Typography
              variant="h5"
              sx={{
                marginBottom: 3,
                fontWeight: "bold",
                textAlign: "center",
                color: "#1f2937",
              }}
            >
              Tinkering Activity Details
            </Typography>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                ID:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.id)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Name:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.name)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Subject:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.subject_name)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Topic:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.topic_name)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Subtopic:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.subtopic_name)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Introduction:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.introduction)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Goals:
              </Typography>
              {Array.isArray(selectedRow.goals) ? (
                <Typography component="div" variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.goals)}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.goals)}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Materials:
              </Typography>
              {Array.isArray(selectedRow.materials) ? (
                <Typography component="div" variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.materials)}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.materials)}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Instructions:
              </Typography>
              {Array.isArray(selectedRow.instructions) ? (
                <Typography component="div" variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.instructions)}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.instructions)}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Tips:
              </Typography>
              {Array.isArray(selectedRow.tips) ? (
                <Typography component="div" variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.tips)}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.tips)}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Observations:
              </Typography>
              {Array.isArray(selectedRow.observations) ? (
                <Typography component="div" variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.observations)}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.observations)}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Extensions:
              </Typography>
              {Array.isArray(selectedRow.extensions) ? (
                <Typography component="div" variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.extensions)}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.extensions)}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Resources:
              </Typography>
              {Array.isArray(selectedRow.resources) ? (
                <Typography component="div" variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.resources)}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.resources)}
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" sx={{ color: "#1f2937" }}>No data available</Typography>
        )}
      </Drawer>

      {/* Assignment Dialog */}
      <Dialog 
        open={assignDialogOpen} 
        onClose={closeAssignDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Tinkering Activity</DialogTitle>
        <DialogContent>
          {assignError && (
            <Alert severity="error" className="mb-4">
              {assignError}
            </Alert>
          )}
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select School
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
              >
                <option value="">Select a school</option>
                {schools.map((school: any) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Students
              </label>
              <Autocomplete
                multiple
                id="students-select"
                options={students}
                disableCloseOnSelect
                getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
                value={students.filter(student => selectedStudents.includes(student.id))}
                onChange={(_, newValue) => {
                  setSelectedStudents(newValue.map(student => student.id));
                }}
                disabled={!selectedSchool}
                renderOption={(props, option, { selected }) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} key={key} {...otherProps}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.first_name} {option.last_name}
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search students..."
                    variant="outlined"
                  />
                )}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssignDialog} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={handleAssignSubmit} 
            isLoading={assignLoading}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </div>
    </div>
  );
}