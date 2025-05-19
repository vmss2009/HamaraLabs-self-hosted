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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
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

interface Competition {
  id: string;
  name: string;
  description: string;
  organised_by: string;
  application_start_date: string;
  application_end_date: string;
  competition_start_date: string;
  competition_end_date: string;
  eligibility: string[];
  constraints: string[];
  reference_links: string[];
  requirements: string[];
  payment: string;
  fee: string | null;
}

export default function CompetitionReport() {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Competition | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Competition | null>(null);

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const fetchCompetitions = async () => {
    try {
      const response = await fetch("/api/competitions");
      if (!response.ok) {
        throw new Error("Failed to fetch competitions");
      }
      const data = await response.json();
      setCompetitions(data);
    } catch (error) {
      setError("Error loading competitions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this competition?")) {
      return;
    }

    try {
      const response = await fetch(`/api/competitions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete competition");
      }

      // Refresh the data
      fetchCompetitions();
    } catch (error) {
      console.error("Error deleting competition:", error);
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
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    }
    return String(value);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const handleAssign = (competition: Competition) => {
    setSelectedActivity(competition);
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
        fetch('/api/customised-competitions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            competition_id: selectedActivity.id,
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
      setSuccess('Competition assigned successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error assigning competition:', error);
      setAssignError('Failed to assign competition');
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
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      fetchStudents(selectedSchool);
    } else {
      setStudents([]);
    }
  }, [selectedSchool]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "organised_by", headerName: "Organised By", width: 200 },
    { field: "application_start_date", headerName: "Application Start", width: 150, valueFormatter: (params) => formatDate(params) },
    { field: "application_end_date", headerName: "Application End", width: 150, valueFormatter: (params) => formatDate(params) },
    { field: "competition_start_date", headerName: "Competition Start", width: 150, valueFormatter: (params) => formatDate(params) },
    { field: "competition_end_date", headerName: "Competition End", width: 150, valueFormatter: (params) => formatDate(params) },
    { field: "payment", headerName: "Payment", width: 100 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      getActions: (params) => {
        if (!params || !params.row) return [];
        
        return [
          <Button
            variant="default"
            color="primary"
            size="sm"
            onClick={() => handleAssign(params.row)}
          >
            Assign
          </Button>,
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={() => router.push(`/protected/competition/form/${params.row.id}`)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteOutlineIcon />}
            label="Delete"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          />
        ];
      },
    },
  ];

  return (
    <div className="flex justify-center items-start h-screen  w-screen bg-gray-500">

    
        <div className="pt-20 ">
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
          rows={competitions}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          disableRowSelectionOnClick
          autoHeight
          onRowClick={handleRowClick}
          sx={{
            borderRadius: "12px",
            '& .MuiDataGrid-cell': {
              color: '#1f2937',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f3f4f6',
              color: '#1f2937',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f9fafb',
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
              Competition Details
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
                Description:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.description)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Organised By:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.organised_by)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Application Start Date:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatDate(selectedRow.application_start_date)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Application End Date:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatDate(selectedRow.application_end_date)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Competition Start Date:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatDate(selectedRow.competition_start_date)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Competition End Date:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatDate(selectedRow.competition_end_date)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Eligibility Criteria:
              </Typography>
              {Array.isArray(selectedRow.eligibility) ? (
                <Typography component="div" variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.eligibility)}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.eligibility)}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Reference Links:
              </Typography>
              {Array.isArray(selectedRow.reference_links) ? (
                <Typography component="div" variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.reference_links)}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.reference_links)}
                </Typography>
              )}
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
                Payment:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.payment)}
              </Typography>
            </Box>

            {selectedRow.payment === "paid" && (
              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Fee:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.fee)}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Typography variant="body1" sx={{ color: "#1f2937" }}>No data available</Typography>
        )}
      </Drawer>

      {/* Assign Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={closeAssignDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Assign Competition</DialogTitle>
        <DialogContent>
          {assignError && (
            <Alert 
              severity="error" 
              className="mb-4"
            >
              {assignError}
            </Alert>
          )}
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Competition: {selectedActivity?.name}
              </label>
            </div>
            
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
          <Button 
            onClick={closeAssignDialog}
            variant="outline"
          >
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