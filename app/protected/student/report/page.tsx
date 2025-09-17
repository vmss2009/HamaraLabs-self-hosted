"use client";

import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridRowParams,
} from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { EditIcon, DeleteIcon } from "@/components/Icons";
import ReportShell from "@/components/ReportShell";
import DetailViewer from "@/components/DetailViewer";
import Alert from "@/components/Alert";
import { Student } from "@/lib/db/student/type";

export default function StudentReport() {
  const router = useRouter();
  const [students, setStudents] =useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Student | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

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

      setSuccess("Student record deleted sucessfully");
      setTimeout(() => setSuccess(null), 3000);

      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const handleRowClick = (params: GridRowParams<Student>) => {
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };


  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "S.No",
      width: 100,
      renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
    },
    { field: "first_name", headerName: "First Name", width: 150 },
    { field: "last_name", headerName: "Last Name", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    {
      field: "user_account",
      headerName: "User Account",
      width: 120,
      renderCell: (params) => {
        const hasUser = params.row.user_id ? true : false;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              hasUser
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {hasUser ? "✓ Linked" : "No Account"}
          </span>
        );
      },
    },
    { field: "gender", headerName: "Gender", width: 100 },
    {
      field: "school",
      headerName: "School",
      width: 200,
      valueGetter: (params) => {
        const anyParams = params as any;
        return anyParams?.name ?? "N/A";
      },
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
          onClick={() =>
            router.push(`/protected/student/form/${params.row.id}`)
          }
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
          color="error"
        />,
      ],
    },
  ];

  return (
    <ReportShell>
      <div className="w-full">
        {error && (
          <Alert severity="error" className="mx-10 mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className="mx-10 mb-4">
            {success}
          </Alert>
        )}
        
        <div className="bg-white rounded-xl shadow-sm w-[calc(100vw-5rem)] m-10">
          <DataGrid
            rows={students}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            slots={{
              toolbar: () => (
                <GridToolbarContainer className="bg-gray-50 p-2">
                  <GridToolbarQuickFilter sx={{ width: "100%" }} />
                  <GridToolbarColumnsButton />
                </GridToolbarContainer>
              ),
            }}
            sx={{
              borderRadius: "12px",
              "& .MuiDataGrid-cell": {
                color: "#1f2937",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f3f4f6",
                color: "#1f2937",
              },
            }}
          />
        </div>

        <DetailViewer
          drawerOpen={drawerOpen}
          closeDrawer={closeDrawer}
          selectedRow={selectedRow ? {
            ...selectedRow,
            index:
              students.findIndex((student) => student.id === selectedRow?.id) + 1,
            user_account_status: selectedRow.user_id 
              ? `✅ Linked to User Account (ID: ${selectedRow.user_id})`
              : "❌ No User Account Created",
          } : null}
          formtype="Student"
          columns={[
            { label: "S.No", field: "index" },
            { label: "First Name", field: "first_name" },
            { label: "Last Name", field: "last_name" },
            { label: "Email", field: "email" },
            { label: "User Account Status", field: "user_account_status", type: "custom" },
            { label: "Gender", field: "gender" },
            { label: "School", field: "school.name" },
            { label: "Class", field: "class" },
            { label: "Section", field: "section" },
            { label: "Aspiration", field: "aspiration" },
            { label: "Comments", field: "comments" },
          ]}
        />
      </div>
    </ReportShell>
  );
}
