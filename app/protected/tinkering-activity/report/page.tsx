"use client";

import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridActionsCellItem,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridRowParams,
} from "@mui/x-data-grid";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { EditIcon, DeleteIcon } from "@/components/form/Icons";
import Alert from "@/components/ui/Alert";
import AssignDialog from "@/components/form/DialogBox";
import { TinkeringActivityWithSubtopic } from "@/lib/db/tinkering-activity/type";
import DetailViewer from "@/components/form/DetailViewer";
import ReportShell from "@/components/form/ReportShell";
import { TinkeringActivity } from "@/lib/db/tinkering-activity/type";

export default function TinkeringActivityReport() {
  const router = useRouter();
  const [activities, setActivities] = useState<TinkeringActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<TinkeringActivity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [missingRelationships, setMissingRelationships] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [fullActivities, setFullActivities] = useState<TinkeringActivity[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] =
    useState<TinkeringActivityWithSubtopic | null>(null);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({
      goals: false,
      materials: false,
      instructions: false,
      tips: false,
      observations: false,
      extensions: false,
      resources: false,
    });

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/tinkering-activities");
      if (!response.ok) {
        throw new Error("Failed to fetch tinkering activities");
      }

      const data = await response.json();

      setFullActivities(data);

      const updatedData = data.map(
        (item: {
          instructions?: string[];
          goals?: string[];
          materials?: string[];
          tips?: string[];
          observations?: string[];
          resources?: string[];
          extensions?: string[];
        }) => ({
          ...item,

          instructions:
            Array.isArray(item.instructions) && item.instructions.length > 0
              ? item.instructions[0].slice(0, 50) +
                (item.instructions[0].length > 50 ? "..." : "")
              : "",

          goals:
            Array.isArray(item.goals) && item.goals.length > 0
              ? item.goals[0].slice(0, 50) +
                (item.goals[0].length > 50 ? "..." : "")
              : "",

          materials:
            Array.isArray(item.materials) && item.materials.length > 0
              ? item.materials[0].slice(0, 50) +
                (item.materials[0].length > 50 ? "..." : "")
              : "",

          tips:
            Array.isArray(item.tips) && item.tips.length > 0
              ? item.tips[0].slice(0, 50) +
                (item.tips[0].length > 50 ? "..." : "")
              : "",

          observations:
            Array.isArray(item.observations) && item.observations.length > 0
              ? item.observations[0].slice(0, 50) +
                (item.observations[0].length > 50 ? "..." : "")
              : "",

          resources:
            Array.isArray(item.resources) && item.resources.length > 0
              ? item.resources[0].slice(0, 50) +
                (item.resources[0].length > 50 ? "..." : "")
              : "",

          extensions:
            Array.isArray(item.extensions) && item.extensions.length > 0
              ? item.extensions[0].slice(0, 50) +
                (item.extensions[0].length > 50 ? "..." : "")
              : "",
        })
      );

      setActivities(updatedData);

      if (data.length > 0) {
        const allMissingData = data.every((activity: Record<string, unknown>) => {
          const a = activity as { subtopic_name?: string; topic_name?: string; subject_name?: string };
          return !a.subtopic_name && !a.topic_name && !a.subject_name;
        });
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

  const handleRowClick = (params: GridRowParams<TinkeringActivity>) => {
    if (!params || !params.row) return;

    const fullRow = fullActivities.find((item) => item.id === params.row.id);

    setSelectedRow(fullRow || params.row);
    setDrawerOpen(true);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

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

      setSuccess("Tinkering-activity Record deleted sucessfully");
      setTimeout(() => setSuccess(null), 3000);
      fetchActivities();
    } catch (error) {
      console.error("Error deleting tinkering activity:", error);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };


  const handleAssign = (activity: TinkeringActivityWithSubtopic) => {
    setSelectedActivity(activity);
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

    {
      field: "name",
      headerName: "Activity Name",
      width: 200,
    },
    {
      field: "introduction",
      headerName: "Introduction",
      width: 200,
    },
    {
      field: "subtopic_name",
      headerName: "Subtopic",
      width: 200,
    },
    {
      field: "topic_name",
      headerName: "Topic",
      width: 200,
    },
    { field: "goals", headerName: "Goals", width: 200 },

    { field: "materials", headerName: "Materials", width: 200 },
    { field: "instructions", headerName: "Instructions", width: 200 },
    { field: "tips", headerName: "Tips", width: 200 },
    { field: "observations", headerName: "Observations", width: 200 },
    { field: "resources", headerName: "Resourses", width: 200 },
    { field: "extensions", headerName: "Extensions", width: 200 },

    {
      field: "subject_name",
      headerName: "Subject",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center h-full">{params.value}</div>
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
            onClick={() =>
              router.push(`/protected/tinkering-activity/form/${params.row.id}`)
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
        {missingRelationships && (
          <Alert severity="warning" className="mx-10 mb-4">
            <div className="font-medium">Incomplete Data</div>
            <div className="text-sm mt-1">
              Some tinkering activities don&apos;t have proper subject, topic, or
              subtopic associations. Please ensure you select the proper
              Subject, Topic, and Subtopic when creating activities.
            </div>
          </Alert>
        )}

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
            rows={activities}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            disableRowSelectionOnClick
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) =>
              setColumnVisibilityModel(newModel)
            }
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
                whiteSpace: "normal !important",
                wordWrap: "break-word",
                alignItems: "center",
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
              activities.findIndex(
                (activity) => activity.id === selectedRow?.id
              ) + 1,
          } : null}
          formtype="TinkeringActivity"
          columns={[
            { label: "S.No", field: "index" },
            { label: "Name", field: "name" },
            { label: "Subject", field: "subject_name" },
            { label: "Topic", field: "topic_name" },
            { label: "Subtopic", field: "subtopic_name" },
            { label: "Introduction", field: "introduction" },
            { label: "Goals", field: "goals" },
            { label: "Materials", field: "materials" },
            { label: "Instructions", field: "instructions" },
            { label: "Tips", field: "tips" },
            { label: "Observations", field: "observations" },
            { label: "Extensions", field: "extensions" },
            { label: "Resources", field: "resources" },
          ]}
        />
        
        <AssignDialog
          open={assignDialogOpen}
          formtype="Tinkering-activity"
          onClose={closeAssignDialog}
          selectedActivity={selectedActivity}
          setSuccess={setSuccess}
        />
      </div>
    </ReportShell>
  );
}
