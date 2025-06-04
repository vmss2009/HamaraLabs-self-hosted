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
} from "@mui/x-data-grid";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Alert from "@mui/material/Alert";
import AssignDialog from "@/components/forms/DialogBox";
import { TinkeringActivityWithSubtopic } from "@/lib/db/tinkering-activity/type";
import DetailViewer from "@/components/forms/DetailViewer";
import { Student } from "@/lib/db/student/type";

interface FullActivity {
  id: number;
  name: string;
  introduction?: string;
  instructions?: string[]; // or string if already truncated
  goals?: string[];
  materials?: string[];
  tips?: string[];
  observations?: string[];
  resources?: string[];
  extensions?: string[];
  subject_name?: string | null;
  topic_name?: string | null;
  subtopic_name?: string | null;
  subtopic?: any;
  created_at?: string;
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
  const [fullActivities, setFullActivities] = useState<FullActivity[]>([]);

  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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

      console.log("ActivityDAta", data);
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

      console.log("UpdatedData", updatedData);
      setActivities(updatedData);

      if (data.length > 0) {
        const allMissingData = data.every(
          (activity: any) =>
            !activity.subtopic_name &&
            !activity.topic_name &&
            !activity.subject_name
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

  const handleRowClick = (params: any) => {
    if (!params || !params.row) return;

    console.log("FullActivities", fullActivities);

    const fullRow = fullActivities.find((item) => item.id === params.row.id);

    setSelectedRow(fullRow || params.row);
    setDrawerOpen(true);
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
      if (value.subtopic_name) return value.subtopic_name;
      if (value.topic_name) return value.topic_name;
      if (value.subject_name) return value.subject_name;
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
      const formattedDate = currentDate.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const promises = selectedStudents.map((studentId) =>
        fetch("/api/customised-tinkering-activities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
            status: [`Assigned - ${formattedDate}`],
          }),
        })
      );

      await Promise.all(promises);
      setAssignDialogOpen(false);
      setSelectedStudents([]);
      setSelectedSchool("");
      setSelectedActivity(null);
      setSuccess("Tinkering activity assigned successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error assigning tinkering activity:", error);
      setAssignError("Failed to assign tinkering activity");
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
    <div className="flex justify-center items-start h-screen bg-gray-500">
      <div className="pt-20 ">
        {missingRelationships && (
          <Alert
            severity="warning"
            className="mb-4"
            sx={{
              borderRadius: "8px",
              backgroundColor: "#FFF8E1",
              border: "1px solid #FFE082",
              padding: "10px 16px",
            }}
          >
            <div className="font-medium">Incomplete Data</div>
            <div className="text-sm mt-1">
              Some tinkering activities don't have proper subject, topic, or
              subtopic associations. Please ensure you select the proper
              Subject, Topic, and Subtopic when creating activities.
            </div>
          </Alert>
        )}
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
        <div className="flex justify-center items-center h-auto w-[calc(100vw-6rem)]  m-10 bg-white rounded-xl shadow-sm">
          <DataGrid
            rows={activities}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: { paginationModel: { pageSize: 8 } },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            disableRowSelectionOnClick
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) =>
              setColumnVisibilityModel(newModel)
            }
            getRowHeight={() => "auto"}
            autoHeight
            onRowClick={handleRowClick}
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
          formtype="TinkeringActivity"
          columns={[
            { label: "ID", field: "id" },
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
        ;
      </div>
    </div>
  );
}
