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
import DetailViewer from "@/components/form/DetailViewer";
import { useRouter } from "next/navigation";
import { EditIcon, DeleteIcon } from "@/components/form/Icons";
import Alert from "@/components/ui/Alert";
import ReportShell from "@/components/form/ReportShell";

interface Mentor {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  school_ids: string[];
  comments?: string;
  user_id?: string | null;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export default function MentorReport() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Mentor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [schoolNameById, setSchoolNameById] = useState<Record<string, string>>({});

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
    // Load schools and mentors in parallel; map school IDs to names
    const load = async () => {
      try {
        const [schoolsRes] = await Promise.all([
          fetch('/api/schools'),
        ]);
        if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
        const schools = await schoolsRes.json();
        const map: Record<string, string> = {};
        for (const s of schools as Array<{id: string; name: string}>) {
          map[s.id] = s.name;
        }
        setSchoolNameById(map);
      } catch (e) {
        console.error(e);
        // non-fatal: we'll still show IDs if names unavailable
      } finally {
        fetchMentors();
      }
    };
    load();
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

      fetchMentors();
      setSuccess("Mentor deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error deleting mentor:", error);
      setError("Failed to delete mentor");
    }
  };

  const handleRowClick = (params: GridRowParams<Mentor>) => {
    if (!params || !params.row) return;
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
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: (params) =>
        `${params.row.first_name || ""} ${params.row.last_name || ""}`,
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
    },
    {
      field: "school_ids",
      headerName: "Schools",
      width: 200,
      renderCell: (params) => {
        const ids = (params.value as string[] | undefined) ?? [];
        const names = ids.map((id) => schoolNameById[id] || id).join(', ');
        return (
          <div className="truncate">{names || 'N/A'}</div>
        );
      },
    },
    {
      field: "phone_number",
      headerName: "Phone",
      width: 150,
    },
    {
      field: "calendar_link",
      headerName: "Calendar",
      width: 150,
      renderCell: (params) => {
        const userId = params.row.user_id;
        if (!userId) {
          return <span className="text-gray-400 text-xs">No calendar</span>;
        }
        return (
          <a
            href={`/calendar/${userId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            View Calendar
          </a>
        );
      },
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
            onClick={() =>
              router.push(`/protected/mentor/form/${params.row.id}`)
            }
          />
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          />
        </div>
      ),
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
            rows={mentors}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              columns: {
                columnVisibilityModel: {
                  calendar_link: false,
                },
              },
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
              mentors.findIndex((mentor) => mentor.id === selectedRow?.id) + 1,
            school_ids: (selectedRow.school_ids || []).map((id) => schoolNameById[id] || id),
            calendar_link: selectedRow.user_id ? `/calendar/${selectedRow.user_id}` : null,
          } : null}
          formtype="Mentor"
          columns={[
            { label: "S.No", field: "index" },
            { label: "First name", field: "first_name" },
            { label: "Last name", field: "last_name" },
            { label: "Email", field: "email" },
            { label: "Phone Number", field: "phone_number" },
            { label: "Schools", field: "school_ids" },
            { label: "Comments", field: "comments" },
            { label: "Calendar", field: "calendar_link", type: "link" },
          ]}
        />
      </div>
    </ReportShell>
  );
}
