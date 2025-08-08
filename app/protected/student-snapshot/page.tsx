"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Button as MuiButton,
  Autocomplete,
  TextField,
  Checkbox,
  Box,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { Button } from "@/components/Button";
import DetailViewer from "@/components/DetailViewer";
import { Input } from "@/components/Input";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
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

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function StudentSnapshot() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [schools, setSchools] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<"cluster" | "school">(
    (searchParams.get("view") as "cluster" | "school") || "cluster"
  );

  const [clusters, setClusters] = useState<any[]>([]);
  const [selectedCluster, setSelectedCluster] = useState(
    searchParams.get("cluster") || ""
  );
  const [hubs, setHubs] = useState<any[]>([]);
  const [selectedHub, setSelectedHub] = useState(searchParams.get("hub") || "");

  const [students, setStudents] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState(
    searchParams.get("school") || ""
  );
  const [selectedStudent, setSelectedStudent] = useState(
    searchParams.get("student") || ""
  );
  const [activeTab, setActiveTab] = useState<
    "tinkering" | "competition" | "courses"
  >(
    (searchParams.get("tab") as "tinkering" | "competition" | "courses") ||
    "tinkering"
  );
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

  const [generateTADialogOpen, setGenerateTADialogOpen] = useState(false);
  const [selectedTinkeringActivities, setSelectedTinkeringActivities] = useState<any[]>([]);
  const [aspiration, setAspiration] = useState("");
  const [comments, setComments] = useState("");
  const [resources, setResources] = useState("");
  const [prompt, setPrompt] = useState(`Based on the previously completed tinkering activities by a student, his/her aspirations and his/her interests, suggest the next best tinkering activity.
The generated tinkering activity must be less/more complex than the previous tinkering activities.
It must be short, succinct, clear, concise, and easy to understand.
It must be creative, fun, engaging, intuitive, and hands-on.
If required use goals, materials, instructions, tips, observations, extensions, and resources as per the below rule.
Do not put large sentences or paragraphs. For example - goals, materials, instructions, tips, observations, extensions, and resources (each point must be less than 10 words and a maximum of 3 or 4 bullet points).`);

  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [generatedActivities, setGeneratedActivities] = useState<any[]>([]);
  const [selectedActivityIntro, setSelectedActivityIntro] = useState("");
  const [generating, setGenerating] = useState(false);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [detailedTA, setDetailedTA] = useState<any>(null);
  const [reviewSubject, setReviewSubject] = useState("");
  const [reviewTopic, setReviewTopic] = useState("");
  const [reviewSubtopic, setReviewSubtopic] = useState("");
  const [generatingDetailed, setGeneratingDetailed] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const latestStatus =
    selectedActivity?.status?.[selectedActivity.status.length - 1]?.split(
      " - "
    )[0] || "";

  const updateURLParams = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });

    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

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
    if (clusters.length > 0 && selectedCluster && !hubs.length) {
      const cluster = clusters.find((c) => c.id.toString() === selectedCluster);
      if (cluster) {
        setHubs(cluster.hubs);
      }
    }
  }, [clusters, selectedCluster, hubs.length]);

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

  useEffect(() => {
    const fetchTopicsForReview = async () => {
      if (!reviewSubject) {
        setTopics([]);
        setReviewTopic("");
        setSubtopics([]);
        setReviewSubtopic("");
        return;
      }

      try {
        const response = await fetch(`/api/topics?subjectId=${reviewSubject}`);
        if (!response.ok) {
          throw new Error("Failed to fetch topics");
        }
        const data = await response.json();
        setTopics(data);
      } catch (error) {
        console.error("Error fetching topics for review:", error);
      }
    };

    fetchTopicsForReview();
  }, [reviewSubject]);

  useEffect(() => {
    const fetchSubtopicsForReview = async () => {
      if (!reviewTopic) {
        setSubtopics([]);
        setReviewSubtopic("");
        return;
      }

      try {
        const response = await fetch(`/api/subtopics?topicId=${reviewTopic}`);
        if (!response.ok) {
          throw new Error("Failed to fetch subtopics");
        }
        const data = await response.json();
        setSubtopics(data);
      } catch (error) {
        console.error("Error fetching subtopics for review:", error);
      }
    };

    fetchSubtopicsForReview();
  }, [reviewTopic]);

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

  const fetchStudentDetails = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch student details");
      }
      const studentData = await response.json();
      setAspiration(studentData.aspiration || "");
      setComments(studentData.comments || "");
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  const handleGenerateTA = async () => {
    try {
      setGenerating(true);

      const finalPrompt = `Aspirations: ${aspiration}\nInterests: ${comments}\n${resources !== "" ? `Resources: ${resources}\nThe tinkering activity must be confined to the resource provided` : ""}\n${prompt}`;

      const response = await fetch("/api/customised-tinkering-activities/generate-tas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          previousActivities: selectedTinkeringActivities,
          prompt: finalPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate tinkering activities");
      }

      const result = await response.json();
      setGeneratedActivities(result.data);
      setGenerateTADialogOpen(false);
      setSelectionDialogOpen(true);

    } catch (error) {
      console.error("Error generating tinkering activities:", error);
      alert("Failed to generate tinkering activities. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateDetailedTA = async () => {
    try {
      setGeneratingDetailed(true);

      const response = await fetch("/api/customised-tinkering-activities/generate-ta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityIntroduction: selectedActivityIntro,
          aspiration: aspiration,
          comments: comments,
          resources: resources,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate detailed tinkering activity");
      }

      const result = await response.json();
      setDetailedTA(result.data);
      setSelectionDialogOpen(false);
      setReviewDialogOpen(true);

    } catch (error) {
      console.error("Error generating detailed tinkering activity:", error);
      alert("Failed to generate detailed tinkering activity. Please try again.");
    } finally {
      setGeneratingDetailed(false);
    }
  };

  const handleAssignTA = async () => {
    try {
      setAssigning(true);

      const baseTAResponse = await fetch("/api/tinkering-activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: detailedTA.name,
          subtopicId: parseInt(reviewSubtopic),
          introduction: detailedTA.introduction,
          goals: detailedTA.goals,
          materials: detailedTA.materials,
          instructions: detailedTA.instructions,
          tips: detailedTA.tips,
          observations: detailedTA.observations,
          extensions: detailedTA.extensions,
          resources: detailedTA.resources,
        }),
      });

      if (!baseTAResponse.ok) {
        throw new Error("Failed to create base tinkering activity");
      }

      const baseTAData = await baseTAResponse.json();
      const baseTAId = baseTAData.id;

      const formattedDate = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const customizedTAResponse = await fetch("/api/customised-tinkering-activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: baseTAId,
          student_id: selectedStudent,
          status: [`Assigned - ${formattedDate}`],
        }),
      });

      if (!customizedTAResponse.ok) {
        throw new Error("Failed to assign customized tinkering activity");
      }

      alert("Tinkering activity created and assigned successfully!");
      setReviewDialogOpen(false);

      setDetailedTA(null);
      setReviewSubject("");
      setReviewTopic("");
      setReviewSubtopic("");
      setSelectedActivityIntro("");
      setGeneratedActivities([]);

      fetchTinkeringActivities();

    } catch (error) {
      console.error("Error assigning tinkering activity:", error);
      alert("Failed to assign tinkering activity. Please try again.");
    } finally {
      setAssigning(false);
    }
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

    updateURLParams({
      view,
      cluster: "",
      hub: "",
      school: "",
      student: "",
      tab: activeTab,
    });
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
                  onChange={(e) => {
                    setSelectedCluster(e.target.value);
                    updateURLParams({
                      view: currentView,
                      cluster: e.target.value,
                      hub: "",
                      school: "",
                      student: "",
                      tab: activeTab,
                    });
                  }}
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
                  onChange={(e) => {
                    setSelectedHub(e.target.value);
                    updateURLParams({
                      view: currentView,
                      cluster: selectedCluster,
                      hub: e.target.value,
                      school: "",
                      student: "",
                      tab: activeTab,
                    });
                  }}
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
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                updateURLParams({
                  view: currentView,
                  cluster: selectedCluster,
                  hub: selectedHub,
                  school: e.target.value,
                  student: "",
                  tab: activeTab,
                });
              }}
            >
              <option value="">SELECT</option>
              {filteredSchools.map((school) => (
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
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                updateURLParams({
                  view: currentView,
                  cluster: selectedCluster,
                  hub: selectedHub,
                  school: selectedSchool,
                  student: e.target.value,
                  tab: activeTab,
                });
              }}
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
                onClick={() => {
                  setActiveTab("tinkering");
                  updateURLParams({
                    view: currentView,
                    cluster: selectedCluster,
                    hub: selectedHub,
                    school: selectedSchool,
                    student: selectedStudent,
                    tab: "tinkering",
                  });
                }}
                className="px-4 py-2 rounded-t-lg"
              >
                Student Tinkering Activities
              </Button>
              <Button
                variant={activeTab === "competition" ? "default" : "outline"}
                onClick={() => {
                  setActiveTab("competition");
                  updateURLParams({
                    view: currentView,
                    cluster: selectedCluster,
                    hub: selectedHub,
                    school: selectedSchool,
                    student: selectedStudent,
                    tab: "competition",
                  });
                }}
                className="px-4 py-2 rounded-t-lg"
              >
                Student Competitions
              </Button>

              <Button
                variant={activeTab === "courses" ? "default" : "outline"}
                onClick={() => {
                  setActiveTab("courses");
                  updateURLParams({
                    view: currentView,
                    cluster: selectedCluster,
                    hub: selectedHub,
                    school: selectedSchool,
                    student: selectedStudent,
                    tab: "courses",
                  });
                }}
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
                    <MuiButton
                      variant="contained"
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={() => {
                        if (selectedStudent) {
                          fetchStudentDetails(selectedStudent);
                        }
                        setSelectedTinkeringActivities(tinkeringActivities);
                        setGenerateTADialogOpen(true);
                      }}
                    >
                      Generate TA
                    </MuiButton>
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
              { label: "Organised By", field: "course.organised_by" },
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

        {/* Generate TA Dialog */}
        <Dialog
          open={generateTADialogOpen}
          onClose={() => setGenerateTADialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Generate Tinkering Activity</DialogTitle>
          <DialogContent>
            <div className="space-y-4 mt-4">
              {/* Tinkering Activities Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Select Tinkering Activities
                </label>

                {/* Select All Checkbox */}
                <div className="mb-3">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedTinkeringActivities.length === tinkeringActivities.length && tinkeringActivities.length > 0}
                        indeterminate={selectedTinkeringActivities.length > 0 && selectedTinkeringActivities.length < tinkeringActivities.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTinkeringActivities(tinkeringActivities);
                          } else {
                            setSelectedTinkeringActivities([]);
                          }
                        }}
                      />
                    }
                    label={`Select All (${tinkeringActivities.length} activities)`}
                    className="text-sm"
                  />
                </div>

                <Autocomplete
                  multiple
                  options={tinkeringActivities}
                  disableCloseOnSelect
                  getOptionLabel={(option: any) => option.name || ''}
                  value={selectedTinkeringActivities}
                  onChange={(_, newValue: any[]) => {
                    setSelectedTinkeringActivities(newValue);
                  }}
                  renderOption={(props, option: any, { selected }) => (
                    <Box component="li" {...props}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.name || 'Unnamed Activity'}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search tinkering activities..."
                      variant="outlined"
                    />
                  )}
                />
              </div>

              {/* Aspiration Field */}
              <div>
                <Input
                  name="aspiration"
                  label="Aspiration"
                  required
                  value={aspiration}
                  onChange={(e) => setAspiration(e.target.value)}
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Comments Field */}
              <div>
                <Input
                  name="comments"
                  label="Comments"
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Resources Field */}
              <div>
                <Input
                  name="resources"
                  label="Resources"
                  value={resources}
                  onChange={(e) => setResources(e.target.value)}
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Prompt Field */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Prompt
                </label>
                <TextField
                  multiline
                  rows={8}
                  fullWidth
                  variant="outlined"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGenerateTADialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateTA}
              variant="default"
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* TA Selection Dialog */}
        <Dialog
          open={selectionDialogOpen}
          onClose={() => setSelectionDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Select a Generated Tinkering Activity</DialogTitle>
          <DialogContent>
            <div className="space-y-4 mt-4">
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">
                  Choose one of the generated activities:
                </FormLabel>
                <RadioGroup
                  value={selectedActivityIntro}
                  onChange={(e) => setSelectedActivityIntro(e.target.value)}
                  className="mt-4"
                >
                  {generatedActivities.map((activity, index) => (
                    <FormControlLabel
                      key={index}
                      value={activity.introduction}
                      control={<Radio />}
                      label={
                        <Box className="p-3 border rounded-lg hover:bg-gray-50">
                          <Typography variant="body1" className="font-medium">
                            {activity.introduction}
                          </Typography>
                        </Box>
                      }
                      className="mb-3 ml-0"
                      sx={{
                        alignItems: 'flex-start',
                        '& .MuiFormControlLabel-label': {
                          width: '100%'
                        }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateDetailedTA}
              variant="default"
              disabled={!selectedActivityIntro || generatingDetailed}
            >
              {generatingDetailed ? "Generating..." : "Select Activity"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* TA Review Dialog */}
        <Dialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Review and Assign Tinkering Activity</DialogTitle>
          <DialogContent>
            <div className="space-y-6 mt-4">
              {detailedTA && (
                <>

                  {/* Subject/Topic/Subtopic Selection */}
                  <div className="space-y-4">
                    <Typography variant="h6" className="font-semibold">
                      Assignment Details
                    </Typography>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Subject Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={reviewSubject}
                          onChange={(e) => setReviewSubject(e.target.value)}
                        >
                          <option value="">Select Subject</option>
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id.toString()}>
                              {subject.subject_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Topic Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Topic *
                        </label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={reviewTopic}
                          onChange={(e) => setReviewTopic(e.target.value)}
                          disabled={!reviewSubject}
                        >
                          <option value="">Select Topic</option>
                          {topics.map((topic) => (
                            <option key={topic.id} value={topic.id.toString()}>
                              {topic.topic_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Subtopic Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subtopic *
                        </label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={reviewSubtopic}
                          onChange={(e) => setReviewSubtopic(e.target.value)}
                          disabled={!reviewTopic}
                        >
                          <option value="">Select Subtopic</option>
                          {subtopics.map((subtopic) => (
                            <option key={subtopic.id} value={subtopic.id.toString()}>
                              {subtopic.subtopic_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Activity Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Typography variant="h6" className="font-semibold mb-3">
                      {detailedTA.name}
                    </Typography>
                    <Typography variant="body1" className="text-gray-700 mb-4">
                      {detailedTA.introduction}
                    </Typography>

                    {/* Goals */}
                    {detailedTA.goals && detailedTA.goals.length > 0 && (
                      <div className="mb-4">
                        <Typography variant="subtitle2" className="font-medium mb-2">Goals:</Typography>
                        <ul className="list-disc ml-5">
                          {detailedTA.goals.map((goal: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600">{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Materials */}
                    {detailedTA.materials && detailedTA.materials.length > 0 && (
                      <div className="mb-4">
                        <Typography variant="subtitle2" className="font-medium mb-2">Materials:</Typography>
                        <ul className="list-disc ml-5">
                          {detailedTA.materials.map((material: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600">{material}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Instructions */}
                    {detailedTA.instructions && detailedTA.instructions.length > 0 && (
                      <div className="mb-4">
                        <Typography variant="subtitle2" className="font-medium mb-2">Instructions:</Typography>
                        <ol className="list-decimal ml-5">
                          {detailedTA.instructions.map((instruction: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600">{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Tips */}
                    {detailedTA.tips && detailedTA.tips.length > 0 && (
                      <div className="mb-4">
                        <Typography variant="subtitle2" className="font-medium mb-2">Tips:</Typography>
                        <ul className="list-disc ml-5">
                          {detailedTA.tips.map((tip: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Observations */}
                    {detailedTA.observations && detailedTA.observations.length > 0 && (
                      <div className="mb-4">
                        <Typography variant="subtitle2" className="font-medium mb-2">Observations:</Typography>
                        <ul className="list-disc ml-5">
                          {detailedTA.observations.map((observation: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600">{observation}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Extensions */}
                    {detailedTA.extensions && detailedTA.extensions.length > 0 && (
                      <div className="mb-4">
                        <Typography variant="subtitle2" className="font-medium mb-2">Extensions:</Typography>
                        <ul className="list-disc ml-5">
                          {detailedTA.extensions.map((extension: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600">{extension}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Resources */}
                    {detailedTA.resources && detailedTA.resources.length > 0 && (
                      <div className="mb-4">
                        <Typography variant="subtitle2" className="font-medium mb-2">Resources:</Typography>
                        <ul className="list-disc ml-5">
                          {detailedTA.resources.map((resource: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600">{resource}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignTA}
              variant="default"
              disabled={!reviewSubject || !reviewTopic || !reviewSubtopic || assigning}
            >
              {assigning ? "Assigning..." : "Assign"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div />}> 
      <StudentSnapshot />
    </Suspense>
  );
}
