"use client";

import { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridActionsCellItem, GridToolbarQuickFilter, GridToolbarContainer, GridToolbarColumnsButton } from "@mui/x-data-grid";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DetailViewer from "@/components/DetailViewer";
import AssignDialog from "@/components/DialogBox";
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
  const [selectedActivity, setSelectedActivity] = useState<Competition | null>(null);

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

  const handleRowClick = (params: any) => {
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
    } catch (error) {
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
    { field: "id", headerName: "ID", width: 100 },
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
            icon={<DeleteOutlineIcon />}
            label="Delete"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          />,
        ];
      },
    },
  ];

  return (
    <div className="flex justify-center items-start w-screen bg-gray-500">
      <div className="pt-20 ">
        {error && (
          <Alert
            severity="error"
            className="mb-4"
            sx={{
              borderRadius: "8px",
              backgroundColor: "#FFEBEE",
              border: "1px solid #FFCDD2",
              padding: "10px 16px",
            }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            className="mb-2 ml-7 mr-7"
            sx={{
              borderRadius: "8px",
              backgroundColor: "#E3F2E8",
              border: "1px solid #A5D6A7",
              padding: "10px 16px",
            }}
          >
            {success}
          </Alert>
        )}
        <div className="bg-white rounded-xl shadow-sm ">
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
              "& .MuiDataGrid-cell": {
                color: "#1f2937",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f3f4f6",
                color: "#1f2937",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f9fafb",
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
        <DetailViewer
          drawerOpen={drawerOpen}
          closeDrawer={closeDrawer}
          selectedRow={selectedRow}
          formtype="Competition"
          columns={[
            { label: "ID", field: "id" },
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
        ;
      </div>
    </div>
  );
}
