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
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function CourseReport() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Course | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [schools, setSchools] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);


  type Course = {
    id: number;
    name: string;
    description: string;
    organized_by: string;
    application_start_date: string; // or Date if you're converting it
    application_end_date: string;
    course_start_date: string;
    course_end_date: string;
    eligibility_from: string;
    eligibility_to: string;
    reference_link: string;
    requirements: string[];
    course_tags: string[];
    created_at: string;
    updated_at: string;
  };

  interface Student {
    id: string;
    first_name: string;
    last_name: string;
  }
  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      let data = await response.json();



      setCourses(data);
    } catch (error) {
      setError("Error loading competitions");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedSchool("");
    setSelectedStudents([]);
    setAssignError(null);
    setSelectedActivity(null);
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
    fetchCourses();
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
        fetch('/api/customised-courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            course_id: selectedActivity.id,
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
      setSuccess('Course assigned successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error assigning competition:', error);
      setAssignError('Failed to assign competition');
    } finally {
      setAssignLoading(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete course");
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleRowClick = (params: any) => {
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

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

  const handleAssign = (activity: Course) => {
    setSelectedActivity(activity);
    setAssignDialogOpen(true);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Course Name", width: 200 },
    { field: "description", headerName: "Description", width: 250 },
    { field: "organized_by", headerName: "Organized By", width: 200 },
    { field: "application_start_date", headerName: "App Start Date", width: 150 },
    { field: "application_end_date", headerName: "App End Date", width: 150 },
    { field: "course_start_date", headerName: "Course Start", width: 150 },
    { field: "course_end_date", headerName: "Course End", width: 150 },
    { field: "eligibility_from", headerName: "Eligible From", width: 150 },
    { field: "eligibility_to", headerName: "Eligible To", width: 150 },
    { field: "requirements", headerName: "Requirements", width: 200 },
    { field: "course_tags", headerName: "Course Tags", width: 200 },
    { field: "reference_link", headerName: "Reference Link", width: 200 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 170,
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
            onClick={() => router.push(`/protected/course/form/${params.row.id}`)}
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
    <div className="bg-gray-500 flex justify-center h-screen w-auto">
      <div className="pt-20 pl-20">

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


        <div className="bg-white rounded-xl shadow-sm overflow-x-auto ">
          <DataGrid
            rows={courses}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
            onRowClick={handleRowClick}
            sx={{
              borderRadius: "12px",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f3f4f6",
                color: "#1f2937",
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
              <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}>
                Course Details
              </Typography>

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
                  Description:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.description)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Organized By:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.organized_by)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Application Start Date:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.application_start_date)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Application End Date:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.application_end_date)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Course Start Date:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.course_start_date)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Course End Date:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.course_end_date)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Eligibility From:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.eligibility_from)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Eligibility To:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.eligibility_to)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Reference Link:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.reference_link)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Requirements:
                </Typography>
                 {Array.isArray(selectedRow.requirements) ? (
                <Typography component="div" variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.requirements)}
                </Typography>
                 ) : (
                  <Typography variant="body1" sx={{ color: "#1f2937" }}>
                    {formatValue(selectedRow.requirements)}
                  </Typography>
                )}

              </Box>

             
              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Course Tags:
                </Typography>
               {Array.isArray(selectedRow.course_tags) ? (
                  <Typography component="div" variant="body1" sx={{ color: "#1f2937" }}>
                    {formatValue(selectedRow.course_tags)}
                  </Typography>
                ) : (
                  <Typography variant="body1" sx={{ color: "#1f2937" }}>
                    {formatValue(selectedRow.course_tags)}
                  </Typography>
                )}
              </Box>


            </Box>
          ) : (
            <Typography variant="body1">No course selected.</Typography>
          )}
        </Drawer>

        <Dialog
          open={assignDialogOpen}
          onClose={closeAssignDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Assign Course</DialogTitle>
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
                  disabled={assignLoading}

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
                  disabled={!selectedSchool || assignLoading}
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
