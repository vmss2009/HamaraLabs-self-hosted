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
import { Button } from "@/components/form/Button";
import { useRouter } from "next/navigation";
import Alert from "@/components/form/Alert";
import { EditIcon, DeleteIcon } from "@/components/form/Icons";
import DetailViewer from "@/components/form/DetailViewer";
import AssignDialog from "@/components/form/DialogBox";
import ReportShell from "@/components/form/ReportShell";
import { Competition } from "@/lib/db/competition/type";

export default function CompetitionReport() {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Competition | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Competition | null>(
    null
  );

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

      setSuccess("Competition record deleted sucessfully");
      setTimeout(() => setSuccess(null), 3000);

      fetchCompetitions();
    } catch (error) {
      console.error("Error deleting competition:", error);
    }
  };

  const handleRowClick = (params: GridRowParams<Competition>) => {
    if (!params || !params.row) return;
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleAssign = (competition: Competition) => {
    setSelectedActivity(competition);
    setAssignDialogOpen(true);
  };

  const closeAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedActivity(null);
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "S.No",
      width: 100,
      renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
    },
    { field: "name", headerName: "Name", width: 200 },
    { field: "organised_by", headerName: "Organised By", width: 200 },
    {
      field: "application_start_date",
      headerName: "Application Start",
      width: 150,
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "application_end_date",
      headerName: "Application End",
      width: 150,
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "competition_start_date",
      headerName: "Competition Start",
      width: 150,
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "competition_end_date",
      headerName: "Competition End",
      width: 150,
      valueFormatter: (params) => formatDate(params),
    },
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
            key="assign"
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
            onClick={() =>
              router.push(`/protected/competition/form/${params.row.id}`)
            }
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          />,
        ];
      },
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
            rows={competitions}
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
              competitions.findIndex(
                (competition) => competition.id === selectedRow?.id
              ) + 1,
          } : null}
          formtype="Competition"
          columns={[
            { label: "S.No", field: "index" },
            { label: "Name", field: "name" },
            { label: "Description", field: "description" },
            { label: "Organised By", field: "organised_by" },
            {
              label: "Application Start Date",
              field: "application_start_date",
              type: "date",
            },
            {
              label: "Application End Date",
              field: "application_end_date",
              type: "date",
            },
            {
              label: "Competition Start Date",
              field: "competition_start_date",
              type: "date",
            },
            {
              label: "Competition End Date",
              field: "competition_end_date",
              type: "date",
            },
            { label: "Eligibility Criteria", field: "eligibility" },
            { label: "Reference Links", field: "reference_links" },
            { label: "Requirements", field: "requirements" },
            { label: "Payment", field: "payment" },
            { label: "Fee", field: "fee" },
          ]}
        />
        
        <AssignDialog
          open={assignDialogOpen}
          formtype="Competition"
          onClose={closeAssignDialog}
          selectedActivity={selectedActivity}
          setSuccess={setSuccess}
        />
      </div>
    </ReportShell>
  );
}
