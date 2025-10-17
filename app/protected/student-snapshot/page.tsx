"use client";

import { useState, useEffect, Suspense, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DataGrid,
  GridColumnVisibilityModel,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarColumnsButton,
} from "@mui/x-data-grid";
import Modal from "@/components/form/Modal";
import { Button as UIButton } from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import DetailViewer from "@/components/form/DetailViewer";
import SearchableSelect from "@/components/form/SearchableSelect";
import { Input } from "@/components/form/Input";
import { EditActivityDialog } from "./tinkering-activity/tinkering-activity-edit-form/edit";
import { getCourseColumns } from "./course/columns";
import { getCompetitionColumns } from "./competition/columns";
import { getTinkeringActivityColumns } from "./tinkering-activity/columns";
import { getTaskColumns, TaskSnapshotRow } from "./tasks/columns";
import { EditCompetitionDialog } from "./competition/competition-edit-form/edit";
import { EditCourseDialog } from "./course/course-edit-form/edit";

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


// Types for snapshot page
interface School { id: number; name: string }
interface ClusterSchool { id: number; name: string }
interface Hub { id: number; hub_school: ClusterSchool; spokes: ClusterSchool[] }
interface Cluster { id: string | number; hubs: Hub[] }
interface Student { id: string | number; first_name?: string; last_name?: string; name?: string }
interface SnapshotItem { id: string | number; status: string[]; [key: string]: unknown }
interface EditFormData {
  name: string;
  introduction: string;
  goals: string[];
  materials: string[];
  instructions: string[];
  tips: string[];
  observations: string[];
  extensions: string[];
  resources: string[];
  comments: string;
  attachments: string[];
}
interface TinkeringActivitySelection extends SnapshotItem {
  name?: string;
  introduction?: string;
  goals?: string[];
  materials?: string[];
  instructions?: string[];
  tips?: string[];
  observations?: string[];
  extensions?: string[];
  resources?: string[];
  comments?: string;
  subtopic?: { id: number; topic?: { id: number; subject?: { id: number } } };
}

function StudentSnapshot() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prevent state updates before mount or after unmount
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [schools, setSchools] = useState<School[]>([]);
  const [currentView, setCurrentView] = useState<"cluster" | "school">(
    (searchParams.get("view") as "cluster" | "school") || "school"
  );

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState(
    searchParams.get("cluster") || ""
  );
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [selectedHub, setSelectedHub] = useState(searchParams.get("hub") || "");

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSchool, setSelectedSchool] = useState(
    searchParams.get("school") || ""
  );
  const [selectedStudent, setSelectedStudent] = useState(
    searchParams.get("student") || ""
  );
  const [activeTab, setActiveTab] = useState<
    "tinkering" | "competition" | "courses" | "tasks"
  >(
    (searchParams.get("tab") as
      | "tinkering"
      | "competition"
      | "courses"
      | "tasks") || "tinkering"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tinkeringActivities, setTinkeringActivities] = useState<SnapshotItem[]>([]);
  const [competitions, setCompetitions] = useState<SnapshotItem[]>([]);
  const [courses, setCourses] = useState<SnapshotItem[]>([]);
  const [tasks, setTasks] = useState<TaskSnapshotRow[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<SnapshotItem | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusType, setStatusType] = useState<
    "tinkering" | "competition" | "courses"
  >("tinkering");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [compEditDialogOpen, setCompEditDialogOpen] = useState(false);
  const [courseEditDialogOpen, setCourseEditDialogOpen] = useState(false);
  const [initialSimpleComments, setInitialSimpleComments] = useState("");
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: "",
    introduction: "",
    goals: [],
    materials: [],
    instructions: [],
    tips: [],
    observations: [],
    extensions: [],
    resources: [],
    comments: "",
    attachments: [],
  });
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
  // Track original snapshot attachment URLs for tinkering activity edit so we can compute keep list
  const [editingSnapshotOriginalUrls, setEditingSnapshotOriginalUrls] = useState<string[]>([]);
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
  const [selectedTinkeringActivities, setSelectedTinkeringActivities] = useState<SnapshotItem[]>([]);
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
  const [generatedActivities, setGeneratedActivities] = useState<EditFormData[]>([]);
  const [selectedActivityIntro, setSelectedActivityIntro] = useState("");
  const [generating, setGenerating] = useState(false);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [detailedTA, setDetailedTA] = useState<EditFormData | null>(null);
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
        if (isMounted.current) setClusters(clustersData);

        const schoolsResponse = await fetch("/api/schools");
        if (!schoolsResponse.ok) {
          throw new Error("Failed to fetch schools");
        }
        const schoolsData = await schoolsResponse.json();
        if (isMounted.current) setSchools(schoolsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        if (isMounted.current)
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

  // Removed duplicate initial fetchSchools to avoid double fetch on mount

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
      setTasks([]);
    }
  }, [selectedSchool]);

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
      if (isMounted.current) setSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
      if (isMounted.current) setError("Failed to load schools");
    }
  };

  const fetchStudents = async (schoolId: string) => {
    try {
      const response = await fetch(`/api/students?school_id=${schoolId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      if (isMounted.current) setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      if (isMounted.current) setError("Failed to load students");
    }
  };

  const fetchTinkeringActivities = useCallback(async () => {
    try {
      if (isMounted.current) setLoading(true);
      const response = await fetch(
        `/api/customised-tinkering-activities/list?student_id=${selectedStudent}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tinkering activities");
      }
      const data = await response.json();
      if (isMounted.current) setTinkeringActivities(data);
    } catch (error) {
      console.error("Error fetching tinkering activities:", error);
      if (isMounted.current) setError("Failed to load tinkering activities");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [selectedStudent]);

  const fetchCompetitions = useCallback(async () => {
    try {
      if (isMounted.current) setLoading(true);
      const response = await fetch(
        `/api/customised-competitions/list?student_id=${selectedStudent}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch competitions");
      }
      const customisedCompetitions = await response.json();
      if (isMounted.current) setCompetitions(customisedCompetitions);
    } catch (error) {
      console.error("Error fetching competitions:", error);
      if (isMounted.current) setError("Failed to load competitions");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [selectedStudent]);

  const fetchCourses = useCallback(async () => {
    try {
      if (isMounted.current) setLoading(true);
      const response = await fetch(
        `/api/customised-courses/list?student_id=${selectedStudent}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const customisedCourses = await response.json();
      if (isMounted.current) setCourses(customisedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      if (isMounted.current) setError("Failed to load courses");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [selectedStudent]);

  const fetchTasks = useCallback(async () => {
    if (!selectedStudent) {
      setTasks([]);
      return;
    }
    try {
      if (isMounted.current) setLoading(true);
      const params = new URLSearchParams({
        view: "assigned",
        studentId: selectedStudent,
        excludeSelfCreated: "true",
      });
      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const studentTasks = await response.json();
      if (isMounted.current) setTasks(studentTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      if (isMounted.current) setError("Failed to load tasks");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [selectedStudent]);

  useEffect(() => {
    if (selectedStudent) {
      const fetchActions: Record<string, () => void> = {
        tinkering: fetchTinkeringActivities,
        competition: fetchCompetitions,
        courses: fetchCourses,
        tasks: fetchTasks,
      };

      fetchActions[activeTab]?.();
    }
  }, [
    selectedStudent,
    activeTab,
    fetchTinkeringActivities,
    fetchCompetitions,
    fetchCourses,
    fetchTasks,
  ]);

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
          name: detailedTA?.name ?? "",
          subtopicId: parseInt(reviewSubtopic),
          introduction: detailedTA?.introduction ?? "",
          goals: detailedTA?.goals ?? [],
          materials: detailedTA?.materials ?? [],
          instructions: detailedTA?.instructions ?? [],
          tips: detailedTA?.tips ?? [],
          observations: detailedTA?.observations ?? [],
          extensions: detailedTA?.extensions ?? [],
          resources: detailedTA?.resources ?? [],
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

  const getLatestStatus = (item: SnapshotItem | null) => {
    const statusArray = item?.status;
    if (Array.isArray(statusArray) && statusArray.length > 0) {
      return statusArray[statusArray.length - 1];
    }
    return null;
  };

  useEffect(() => {
    if (selectedActivity && Array.isArray(selectedActivity.status) && selectedActivity.status.length > 0) {
      const latest = selectedActivity.status[selectedActivity.status.length - 1];
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
        tasks: fetchTasks,
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

  const handleEditTinkeringActivity = (activity: TinkeringActivitySelection) => {
    setSelectedActivity(activity);
    // Prepopulate attachments from both attachments[] and snapshot_attachments URLs
    const urlsFromArray = Array.isArray((activity as any).attachments) ? ((activity as any).attachments as string[]) : [];
    const urlsFromSnapshots = Array.isArray((activity as any).snapshot_attachments)
      ? ((activity as any).snapshot_attachments as any[]).map((a) => String(a?.url)).filter(Boolean)
      : [];
    const urlSet = new Set<string>([...urlsFromArray, ...urlsFromSnapshots]);

    // Store original snapshot attachment URLs separately for pruning computation
    setEditingSnapshotOriginalUrls(urlsFromSnapshots);

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
      comments: (activity as any).comments || "",
      attachments: Array.from(urlSet),
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

  const handleEditFormChange = (field: keyof EditFormData, value: string | string[]) => {
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
    const newArray = [...(editFormData[field as keyof EditFormData] as string[])];
    newArray[index] = value;
    setEditFormData({
      ...editFormData,
      [field]: newArray,
    });
  };

  const handleAddArrayItem = (field: string) => {
    setEditFormData({
      ...editFormData,
      [field]: [...(editFormData[field as keyof EditFormData] as string[]), ""],
    });
  };

  const handleRemoveArrayItem = (field: string, index: number) => {
    const newArray = [...(editFormData[field as keyof EditFormData] as string[])];
    newArray.splice(index, 1);
    setEditFormData({
      ...editFormData,
      [field]: newArray,
    });
  };

  const handleEditSubmit = async (uploadedMeta?: Array<{ url: string; filename?: string; type?: string; size?: number }>) => {
    if (!selectedActivity) return;

    try {
      const uploadedUrls = Array.isArray(uploadedMeta) ? uploadedMeta.map(m => String(m.url)).filter(Boolean) : [];
      const mergedAttachments = Array.from(new Set<string>([...(editFormData.attachments || []), ...uploadedUrls]));

      // Compute keep list for existing snapshot attachments (exclude removed ones). Newly uploaded snapshot attachments
      // are created after the update (POST /attachments) so they don't need to be in keep list for this prune step.
      const keepSnapshotAttachmentUrls = editingSnapshotOriginalUrls.filter(u => (editFormData.attachments || []).includes(u));

      const response = await fetch(
        `/api/customised-tinkering-activities/${selectedActivity.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editFormData,
            attachments: mergedAttachments,
            subtopic_id: parseInt(selectedSubtopic),
            comments: editFormData.comments,
            keepSnapshotAttachmentUrls,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update tinkering activity");
      }

      // Save snapshot attachments (if any) after successful update
      if (Array.isArray(uploadedMeta) && uploadedMeta.length > 0 && selectedActivity) {
        try {
          const res2 = await fetch(`/api/customised-tinkering-activities/${selectedActivity.id}/attachments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attachments: uploadedMeta }),
          });
          if (!res2.ok) {
            const t = await res2.text();
            console.error("Failed to save attachments:", res2.status, t);
          }
        } catch (e) {
          console.error("Error saving attachments:", e);
        }
      }

      fetchTinkeringActivities();

      setEditDialogOpen(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error("Error updating tinkering activity:", error);
      alert("Failed to update tinkering activity. Please try again.");
    }
  };

  const handleDeleteTinkeringActivity = async (activity: SnapshotItem) => {
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

  const handleEditCompetition = (competition: SnapshotItem) => {
    setSelectedActivity(competition);
    setInitialSimpleComments((competition as any).comments || "");
    setCompEditDialogOpen(true);
  };

  const handleEditCourse = (course: SnapshotItem) => {
    setSelectedActivity(course);
    setInitialSimpleComments((course as any).comments || "");
    setCourseEditDialogOpen(true);
  };

  const handleDeleteCompetition = async (competition: SnapshotItem) => {
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

  const handleModifyCourse = (item: SnapshotItem) => {
    setSelectedActivity(item);
    setStatusType("courses");
    setStatusDialogOpen(true);
  };
  const handleModifyCompetition = (item: SnapshotItem) => {
    setSelectedActivity(item);
    setStatusType("competition");
    setStatusDialogOpen(true);
  };
  const handleModifyactivity = (item: SnapshotItem) => {
    setSelectedActivity(item);
    setStatusType("tinkering");
    setStatusDialogOpen(true);
  };
  const handleDeleteCourse = async (course: SnapshotItem) => {
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

  const formatTaskDueDate = useCallback((value: string | null) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString();
  }, []);

  const handleTaskStatusChange = useCallback(
    async (task: TaskSnapshotRow, status: "IN_PROGRESS" | "COMPLETED") => {
      try {
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          throw new Error("Failed to update task status");
        }
        fetchTasks();
      } catch (error) {
        console.error("Error updating task status:", error);
        alert("Failed to update task status. Please try again.");
      }
    },
    [fetchTasks]
  );

  const tinkeringActivityColumns = (getTinkeringActivityColumns as any)(
    handleModifyactivity as any,
    handleEditTinkeringActivity as any,
    handleDeleteTinkeringActivity as any
  ) as any;
  const competitionColumns = (getCompetitionColumns as any)(
    handleModifyCompetition as any,
    handleEditCompetition as any,
    handleDeleteCompetition as any
  ) as any;
  const courseColumns = (getCourseColumns as any)(
    handleModifyCourse as any,
    handleEditCourse as any,
    handleDeleteCourse as any
  ) as any;
  const taskColumns = useMemo(
    () => getTaskColumns(handleTaskStatusChange, formatTaskDueDate),
    [handleTaskStatusChange, formatTaskDueDate]
  );

  const handleRowClick = (params: { row: Record<string, unknown> }) => {
    if (activeTab === "tasks") {
      return;
    }
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRow(null);
  };

  const getRowClassName = (params: { row: { status?: string[] | string } }) => {
    const statusValue = params.row.status;
    let latestStatus = "";
    if (Array.isArray(statusValue) && statusValue.length > 0) {
      latestStatus = statusValue[statusValue.length - 1];
    } else if (typeof statusValue === "string") {
      latestStatus = statusValue;
    }

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
    if (activeTab === "tasks" && latestStatus === "COMPLETED") {
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

  const sortedTasks = useMemo(() => {
    const toTime = (value: string | null) => {
      if (!value) return Number.POSITIVE_INFINITY;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? Number.POSITIVE_INFINITY : parsed.getTime();
    };
    return [...tasks].sort((a, b) => toTime(a.dueDate) - toTime(b.dueDate));
  }, [tasks]);

  const filteredSchools =
    currentView === "cluster" && selectedHub
      ? schools.filter((school) => {
        const hub = hubs.find((h) => h.id.toString() === selectedHub);
        if (hub) {
          return (
            school.id === hub.hub_school.id ||
            hub.spokes.some((spoke: ClusterSchool) => spoke.id === school.id)
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
            type="error"
            className="mb-4"
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

  <div className="mt-4 flex items-start space-x-4 mb-6 w-[calc(100vw-6rem)] mx-auto">
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
                    {clusters.map((cluster: any) => (
                    <option key={cluster.id} value={cluster.id.toString()}>
                      {(cluster as any).name}
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

  <div className="mb-6 w-[calc(100vw-6rem)] mx-auto">
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
                Tinkering Activities
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
                Competitions
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
                Courses
              </Button>
              <Button
                variant={activeTab === "tasks" ? "default" : "outline"}
                onClick={() => {
                  setActiveTab("tasks");
                  updateURLParams({
                    view: currentView,
                    cluster: selectedCluster,
                    hub: selectedHub,
                    school: selectedSchool,
                    student: selectedStudent,
                    tab: "tasks",
                  });
                }}
                className="px-4 py-2 rounded-t-lg"
              >
                Tasks
              </Button>
            </div>
          </div>
        </div>

        <div className="w-[calc(100vw-6rem)] mx-auto my-10">
          <div className="bg-gray-50 rounded-xl shadow-sm ">
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
              getRowId={(row: any) => row.id}
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
                    <UIButton
                      variant="default"
                      size="sm"
                      className="ml-2"
                      onClick={() => {
                        if (selectedStudent) {
                          fetchStudentDetails(selectedStudent);
                        }
                        setSelectedTinkeringActivities(tinkeringActivities);
                        setGenerateTADialogOpen(true);
                      }}
                    >
                      Generate TA
                    </UIButton>
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
              getRowId={(row: any) => row.id}
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
          ) : activeTab === "courses" ? (
            <DataGrid
              rows={sortedCourses}
              columns={courseColumns}
              loading={loading}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
              getRowId={(row: any) => row.id}
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
          ) : (
            <DataGrid
              rows={sortedTasks}
              columns={taskColumns as any}
              loading={loading}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
              getRowId={(row: any) => row.id}
              autoHeight
              onRowClick={() => {}}
              getRowClassName={getRowClassName as any}
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
        </div>

        {/* Edit dialogs for Competition and Course */}
        <EditCompetitionDialog
          open={compEditDialogOpen}
            onClose={() => setCompEditDialogOpen(false)}
            initialComments={initialSimpleComments}
            initialAttachments={Array.isArray((selectedActivity as any)?.attachments) ? ((selectedActivity as any).attachments as string[]) : []}
            initialAttachmentMetas={Array.isArray((selectedActivity as any)?.snapshot_attachments) ? ((selectedActivity as any).snapshot_attachments as any[]).map((a) => ({ url: a?.url, filename: a?.filename })) : []}
            competitionId={selectedActivity?.id ?? null}
            onSubmit={async (uploadedMeta, commentsValue, allUrls, snapshotUrls) => {
              if (!selectedActivity) return;
              try {
                const res = await fetch(`/api/customised-competitions/${selectedActivity.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ comments: commentsValue, attachments: allUrls, keepSnapshotAttachmentUrls: snapshotUrls }),
                });
                if (!res.ok) {
                  const t = await res.text();
                  throw new Error(`Failed to update competition: ${res.status} ${t}`);
                }
                // Persist newly uploaded snapshot attachments (if any) so they show up in sidebar detail viewer
                if (Array.isArray(uploadedMeta) && uploadedMeta.length > 0) {
                  try {
                    const res2 = await fetch(`/api/customised-competitions/${selectedActivity.id}/attachments`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ attachments: uploadedMeta }),
                    });
                    if (!res2.ok) {
                      const t2 = await res2.text();
                      console.error('Failed to save competition attachments:', res2.status, t2);
                    }
                  } catch (e) {
                    console.error('Error saving competition attachments:', e);
                  }
                }
                setCompEditDialogOpen(false);
                setSelectedActivity(null);
                fetchCompetitions();
              } catch (e) {
                console.error(e);
                alert('Failed to save changes for competition');
              }
            }}
          />

        <EditCourseDialog
            open={courseEditDialogOpen}
            onClose={() => setCourseEditDialogOpen(false)}
            initialComments={initialSimpleComments}
            initialAttachments={Array.isArray((selectedActivity as any)?.attachments) ? ((selectedActivity as any).attachments as string[]) : []}
            initialAttachmentMetas={Array.isArray((selectedActivity as any)?.snapshot_attachments) ? ((selectedActivity as any).snapshot_attachments as any[]).map((a) => ({ url: a?.url, filename: a?.filename })) : []}
            courseId={selectedActivity?.id ?? null}
            onSubmit={async (uploadedMeta, commentsValue, allUrls, snapshotUrls) => {
              if (!selectedActivity) return;
              try {
                const res = await fetch(`/api/customised-courses/${selectedActivity.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ comments: commentsValue, attachments: allUrls, keepSnapshotAttachmentUrls: snapshotUrls }),
                });
                if (!res.ok) {
                  const t = await res.text();
                  throw new Error(`Failed to update course: ${res.status} ${t}`);
                }
                // Persist newly uploaded snapshot attachments (if any)
                if (Array.isArray(uploadedMeta) && uploadedMeta.length > 0) {
                  try {
                    const res2 = await fetch(`/api/customised-courses/${selectedActivity.id}/attachments`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ attachments: uploadedMeta }),
                    });
                    if (!res2.ok) {
                      const t2 = await res2.text();
                      console.error('Failed to save course attachments:', res2.status, t2);
                    }
                  } catch (e) {
                    console.error('Error saving course attachments:', e);
                  }
                }
                setCourseEditDialogOpen(false);
                setSelectedActivity(null);
                fetchCourses();
              } catch (e) {
                console.error(e);
                alert('Failed to save changes for course');
              }
            }}
          />

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
              attachment_links: Array.isArray((selectedRow as any)?.snapshot_attachments)
                ? ((selectedRow as any).snapshot_attachments as any[]).map((a) => ({ url: a?.url, filename: a?.filename }))
                : [],
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
              { label: "Introduction", 
                field: "introduction" 
              },
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
              { label: "Comments", field: "comments" },
              { label: "Files", type: "links", field: "attachment_links" },
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
              attachment_links: Array.isArray((selectedRow as any)?.snapshot_attachments)
                ? ((selectedRow as any).snapshot_attachments as any[]).map((a) => ({ url: a?.url, filename: a?.filename }))
                : [],
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
              { label: "Comments", field: "comments" },
              { label: "Files", type: "links", field: "attachment_links" },
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
              attachment_links: Array.isArray((selectedRow as any)?.snapshot_attachments)
                ? ((selectedRow as any).snapshot_attachments as any[]).map((a) => ({ url: a?.url, filename: a?.filename }))
                : [],
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
              { label: "Comments", field: "comments" },
              { label: "Files", type: "links", field: "attachment_links" },
            ]}
          />
        ) : null}

          <Modal
            open={statusDialogOpen}
            onClose={() => setStatusDialogOpen(false)}
            title="Modify Status"
            footer={
              <>
                <UIButton onClick={() => setStatusDialogOpen(false)} variant="outline">
                  Cancel
                </UIButton>
                <UIButton onClick={handleStatusSubmit} variant="default" disabled={!isSubmitEnabled}>
                  Submit
                </UIButton>
              </>
            }
          >
            <div className="mt-2">
              <div className="text-sm font-semibold mb-2">Select Status</div>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <label key={status} className="flex items-center gap-3">
                    <input
                      type="radio"
                      className="h-4 w-4 text-blue-700"
                      name="status"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={handleStatusChange}
                      disabled={status === latestStatus}
                    />
                    <span className="text-gray-800">{status}</span>
                  </label>
                ))}
              </div>

              {selectedActivity && getLatestStatus(selectedActivity) && (
                <div className="text-sm text-gray-600 mt-2">
                  Current status: <strong>{getLatestStatus(selectedActivity)}</strong>
                </div>
              )}
            </div>
          </Modal>

        <EditActivityDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSubmit={handleEditSubmit}
          editFormData={editFormData}
          handleEditFormChange={(field, value) => handleEditFormChange(field as any, value)}
          handleArrayFieldChange={(field, index, value) => handleArrayFieldChange(field as any, index, value)}
          handleAddArrayItem={(field) => handleAddArrayItem(field as any)}
          handleRemoveArrayItem={(field, index) => handleRemoveArrayItem(field as any, index)}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          selectedSubtopic={selectedSubtopic}
          setSelectedSubtopic={setSelectedSubtopic}
          subjects={subjects}
          topics={topics}
          subtopics={subtopics}
          activityId={(selectedActivity as any)?.id as string}
          initialAttachmentMetas={Array.isArray((selectedActivity as any)?.snapshot_attachments) ? ((selectedActivity as any).snapshot_attachments as any[]).map((a) => ({ url: a?.url, filename: a?.filename })) : []}
        />

        {/* Generate TA Dialog */}
        <Modal
          open={generateTADialogOpen}
          onClose={() => setGenerateTADialogOpen(false)}
          title="Generate Tinkering Activity"
          size="lg"
          footer={
            <>
              <UIButton onClick={() => setGenerateTADialogOpen(false)} variant="outline">
                Cancel
              </UIButton>
              <UIButton onClick={handleGenerateTA} variant="default" disabled={generating}>
                {generating ? "Generating..." : "Generate"}
              </UIButton>
            </>
          }
        >
            <div className="space-y-4 mt-4">
              {/* Tinkering Activities Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Select Tinkering Activities
                </label>
                {/* Select All Checkbox */}
                <div className="mb-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-600"
                      checked={selectedTinkeringActivities.length === tinkeringActivities.length && tinkeringActivities.length > 0}
                      ref={(el) => {
                        if (el) el.indeterminate = selectedTinkeringActivities.length > 0 && selectedTinkeringActivities.length < tinkeringActivities.length;
                      }}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTinkeringActivities(tinkeringActivities);
                        } else {
                          setSelectedTinkeringActivities([]);
                        }
                      }}
                    />
                    <span>
                      Select All ({tinkeringActivities.length} activities)
                    </span>
                  </label>
                </div>

                <div className="w-full">
                  <SearchableSelect<string>
                    label="Activities"
                    options={tinkeringActivities.map((a) => ({
                      value: String((a as any).id),
                      label: String((a as any).name ?? "Unnamed Activity"),
                    }))}
                    value={selectedTinkeringActivities.map((a) => String((a as any).id))}
                    onChange={(vals) => {
                      const list = (Array.isArray(vals) ? vals : vals ? [vals] : []) as string[];
                      const ids = new Set(list);
                      setSelectedTinkeringActivities(
                        tinkeringActivities.filter((a) => ids.has(String((a as any).id)))
                      );
                    }}
                    multiple
                    placeholder="Search and select activities..."
                  />
                </div>
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
                <textarea
                  rows={8}
                  className="w-full rounded-md border border-gray-300 p-3 text-black"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>
        </Modal>

        {/* TA Selection Dialog */}
        <Modal
          open={selectionDialogOpen}
          onClose={() => setSelectionDialogOpen(false)}
          title="Select a Generated Tinkering Activity"
          size="lg"
          footer={
            <>
              <UIButton onClick={() => setSelectionDialogOpen(false)} variant="outline">
                Cancel
              </UIButton>
              <UIButton
                onClick={handleGenerateDetailedTA}
                variant="default"
                disabled={!selectedActivityIntro || generatingDetailed}
              >
                {generatingDetailed ? "Generating..." : "Select Activity"}
              </UIButton>
            </>
          }
        >
<div className="space-y-4 mt-4">
              <div className="text-sm font-semibold">Choose one of the generated activities:</div>
              <div className="mt-2 space-y-2">
                {generatedActivities.map((activity, index) => (
                  <label key={index} className="flex items-start gap-3">
                    <input
                      type="radio"
                      className="mt-1 h-4 w-4 text-blue-700"
                      name="generatedActivity"
                      value={activity.introduction}
                      checked={selectedActivityIntro === activity.introduction}
                      onChange={(e) => setSelectedActivityIntro(e.target.value)}
                    />
                    <div className="p-3 border rounded-lg hover:bg-gray-50 w-full">
                      <div className="font-medium text-gray-900">
                        {activity.introduction}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
        </Modal>

        {/* TA Review Dialog */}
        <Modal
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          title="Review and Assign Tinkering Activity"
          size="xl"
          footer={
            <>
              <UIButton onClick={() => setReviewDialogOpen(false)} variant="outline">
                Cancel
              </UIButton>
              <UIButton
                onClick={handleAssignTA}
                variant="default"
                disabled={!reviewSubject || !reviewTopic || !reviewSubtopic || assigning}
              >
                {assigning ? "Assigning..." : "Assign"}
              </UIButton>
            </>
          }
        >
            <div className="space-y-6 mt-4">
              {detailedTA && (
                <>

                  {/* Subject/Topic/Subtopic Selection */}
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-gray-900">Assignment Details</div>

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
                    <div className="text-lg font-semibold text-gray-900 mb-3">
                      {detailedTA.name}
                    </div>
                    <div className="text-gray-700 mb-4">
                      {detailedTA.introduction}
                    </div>

                    {/* Goals */}
                    {detailedTA.goals && detailedTA.goals.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-gray-800 mb-2">Goals:</div>
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
                        <div className="text-sm font-semibold text-gray-800 mb-2">Materials:</div>
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
                        <div className="text-sm font-semibold text-gray-800 mb-2">Instructions:</div>
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
                        <div className="text-sm font-semibold text-gray-800 mb-2">Tips:</div>
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
                        <div className="text-sm font-semibold text-gray-800 mb-2">Observations:</div>
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
                        <div className="text-sm font-semibold text-gray-800 mb-2">Extensions:</div>
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
                        <div className="text-sm font-semibold text-gray-800 mb-2">Resources:</div>
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
        </Modal>
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
