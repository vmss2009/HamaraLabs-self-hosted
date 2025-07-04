"use client";

import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColumnVisibilityModel,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarColumnsButton,
} from "@mui/x-data-grid";
import {
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { Button } from "@/components/Button";
import DetailViewer from "@/components/DetailViewer";
import { EditActivityDialog } from "./tinkering-activity/tinkering-activity-edit-form/edit";
import { getCourseColumns } from "./course/columns";
import { getCompetitionColumns } from "./competition/columns";
import { getTinkeringActivityColumns } from "./tinkering-activity/columns";

const TINKERING_STATUS_OPTIONS = [
  "On hold",
  "Mentor needed",
  "Started completing",
  "Ongoing",
  "Nearly completed",
  "In review",
  "Review completed",
  "TA completed",
];

const COMPETITION_STATUS_OPTIONS = [
  "On hold",
  "Mentor needed",
  "Started completing",
  "Ongoing",
  "Nearly completed",
  "In review",
  "Review completed",
  "Competition completed",
];

const COURSE_STATUS_OPTIONS = [
  "On hold",
  "Mentor neededeed",
  "Started completing",
  "Ongoing",
  "Nearly completed",
  "In review",
  "Review completed",
  "Course completed",
];

export default function StudentSnapshot() {
  const [schools, setSchools] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<"cluster" | "school">(
    "cluster"
  );

  const [clusters, setClusters] = useState<any[]>([]);
  const [selectedCluster, setSelectedCluster] = useState("");
  const [hubs, setHubs] = useState<any[]>([]);
  const [selectedHub, setSelectedHub] = useState("");

  const [students, setStudents] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [activeTab, setActiveTab] = useState<
    "tinkering" | "competition" | "courses"
  >("tinkering");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tinkeringActivities, setTinkeringActivities] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusType, setStatusType] = useState<
    "tinkering" | "competition" | "courses"
  >("tinkering");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [subjects, setSubjects] = useState<
    Array<{ id: number; subject_name: string }>
  >([]);
  const [topics, setTopics] = useState<
    Array<{ id: number; topic_name: string }>
  >([]);
  const [subtopics, setSubtopics] = useState<
    Array<{ id: number; subtopic_name: string }>
  >([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
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

  const [
    columnVisibilityCompetitionModel,
    setColumnVisibilitycompetitionModel,
  ] = useState<GridColumnVisibilityModel>({
    reference_links: false,
    requirements: false,
    description: false,
  });

  const latestStatus =
    selectedActivity?.status?.[selectedActivity.status.length - 1]?.split(
      " - "
    )[0] || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clustersResponse = await fetch("/api/cluster");
        if (!clustersResponse.ok) {
          throw new Error("Failed to fetch clusters");
        }
        const clustersData = await clustersResponse.json();
        setClusters(clustersData);

        const schoolsResponse = await fetch("/api/schools");
        if (!schoolsResponse.ok) {
          throw new Error("Failed to fetch schools");
        }
        const schoolsData = await schoolsResponse.json();
        setSchools(schoolsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError("Failed to load initial data. Please try again later.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (currentView === "cluster" && selectedCluster) {
      const cluster = clusters.find((c) => c.id.toString() === selectedCluster);
      if (cluster) {
        setHubs(cluster.hubs);
        setSelectedHub("");
        setSelectedSchool("");
        setStudents([]);
      } else {
        setHubs([]);
        setSelectedHub("");
        setSelectedSchool("");
        setStudents([]);
      }
    } else if (currentView === "cluster" && !selectedCluster) {
      setHubs([]);
      setSelectedHub("");
      setSelectedSchool("");
      setStudents([]);
    }
  }, [selectedCluster, clusters, currentView]);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      fetchStudents(selectedSchool);
    } else {
      setStudents([]);
      setSelectedStudent("");
    }
  }, [selectedSchool]);

  useEffect(() => {
    if (selectedStudent) {
      const fetchActions: Record<string, () => void> = {
        tinkering: fetchTinkeringActivities,
        competition: fetchCompetitions,
        courses: fetchCourses,
      };

      fetchActions[activeTab]?.();
    }
  }, [selectedStudent, activeTab]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("/api/subjects");
        if (!response.ok) {
          throw new Error("Failed to fetch subjects");
        }
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedSubject) {
        setTopics([]);
        setSelectedTopic("");
        setSubtopics([]);
        setSelectedSubtopic("");
        return;
      }

      try {
        const response = await fetch(
          `/api/topics?subjectId=${selectedSubject}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch topics");
        }
        const data = await response.json();
        setTopics(data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [selectedSubject]);

  useEffect(() => {
    const fetchSubtopics = async () => {
      if (!selectedTopic) {
        setSubtopics([]);
        setSelectedSubtopic("");
        return;
      }

      try {
        const response = await fetch(`/api/subtopics?topicId=${selectedTopic}`);
        if (!response.ok) {
          throw new Error("Failed to fetch subtopics");
        }
        const data = await response.json();
        setSubtopics(data);
      } catch (error) {
        console.error("Error fetching subtopics:", error);
      }
    };

    fetchSubtopics();
  }, [selectedTopic]);

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
      setError("Failed to load schools");
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
      setError("Failed to load students");
    }
  };

  const fetchTinkeringActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/customised-tinkering-activities/list?student_id=${selectedStudent}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tinkering activities");
      }
      const data = await response.json();
      setTinkeringActivities(data);
    } catch (error) {
      console.error("Error fetching tinkering activities:", error);
      setError("Failed to load tinkering activities");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/customised-competitions/list?student_id=${selectedStudent}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch competitions");
      }
      const customisedCompetitions = await response.json();
      setCompetitions(customisedCompetitions);
    } catch (error) {
      console.error("Error fetching competitions:", error);
      setError("Failed to load competitions");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/customised-courses/list?student_id=${selectedStudent}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const customisedCourses = await response.json();
      setCourses(customisedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleModifyStatus = (
    item: any,
    type: "tinkering" | "competition" | "courses"
  ) => {
    setSelectedActivity(item);
    setStatusType(type);
    setStatusDialogOpen(true);
  };

  const STATUS_OPTIONS_MAP = {
    tinkering: TINKERING_STATUS_OPTIONS,
    competition: COMPETITION_STATUS_OPTIONS,
    courses: COURSE_STATUS_OPTIONS,
  };
  const statusOptions = STATUS_OPTIONS_MAP[statusType] || [];

  const getLatestStatus = (item: any) => {
    const statusArray = item?.status;
    if (Array.isArray(statusArray) && statusArray.length > 0) {
      return statusArray[statusArray.length - 1];
    }
    return null;
  };

  useEffect(() => {
    if (selectedActivity?.status?.length > 0) {
      const latest =
        selectedActivity.status[selectedActivity.status.length - 1];
      const statusOnly = latest.split(" - ")[0];
      setSelectedStatus(statusOnly);
      setIsSubmitEnabled(false);
    }
  }, [selectedActivity]);

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);
    setIsSubmitEnabled(newStatus !== latestStatus);
  };

  const formatStatusDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleStatusSubmit = async () => {
    if (!selectedActivity || !selectedStatus) {
      alert("Missing activity or status");
      return;
    }

    try {
      const currentStatus = selectedActivity.status || [];

      const currentDate = new Date();
      const formattedDate = formatStatusDate(currentDate);
      const updatedStatus = [
        ...currentStatus,
        `${selectedStatus} - ${formattedDate}`,
      ];

      let endpoint = "";
      if (statusType === "tinkering") {
        endpoint = `/api/customised-tinkering-activities/${selectedActivity.id}`;
      } else if (statusType === "competition") {
        endpoint = `/api/customised-competitions/${selectedActivity.id}`;
      } else if (statusType === "courses") {
        endpoint = `/api/customised-courses/${selectedActivity.id}`;
      } else {
        throw new Error("Invalid status type");
      }

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: updatedStatus }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Failed to update status: ${response.status} - ${responseText}`
        );
      }

      const fetchActions: Record<string, () => void> = {
        tinkering: fetchTinkeringActivities,
        competition: fetchCompetitions,
        courses: fetchCourses,
      };

      fetchActions[statusType]?.();

      setStatusDialogOpen(false);
      setSelectedActivity(null);
      setSelectedStatus("");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Check console for details.");
    }
  };

  const parseStatusDate = (status: string) => {
    const dateMatch = status.split(" - ")[1];
    if (dateMatch) {
      const [datePart, timePart] = dateMatch.split(" at ");
      const [month, day, year] = datePart.split(" ");
      const [time, period] = timePart.split(" ");
      const [hours, minutes] = time.split(":");

      const monthIndex = new Date(`${month} 1, 2000`).getMonth();
      const date = new Date(
        parseInt(year),
        monthIndex,
        parseInt(day.replace(",", "")),
        period === "PM" ? parseInt(hours) + 12 : parseInt(hours),
        parseInt(minutes)
      );

      return date;
    }
    return new Date(0);
  };

  const handleEditTinkeringActivity = (activity: any) => {
    setSelectedActivity(activity);
    setEditFormData({
      name: activity.name || "",
      introduction: activity.introduction || "",
      goals: activity.goals || [],
      materials: activity.materials || [],
      instructions: activity.instructions || [],
      tips: activity.tips || [],
      observations: activity.observations || [],
      extensions: activity.extensions || [],
      resources: activity.resources || [],
    });

    if (activity.subtopic?.topic?.subject) {
      setSelectedSubject(activity.subtopic.topic.subject.id.toString());
    }
    if (activity.subtopic?.topic) {
      setSelectedTopic(activity.subtopic.topic.id.toString());
    }
    if (activity.subtopic) {
      setSelectedSubtopic(activity.subtopic.id.toString());
    }

    setEditDialogOpen(true);
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData({
      ...editFormData,
      [field]: value,
    });
  };

  const handleArrayFieldChange = (
    field: string,
    index: number,
    value: string
  ) => {
    const newArray = [...editFormData[field]];
    newArray[index] = value;
    setEditFormData({
      ...editFormData,
      [field]: newArray,
    });
  };

  const handleAddArrayItem = (field: string) => {
    setEditFormData({
      ...editFormData,
      [field]: [...editFormData[field], ""],
    });
  };

  const handleRemoveArrayItem = (field: string, index: number) => {
    const newArray = [...editFormData[field]];
    newArray.splice(index, 1);
    setEditFormData({
      ...editFormData,
      [field]: newArray,
    });
  };

  const handleEditSubmit = async () => {
    if (!selectedActivity) return;

    try {
      const response = await fetch(
        `/api/customised-tinkering-activities/${selectedActivity.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editFormData,
            subtopic_id: parseInt(selectedSubtopic),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update tinkering activity");
      }

      fetchTinkeringActivities();

      setEditDialogOpen(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error("Error updating tinkering activity:", error);
      alert("Failed to update tinkering activity. Please try again.");
    }
  };

  const handleDeleteTinkeringActivity = async (activity: any) => {
    if (!confirm("Are you sure you want to delete this tinkering activity?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/customised-tinkering-activities/${activity.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete tinkering activity");
      }

      fetchTinkeringActivities();
    } catch (error) {
      console.error("Error deleting tinkering activity:", error);
      alert("Failed to delete tinkering activity. Please try again.");
    }
  };

  const handleDeleteCompetition = async (competition: any) => {
    if (!confirm("Are you sure you want to delete this competition?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/customised-competitions/${competition.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete competition");
      }

      fetchCompetitions();
    } catch (error) {
      console.error("Error deleting competition:", error);
      alert("Failed to delete competition. Please try again.");
    }
  };

  const handleModifyCourse = (item: any) => {
    setSelectedActivity(item);
    setStatusType("courses");
    setStatusDialogOpen(true);
  };
  const handleModifyCompetition = (item: any) => {
    setSelectedActivity(item);
    setStatusType("competition");
    setStatusDialogOpen(true);
  };
  const handleModifyactivity = (item: any) => {
    setSelectedActivity(item);
    setStatusType("tinkering");
    setStatusDialogOpen(true);
  };
  const handleDeleteCourse = async (course: any) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const response = await fetch(`/api/customised-courses/${course.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course. Please try again.");
    }
  };

  const tinkeringActivityColumns = getTinkeringActivityColumns(
    handleModifyactivity,
    handleEditTinkeringActivity,
    handleDeleteTinkeringActivity
  );
  const competitionColumns = getCompetitionColumns(
    handleModifyCompetition,
    handleDeleteCompetition
  );
  const courseColumns = getCourseColumns(
    handleModifyCourse,
    handleDeleteCourse
  );

  const handleRowClick = (params: any) => {
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRow(null);
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return "N/A";
    if (Array.isArray(value)) return value.join(", ");
    return value.toString();
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getRowClassName = (params: any) => {
    const statusArray = params.row.status;
    const latestStatus =
      Array.isArray(statusArray) && statusArray.length > 0
        ? statusArray[statusArray.length - 1]
        : "";

    if (activeTab === "tinkering" && latestStatus.includes("TA completed")) {
      return "bg-green-100";
    }
    if (
      activeTab === "competition" &&
      latestStatus.includes("Competition completed")
    ) {
      return "bg-green-100";
    }
    if (activeTab === "courses" && latestStatus.includes("Course completed")) {
      return "bg-green-100";
    }

    return "";
  };

  const getLatestStatusDate = (statusArray: string[]) => {
    if (!Array.isArray(statusArray) || statusArray.length === 0) {
      return new Date(0);
    }
    const latestStatus = statusArray[statusArray.length - 1];
    return parseStatusDate(latestStatus);
  };

  const sortedTinkeringActivities = [...tinkeringActivities].sort((a, b) => {
    const dateA = getLatestStatusDate(a.status);
    const dateB = getLatestStatusDate(b.status);
    return dateB.getTime() - dateA.getTime();
  });

  const sortedCourses = [...courses].sort((a, b) => {
    const dateA = getLatestStatusDate(a.status);
    const dateB = getLatestStatusDate(b.status);
    return dateB.getTime() - dateA.getTime();
  });

  const sortedCompetitions = [...competitions].sort((a, b) => {
    const dateA = getLatestStatusDate(a.status);
    const dateB = getLatestStatusDate(b.status);
    return dateB.getTime() - dateA.getTime();
  });

  const filteredSchools =
    currentView === "cluster" && selectedHub
      ? schools.filter((school) => {
          const hub = hubs.find((h) => h.id.toString() === selectedHub);
          if (hub) {
            return (
              school.id === hub.hub_school.id ||
              hub.spokes.some((spoke: any) => spoke.id === school.id)
            );
          }
          return false;
        })
      : currentView === "school"
      ? schools
      : [];

  const handleViewChange = (view: "cluster" | "school") => {
    setCurrentView(view);
    setSelectedCluster("");
    setSelectedHub("");
    setSelectedSchool("");
    setSelectedStudent("");
    setStudents([]);
  };

  return (
    <div className="bg-slate-400 h-screen  w-screen ">
      <div className=" p-6 ">
        {error && (
          <Alert
            severity="error"
            className="mb-4"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <div className="flex justify-center items-center space-x-4 mb-6">
          <Button
            variant={currentView === "cluster" ? "default" : "outline"}
            onClick={() => handleViewChange("cluster")}
          >
            Cluster View
          </Button>
          <Button
            variant={currentView === "school" ? "default" : "outline"}
            onClick={() => handleViewChange("school")}
          >
            School View
          </Button>
        </div>

        <div className="mt-4 flex items-start space-x-4 mb-6">
          {/* Cluster and Hub Dropdowns (Visible in Cluster View) */}
          {currentView === "cluster" && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Cluster:
                </label>
                <select
                  className="w-64 p-2 border rounded-md text-black"
                  value={selectedCluster}
                  onChange={(e) => setSelectedCluster(e.target.value)}
                >
                  <option value="">SELECT</option>
                  {clusters.map((cluster) => (
                    <option key={cluster.id} value={cluster.id.toString()}>
                      {cluster.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Hub:
                </label>
                <select
                  className="w-64 p-2 border rounded-md text-black"
                  value={selectedHub}
                  onChange={(e) => setSelectedHub(e.target.value)}
                  disabled={!selectedCluster}
                >
                  <option value="">SELECT</option>
                  {hubs.map((hub) => (
                    <option key={hub.id} value={hub.id.toString()}>
                      {hub.hub_school.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              School:
            </label>
            <select
              className="w-64 p-2 border rounded-md text-black"
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
            >
              <option value="">SELECT</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id.toString()}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Student:
            </label>
            <select
              className="w-64 p-2 border rounded-md text-black"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={!selectedSchool}
            >
              <option value="">SELECT</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div>
            <div className="flex space-x-4">
              <Button
                variant={activeTab === "tinkering" ? "default" : "outline"}
                onClick={() => setActiveTab("tinkering")}
                className="px-4 py-2 rounded-t-lg"
              >
                Student Tinkering Activities
              </Button>
              <Button
                variant={activeTab === "competition" ? "default" : "outline"}
                onClick={() => setActiveTab("competition")}
                className="px-4 py-2 rounded-t-lg"
              >
                Student Competitions
              </Button>

              <Button
                variant={activeTab === "courses" ? "default" : "outline"}
                onClick={() => setActiveTab("courses")}
                className="px-4 py-2 rounded-t-lg"
              >
                Student Courses
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 h-auto rounded-xl shadow-sm ">
          {activeTab === "tinkering" ? (
            <DataGrid
              rows={sortedTinkeringActivities}
              columns={tinkeringActivityColumns}
              loading={loading}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={(newModel) =>
                setColumnVisibilityModel(newModel)
              }
              getRowId={(row) => row.id}
              autoHeight
              onRowClick={handleRowClick}
              getRowClassName={getRowClassName}
              sx={{
                borderRadius: "20px",
                backgroundColor: "#f3f4f6",
                "& .MuiDataGrid-cell": {
                  color: "#1f2937",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f3f4f6",
                  color: "#1f2937",
                },
                "& .bg-green-100": {
                  backgroundColor: "#abebc6 !important",
                  "&:hover": {
                    backgroundColor: "#abebc6 !important",
                  },
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
          ) : activeTab === "competition" ? (
            <DataGrid
              rows={sortedCompetitions}
              columns={competitionColumns}
              loading={loading}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
              columnVisibilityModel={columnVisibilityCompetitionModel}
              onColumnVisibilityModelChange={(newModel) =>
                setColumnVisibilitycompetitionModel(newModel)
              }
              getRowId={(row) => row.id}
              autoHeight
              onRowClick={handleRowClick}
              getRowClassName={getRowClassName}
              sx={{
                borderRadius: "12px",
                "& .MuiDataGrid-cell": {
                  color: "#1f2937",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f3f4f6",
                  color: "#1f2937",
                },
                "& .bg-green-100": {
                  backgroundColor: "#abebc6 !important",
                  "&:hover": {
                    backgroundColor: "#abebc6 !important",
                  },
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
          ) : (
            <DataGrid
              rows={sortedCourses}
              columns={courseColumns}
              loading={loading}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
              autoHeight
              onRowClick={handleRowClick}
              getRowClassName={getRowClassName}
              sx={{
                borderRadius: "20px",
                backgroundColor: "#f3f4f6",
                "& .MuiDataGrid-cell": {
                  color: "#1f2937",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f3f4f6",
                  color: "#1f2937",
                },
                "& .bg-green-100": {
                  backgroundColor: "#abebc6 !important",
                  "&:hover": {
                    backgroundColor: "#abebc6 !important",
                  },
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
          )}
        </div>

        {activeTab === "tinkering" ? (
          <DetailViewer
            drawerOpen={drawerOpen}
            closeDrawer={closeDrawer}
            selectedRow={{
              ...selectedRow,
              index:
                tinkeringActivities.findIndex(
                  (activity) => activity.id === selectedRow?.id
                ) + 1,
            }}
            formtype="Tinkering-Activity"
            columns={[
              { label: "S.No", field: "index" },
              { label: "Activity Name", field: "name" },
              {
                label: "Subject",
                field: "subtopic.topic.subject.subject_name",
              },
              {
                label: "Topic",
                field: "subtopic.topic.topic_name",
              },
              {
                label: "Subtopic",
                field: "subtopic.subtopic_name",
              },
              { label: "Introduction", field: "introduction" },
              {
                label: "Goals",
                field: "goals",
              },
              {
                label: "Materials",
                field: "materials",
              },
              {
                label: "Instructions",
                field: "instructions",
              },
              {
                label: "Tips",
                field: "tips",
              },
              { label: "Observations", field: "observations" },
              {
                label: "Extensions",
                field: "extensions",
              },
              {
                label: "Resources",
                field: "resources",
              },
              {
                label: "Status",
                field: "status",
              },
            ]}
          />
        ) : activeTab === "competition" ? (
          <DetailViewer
            drawerOpen={drawerOpen}
            closeDrawer={closeDrawer}
            selectedRow={{
              ...selectedRow,
              index:
                competitions.findIndex(
                  (competition) => competition.id === selectedRow?.id
                ) + 1,
            }}
            formtype="Competition"
            columns={[
              { label: "S.No", field: "index" },
              { label: "Competition Name", field: "competition.name" },
              { label: "Description", field: "competition.description" },
              { label: "Organised By", field: "competition.organised_by" },
              {
                label: "Eligibility Criteria",
                field: "competition.eligibility",
              },
              {
                label: "Requirements",
                field: "competition.requirements",
              },
              { label: "Payment", field: "competition.payment" },
              {
                label: "Fee",
                field: "competition.fee",
              },
              {
                label: "Application Start Date",
                field: "competition.application_start_date",
                type: "date",
              },
              {
                label: "Application End Date",
                field: "competition.application_end_date",
                type: "date",
              },
              {
                label: "Competition Start Date",
                field: "competition.competition_start_date",
                type: "date",
              },
              {
                label: "Competition End Date",
                field: "competition.competition_end_date",
                type: "date",
              },
              {
                label: "Reference Links",
                field: "competition.reference_links",
              },
              {
                label: "Status",
                field: "status",
              },
            ]}
          />
        ) : activeTab === "courses" ? (
          <DetailViewer
            drawerOpen={drawerOpen}
            closeDrawer={closeDrawer}
            selectedRow={{
              ...selectedRow,
              index:
                courses.findIndex((course) => course.id === selectedRow?.id) +
                1,
            }}
            formtype="Course"
            columns={[
              { label: "S.No", field: "index" },
              { label: "Course Name", field: "course.name" },
              { label: "Organized By", field: "course.organized_by" },
              { label: "Description", field: "course.description" },
              {
                label: "Application Start Date",
                field: "course.application_start_date",
                type: "date",
              },
              {
                label: "Application End Date",
                field: "course.application_end_date",
                type: "date",
              },
              {
                label: "Start Date",
                field: "course.course_start_date",
                type: "date",
              },
              {
                label: "End Date",
                field: "course.course_end_date",
                type: "date",
              },
              {
                label: "Eligibility_from",
                field: "course.eligibility_from",
              },
              {
                label: "Eligibility_to",
                field: "course.eligibility_to",
              },
              {
                label: "Reference Link",
                field: "course.reference_link",
              },
              {
                label: "Status",
                field: "status",
              },
            ]}
          />
        ) : null}

        <Dialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
        >
          <DialogTitle>Modify Status</DialogTitle>
          <DialogContent>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Select Status</FormLabel>
              <RadioGroup value={selectedStatus} onChange={handleStatusChange}>
                {statusOptions.map((status) => (
                  <FormControlLabel
                    key={status}
                    value={status}
                    control={<Radio />}
                    label={status}
                    disabled={status === latestStatus}
                  />
                ))}
              </RadioGroup>

              {getLatestStatus(selectedActivity) && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Current status:{" "}
                  <strong>{getLatestStatus(selectedActivity)}</strong>
                </Typography>
              )}
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleStatusSubmit}
              variant="default"
              color="primary"
              disabled={!isSubmitEnabled}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        <EditActivityDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSubmit={handleEditSubmit}
          editFormData={editFormData}
          handleEditFormChange={handleEditFormChange}
          handleArrayFieldChange={handleArrayFieldChange}
          handleAddArrayItem={handleAddArrayItem}
          handleRemoveArrayItem={handleRemoveArrayItem}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          selectedSubtopic={selectedSubtopic}
          setSelectedSubtopic={setSelectedSubtopic}
          subjects={subjects}
          topics={topics}
          subtopics={subtopics}
        />
      </div>
    </div>
  );
}