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
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function StudentReport() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setError("Error loading students");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      // Refresh the data
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const handleRowClick = (params: any) => {
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (Array.isArray(value)) return value.join(" | ");
    if (typeof value === "object") {
      // Special handling for school object
      if (value.name) return value.name;
      // For other objects, format as before
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    }
    return String(value);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "first_name", headerName: "First Name", width: 150 },
    { field: "last_name", headerName: "Last Name", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "gender", headerName: "Gender", width: 100 },
    { 
      field: "school", 
      headerName: "School", 
      width: 200,
      valueGetter: (params: any) => params.name || "N/A"
    },
    { field: "class", headerName: "Class", width: 100 },
    { field: "section", headerName: "Section", width: 100 },
    { field: "aspiration", headerName: "Aspiration", width: 200 },
    { field: "comments", headerName: "Comments", width: 200 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => router.push(`/protected/student/form/${params.row.id}`)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteOutlineIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
          color="error"
        />
      ],
    },
  ];

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-sm">
        <DataGrid
          rows={students}
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
              Student Details
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
                First Name:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.first_name)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Last Name:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.last_name)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Email:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.email)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Gender:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.gender)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                School:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.school)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Class:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.class)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Section:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.section)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Aspiration:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.aspiration)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Comments:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.comments)}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" sx={{ color: "#1f2937" }}>No data available</Typography>
        )}
      </Drawer>
    </div>
  );
} 