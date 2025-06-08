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
import { useRouter } from "next/navigation";
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";

interface Mentor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_meta_data: {
    phone_number: string;
  };
  schools: Array<{
    id: number;
    name: string;
  }>;
}

export default function MentorReport() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Mentor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchMentors = async () => {
    try {
      const response = await fetch("/api/mentors");
      if (!response.ok) {
        throw new Error("Failed to fetch mentors");
      }
      const data = await response.json();
      setMentors(data);
    } catch (error) {
      setError("Error loading mentors");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mentor?")) {
      return;
    }

    try {
      const response = await fetch(`/api/mentors/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete mentor");
      }

      // Refresh the data
      fetchMentors();
      setSuccess("Mentor deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error deleting mentor:", error);
      setError("Failed to delete mentor");
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
    console.log(value);
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

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 200,
    },
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: (params) => `${params.row.first_name || ""} ${params.row.last_name || ""}`
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
    },
    {
      field: "schools",
      headerName: "Schools",
      width: 200,
      renderCell: (params) => (
        <div className="truncate">
          {params.value?.map((school: any) => school.name).join(", ") || "N/A"}
        </div>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 170,
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 w-full h-full">
          <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => router.push(`/protected/mentor/form/${params.row.id}`)}
        />
        <GridActionsCellItem
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

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" className="mb-4">
          {success}
        </Alert>
      )}

      <div className="bg-white rounded-xl shadow-sm">
      <DataGrid
            rows={mentors}
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
        {selectedRow && (
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
                {formatValue(`${selectedRow.first_name} ${selectedRow.last_name}`)}
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
                Phone number:
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.user_meta_data.phone_number)}
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                Schools:
              </Typography>
              <Box sx={{ color: "#1f2937" }}>
                {formatValue(selectedRow.schools.map((school) => school.name))}
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>
      </div>
    </div>
  );
} 