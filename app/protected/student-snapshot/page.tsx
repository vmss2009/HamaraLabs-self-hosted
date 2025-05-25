"use client";

import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridActionsCellItem
} from "@mui/x-data-grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { Button } from "@/components/ui/Button";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import { Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel, FormLabel, TextField, Grid } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const TINKERING_STATUS_OPTIONS = [
  "On hold",
  "Mentor needed",
  "Started completing",
  "Ongoing",
  "Nearly completed",
  "In review",
  "Review completed",
  "TA completed"
];

const COMPETITION_STATUS_OPTIONS = [
  "On hold",
  "Mentor needed",
  "Started completing",
  "Ongoing",
  "Nearly completed",
  "In review",
  "Review completed",
  "Competition completed"
];

const COURSE_STATUS_OPTIONS = [
  "On hold",
  "Mentor neededeed",
  "Started completing",
  "Ongoing",
  "Nearly completed",
  "In review",
  "Review completed",
  "Course completed"
];

export default function StudentSnapshot() {
  const [schools, setSchools] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [activeTab, setActiveTab] = useState<'tinkering' | 'competition' | 'courses'>('tinkering');
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
  const [statusType, setStatusType] = useState<'tinkering' | 'competition' | 'courses'>('tinkering');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [subjects, setSubjects] = useState<Array<{ id: number; subject_name: string }>>([]);
  const [topics, setTopics] = useState<Array<{ id: number; topic_name: string }>>([]);
  const [subtopics, setSubtopics] = useState<Array<{ id: number; subtopic_name: string }>>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, []);

  // Fetch students when school is selected
  useEffect(() => {
    if (selectedSchool) {
      fetchStudents(selectedSchool);
    } else {
      setStudents([]);
      setSelectedStudent("");
    }
  }, [selectedSchool]);

  // Fetch data when student is selected
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

  // Fetch subjects on component mount
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

  // Fetch topics when subject changes
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
        const response = await fetch(`/api/topics?subjectId=${selectedSubject}`);
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

  // Fetch subtopics when topic changes
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
      const response = await fetch(`/api/customised-tinkering-activities/list?student_id=${selectedStudent}`);
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
      const response = await fetch(`/api/customised-competitions/list?student_id=${selectedStudent}`);
      if (!response.ok) {
        throw new Error("Failed to fetch competitions");
      }
      const customisedCompetitions = await response.json();
      console.log(customisedCompetitions);
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
      const response = await fetch(`/api/customised-courses/list?student_id=${selectedStudent}`);
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const customisedCourses = await response.json();
      console.log(customisedCourses);
      setCourses(customisedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };


  const handleModifyStatus = (item: any, type: 'tinkering' | 'competition' | 'courses') => {
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
      const latest = selectedActivity.status[selectedActivity.status.length - 1];
      const statusOnly = latest.split(" - ")[0];
      setSelectedStatus(statusOnly);
    }
  }, [selectedActivity]);

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    setSelectedStatus(event.target.value);
  };

  const formatStatusDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleStatusSubmit = async () => {
    if (!selectedActivity || !selectedStatus) {
      alert("Missing activity or status");
      return;
    }

    try {
      // Get current status array or initialize empty array
      const currentStatus = selectedActivity.status || [];

      // Format date and build updated status list
      const currentDate = new Date();
      const formattedDate = formatStatusDate(currentDate);
      const updatedStatus = [...currentStatus, `${selectedStatus} - ${formattedDate}`];

      // Determine endpoint based on statusType
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

      console.log("PATCH Endpoint:", endpoint);
      console.log("Request Body:", JSON.stringify({ status: updatedStatus }));

      // Send PATCH request
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: updatedStatus }),
      });

      const responseText = await response.text();
      console.log("Response Status:", response.status);
      console.log("Response Body:", responseText);

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status} - ${responseText}`);
      }

      // Trigger appropriate fetch to reload data
      const fetchActions: Record<string, () => void> = {
        tinkering: fetchTinkeringActivities,
        competition: fetchCompetitions,
        courses: fetchCourses,
      };

      fetchActions[statusType]?.();

      // Cleanup state
      setStatusDialogOpen(false);
      setSelectedActivity(null);
      setSelectedStatus("");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Check console for details.");
    }
  };


  const parseStatusDate = (status: string) => {
    // Extract the date part after the hyphen
    const dateMatch = status.split(' - ')[1];
    if (dateMatch) {
      // Parse the date in the format "April 17, 2025 at 06:16 PM"
      const [datePart, timePart] = dateMatch.split(' at ');
      const [month, day, year] = datePart.split(' ');
      const [time, period] = timePart.split(' ');
      const [hours, minutes] = time.split(':');

      const monthIndex = new Date(`${month} 1, 2000`).getMonth();
      const date = new Date(
        parseInt(year),
        monthIndex,
        parseInt(day.replace(',', '')),
        period === 'PM' ? parseInt(hours) + 12 : parseInt(hours),
        parseInt(minutes)
      );

      return date;
    }
    return new Date(0); // Return a very old date if no date is found
  };

  const handleEditTinkeringActivity = (activity: any) => {
    setSelectedActivity(activity);
    setEditFormData({
      name: activity.name || '',
      introduction: activity.introduction || '',
      goals: activity.goals || [],
      materials: activity.materials || [],
      instructions: activity.instructions || [],
      tips: activity.tips || [],
      observations: activity.observations || [],
      extensions: activity.extensions || [],
      resources: activity.resources || [],
    });

    // Set the selected subject, topic, and subtopic
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

  const handleArrayFieldChange = (field: string, index: number, value: string) => {
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
      [field]: [...editFormData[field], ''],
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
      const response = await fetch(`/api/customised-tinkering-activities/${selectedActivity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          subtopic_id: parseInt(selectedSubtopic),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tinkering activity');
      }

      // Refresh the data
      fetchTinkeringActivities();

      // Close the dialog
      setEditDialogOpen(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error('Error updating tinkering activity:', error);
      alert('Failed to update tinkering activity. Please try again.');
    }
  };

  const handleDeleteTinkeringActivity = async (activity: any) => {
    if (!confirm('Are you sure you want to delete this tinkering activity?')) {
      return;
    }

    try {
      const response = await fetch(`/api/customised-tinkering-activities/${activity.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tinkering activity');
      }

      // Refresh the data
      fetchTinkeringActivities();
    } catch (error) {
      console.error('Error deleting tinkering activity:', error);
      alert('Failed to delete tinkering activity. Please try again.');
    }
  };

  const handleDeleteCompetition = async (competition: any) => {
    if (!confirm('Are you sure you want to delete this competition?')) {
      return;
    }

    try {
      const response = await fetch(`/api/customised-competitions/${competition.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete competition');
      }

      // Refresh the data
      fetchCompetitions();
    } catch (error) {
      console.error('Error deleting competition:', error);
      alert('Failed to delete competition. Please try again.');
    }
  };
  const handleDeleteCourse = async (course: any) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await fetch(`/api/customised-courses/${course.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      // Refresh the data
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };


  const tinkeringActivityColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      renderCell: (params) => params.row?.id ?? "N/A",

    },

    {
      field: 'name',
      headerName: 'Activity Name',
      width: 200,
      renderCell: (params) =>
        params.value ?? "N/A",


    },
    {
      field: 'introduction',
      headerName: 'Introduction',
      width: 200,
      renderCell: (params) =>
        params.value ?? "N/A",

    },
    {
      field: 'subject',
      headerName: 'Subject',
      width: 150,
      renderCell: (params) =>
        params.row?.subtopic?.topic?.subject?.subject_name ?? 'N/A'


    },
    {
      field: 'topic',
      headerName: 'Topic',
      width: 150,
      renderCell: (params) =>
        params.row?.subtopic?.topic?.topic_name ?? 'N/A'

    },
    {
      field: 'subtopic',
      headerName: 'Subtopic',
      width: 150,
      renderCell: (params) =>
        params.row?.subtopic?.subtopic_name ?? 'N/A'

    },
    {
      field: 'status',
      headerName: 'Status',
      width: 300,
      renderCell: (params) =>
        Array.isArray(params.row?.status) && params.row.status.length > 0
          ? params.row.status[params.row.status.length - 1]
          : 'N/A',

    },
    {
      field: 'tinkering_actions',
      headerName: 'Actions',
      type: 'actions',
      width: 200,
      renderCell: (params) => (
        // <div>Charan sala is there</div>
        <div className="flex items-center justify-center space-x-2 w-full h-full">
          {/* Modify Button */}
          {/* <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-sm px-4 py-1.5 text-sm shadow transition duration-200"
           
          >
            Modify
          </button> */}
          <Button
            variant="default"
            color="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleModifyStatus(params.row, 'tinkering');
            }}
          >
            Modify Status
          </Button>

          {/* Edit Icon */}
          <GridActionsCellItem
            icon={
              <EditIcon
                sx={{
                  fontSize: 22,
                  color: '#4b5563', // Tailwind gray-600
                  transition: 'color 0.2s ease-in-out',
                  '&:hover': {
                    color: '#111827', // Tailwind gray-900
                  },
                }}
              />
            }
            label="Edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEditTinkeringActivity(params.row);
            }}
            showInMenu={false}
          />

          {/* Delete Icon */}
          <GridActionsCellItem
            icon={
              <DeleteOutlineIcon
                sx={{
                  fontSize: 22,
                  color: '#ef4444', // Tailwind red-500
                  transition: 'color 0.2s ease-in-out',
                  '&:hover': {
                    color: '#b91c1c', // Tailwind red-700
                  },
                }}
              />
            }
            label="Delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTinkeringActivity(params.row);
            }}
            showInMenu={false}
          />
        </div>


      ),
    },
  ];

  const competitionColumns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },

    {
      field: 'competition_actions',
      headerName: "Competition",
      width: 200,
      renderCell: (params) =>
        params.row?.competition?.name ?? "N/A",
    },

    {
      field: "organised_by",
      headerName: "Organised By",
      width: 180,
      renderCell: (params) =>
        params.row?.competition?.organised_by ?? "N/A",
    },

    {
      field: "status",
      headerName: "Status",
      width: 300,
      renderCell: (params) => {
        const statusArray = params.row?.status;
        return Array.isArray(statusArray) && statusArray.length > 0
          ? statusArray[statusArray.length - 1]
          : 'N/A';
      },
    },

    {
      field: "application_start_date",
      headerName: "Application Start",
      width: 200,
      renderCell: (params) => {
        const date = params.row?.competition?.application_start_date;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },

    {
      field: "application_end_date",
      headerName: "Application End",
      width: 200,
      renderCell: (params) => {
        const date = params.row?.competition?.application_end_date;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },

    {
      field: "competition_start_date",
      headerName: "Competition Start",
      width: 200,
      renderCell: (params) => {
        const date = params.row?.competition?.competition_start_date;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },

    {
      field: "competition_end_date",
      headerName: "Competition End",
      width: 200,
      renderCell: (params) => {
        const date = params.row?.competition?.competition_end_date;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },

    {
      field: "payment",
      headerName: "Payment",
      width: 150,
      renderCell: (params) =>
        params.row?.competition?.payment ?? "N/A",
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 200,
      getActions: (params) => [
        <div className="flex items-center space-x-2">
          {/* Modify Button */}
          <Button
            variant="default"
            color="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleModifyStatus(params.row, 'competition');
            }}
          >
            Modify Status
          </Button>
          {/* Delete Icon */}
          <GridActionsCellItem
            key="delete"
            icon={
              <DeleteOutlineIcon
                sx={{
                  color: '#ef4444', // red-500
                  transition: 'color 0.2s ease-in-out',
                  '&:hover': {
                    color: '#dc2626', // red-600
                  },
                }}
              />
            }
            label="Delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCourse(params.row);
            }}
            showInMenu={false}
          />
        </div>
      ],
    },
  ];
  const courseColumns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },

    {
      field: 'course_actions',
      headerName: "Course",
      width: 200,
      renderCell: (params) => params.row?.course?.name ?? "N/A",
    },

    {
      field: "organized_by",
      headerName: "Organized By",
      width: 180,
      renderCell: (params) => params.row?.course?.organized_by ?? "N/A",
    },

    {
      field: "status",
      headerName: "Status",
      width: 300,
      renderCell: (params) => {
        const statusArray = params.row?.status;
        return Array.isArray(statusArray) && statusArray.length > 0
          ? statusArray[statusArray.length - 1]
          : 'N/A';
      },
    },

    {
      field: "application_start_date",
      headerName: "Application Start",
      width: 200,
      renderCell: (params) => {
        const date = params.row?.course?.application_start_date;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },

    {
      field: "application_end_date",
      headerName: "Application End",
      width: 200,
      renderCell: (params) => {
        const date = params.row?.course?.application_end_date;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },

    {
      field: "course_start_date",
      headerName: "Course Start",
      width: 200,
      renderCell: (params) => {
        const date = params.row?.course?.course_start_date;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },

    {
      field: "course_end_date",
      headerName: "Course End",
      width: 200,
      renderCell: (params) => {
        const date = params.row?.course?.course_end_date;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },

    {
      field: "eligibility",
      headerName: "Eligibility",
      width: 250,
      renderCell: (params) => {
        const from = params.row?.course?.eligibility_from ?? "";
        const to = params.row?.course?.eligibility_to ?? "";
        return from && to ? `${from} - ${to}` : "N/A";
      },
    },

    {
      field: "reference_link",
      headerName: "Reference",
      width: 220,
      renderCell: (params) => {
        const link = params.row?.course?.reference_link;
        return link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            {link}
          </a>
        ) : "N/A";
      }

    },

    {
      field: "requirements",
      headerName: "Requirements",
      width: 250,
      renderCell: (params) => {
        const reqs = params.row?.course?.requirements ?? [];
        return reqs.length > 0 ? reqs.join(", ") : "N/A";
      },
    },

    {
      field: "course_tags",
      headerName: "Tags",
      width: 250,
      renderCell: (params) => {
        const tags = params.row?.course?.course_tags ?? [];
        return tags.length > 0 ? tags.join(", ") : "N/A";
      },
    },

    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 200,
      getActions: (params) => [
        <div className="flex items-center space-x-2">
          {/* Modify Button */}
          <Button
            variant="default"
            color="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleModifyStatus(params.row, 'courses');
            }}
          >
            Modify Status
          </Button>

          {/* Delete Icon */}
          <GridActionsCellItem
            key="delete"
            icon={
              <DeleteOutlineIcon
                sx={{
                  color: '#ef4444', // red-500
                  transition: 'color 0.2s ease-in-out',
                  '&:hover': {
                    color: '#dc2626', // red-600
                  },
                }}
              />
            }
            label="Delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCourse(params.row);
            }}
            showInMenu={false}
          />
        </div>

      ],
    },
  ];

  const handleRowClick = (params: any) => {
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRow(null);
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A';
    if (Array.isArray(value)) return value.join(', ');
    return value.toString();
  };

  const formatArrayAsBullets = (value: any) => {
    if (!value || !Array.isArray(value) || value.length === 0) return 'N/A';
    return (
      <div className="text-gray-800">
        <ul className="list-disc pl-5">
          {value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getRowClassName = (params: any) => {
    const statusArray = params.row.status;
    const latestStatus = Array.isArray(statusArray) && statusArray.length > 0
      ? statusArray[statusArray.length - 1]
      : '';

    if (activeTab === 'tinkering' && latestStatus.includes('TA completed')) {
      return 'bg-green-100';
    }
    if (activeTab === 'competition' && latestStatus.includes('Competition completed')) {
      return 'bg-green-100';
    }
    if (activeTab === 'courses' && latestStatus.includes('Course completed')) {
      return 'bg-green-100';
    }

    return '';
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

        <div className="mt-10 flex items-start space-x-4 mb-6">
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
                <option key={school.id} value={school.id}>
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
                variant={activeTab === 'tinkering' ? 'default' : 'outline'}
                onClick={() => setActiveTab('tinkering')}
                className="px-4 py-2 rounded-t-lg"
              >
                Student Tinkering Activities
              </Button>
              <Button
                variant={activeTab === 'competition' ? 'default' : 'outline'}
                onClick={() => setActiveTab('competition')}
                className="px-4 py-2 rounded-t-lg"
              >
                Student Competitions
              </Button>

              <Button
                variant={activeTab === 'courses' ? 'default' : 'outline'}
                onClick={() => setActiveTab('courses')}
                className="px-4 py-2 rounded-t-lg"
              >
                Student Courses
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 h-auto rounded-xl shadow-sm ">
          {activeTab === 'tinkering' ? (
            <DataGrid
              rows={sortedTinkeringActivities}
              columns={tinkeringActivityColumns}
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
                backgroundColor: '#f3f4f6',
                '& .MuiDataGrid-cell': {
                  color: '#1f2937',
                  paddingTop: '10px', // 👈 Add horizontal padding
                  paddingBottom: '10px',

                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f3f4f6',
                  color: '#1f2937',
                },
                '& .bg-green-100': {
                  backgroundColor: '#abebc6 !important',
                  '&:hover': {
                    backgroundColor: '#abebc6 !important',
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
          ) : activeTab === 'competition' ? (
            <DataGrid
              rows={sortedCompetitions}
              columns={competitionColumns}
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
                borderRadius: "12px",
                '& .MuiDataGrid-cell': {
                  color: '#1f2937',
                  paddingTop: '10px', // 👈 Add horizontal padding
                  paddingBottom: '10px',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f3f4f6',
                  color: '#1f2937',
                },
                '& .bg-green-100': {
                  backgroundColor: '#abebc6 !important',
                  '&:hover': {
                    backgroundColor: '#abebc6 !important',
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
                backgroundColor: '#f3f4f6',
                '& .MuiDataGrid-cell': {
                  color: '#1f2937',
                  paddingTop: '10px', // 👈 Add horizontal padding
                  paddingBottom: '10px',

                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f3f4f6',
                  color: '#1f2937',
                },
                '& .bg-green-100': {
                  backgroundColor: '#abebc6 !important',
                  '&:hover': {
                    backgroundColor: '#abebc6 !important',
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
          {selectedRow ? (
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
                {activeTab === 'tinkering'
                  ? 'Tinkering Activity Details'
                  : activeTab === 'competition'
                    ? 'Competition Details'
                    : 'Course Details'}
              </Typography>

              {activeTab === 'tinkering' ? (
                <>
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
                      Activity Name:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatValue(selectedRow.name)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Subject:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatValue(selectedRow.subtopic?.topic?.subject?.subject_name)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Topic:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatValue(selectedRow.subtopic?.topic?.topic_name)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Subtopic:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatValue(selectedRow.subtopic?.subtopic_name)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Introduction:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatValue(selectedRow.introduction)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Goals:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.goals)}
                    </div>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Materials:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.materials)}
                    </div>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Instructions:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.instructions)}
                    </div>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Tips:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.tips)}
                    </div>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Observations:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.observations)}
                    </div>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Extensions:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.extensions)}
                    </div>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Resources:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.resources)}
                    </div>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Status:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.status)}
                    </div>
                  </Box>
                </>
              ) : activeTab === 'competition' ? (
                <div className="">
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
                      Competition Name:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatValue(selectedRow.competition?.name)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Description:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatValue(selectedRow.competition?.description)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Organised By:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatValue(selectedRow.competition?.organised_by)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Eligibility Criteria:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.competition?.eligibility)}
                    </div>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Requirements:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.competition?.requirements)}
                    </div>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Payment:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatValue(selectedRow.competition?.payment)}
                    </Typography>
                  </Box>

                  {selectedRow.competition?.payment === "paid" && (
                    <Box sx={{ marginBottom: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                        Fee:
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#1f2937" }}>
                        {formatValue(selectedRow.competition?.fee)}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Application Start Date:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatDate(selectedRow.competition?.application_start_date)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Application End Date:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatDate(selectedRow.competition?.application_end_date)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Competition Start Date:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatDate(selectedRow.competition?.competition_start_date)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Competition End Date:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatDate(selectedRow.competition?.competition_end_date)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Reference Links:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.competition?.reference_links)}
                    </div>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Status:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.status)}
                    </div>
                  </Box>
                </div>
              ) : activeTab === 'courses' ? (
                <>
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
                      Course Name:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatValue(selectedRow.course?.name)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>

                      organized_by
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatValue(selectedRow.course?.organized_by)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Description:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatValue(selectedRow.course?.description)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Application Start Date
                    </Typography>
                    <div className="text-gray-800">
                      {formatDate(selectedRow.course?.application_start_date)}
                    </div>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Application End Date
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatDate(selectedRow.course?.application_end_date)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Start Date:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatDate(selectedRow.course?.course_start_date)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      End Date:
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {formatDate(selectedRow.course?.course_end_date)}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Eligibility
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1f2937" }}>
                      {selectedRow.course?.eligibility_from && selectedRow.course?.eligibility_to
                        ? `${formatValue(selectedRow.course.eligibility_from)} - ${formatValue(selectedRow.course.eligibility_to)}`
                        : "N/A"}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Reference link
                    </Typography>
                    {selectedRow.course?.reference_link ? (
                      <Typography variant="body1" sx={{ color: "#1f2937" }}>
                        <a
                          href={selectedRow.course.reference_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#2563eb", textDecoration: "underline" }} // Tailwind blue-600
                        >
                          {selectedRow.course.reference_link}
                        </a>
                      </Typography>
                    ) : (
                      <Typography variant="body1" sx={{ color: "#1f2937" }}>
                        N/A
                      </Typography>
                    )}
                  </Box>




                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                      Status:
                    </Typography>
                    <div className="text-gray-800">
                      {formatArrayAsBullets(selectedRow.status)}
                    </div>
                  </Box>
                </>
              ) : null}
            </Box>
          ) : (
            <Typography variant="body1" sx={{ color: "#1f2937" }}>No data available</Typography>
          )}
        </Drawer>

        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
          <DialogTitle>Modify Status</DialogTitle>
          <DialogContent>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Select Status</FormLabel>
              <RadioGroup value={selectedStatus} onChange={handleStatusChange}>
                {statusOptions
                  .filter(status => status !== getLatestStatus(selectedActivity))
                  .map((status) => (
                    <FormControlLabel
                      key={status}
                      value={status}
                      control={<Radio />}
                      label={status}
                    />
                  ))}
              </RadioGroup>


              {getLatestStatus(selectedActivity) && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Current status: <strong>{getLatestStatus(selectedActivity)}</strong>
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
              disabled={!selectedStatus}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Tinkering Activity</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Activity Name"
                  fullWidth
                  value={editFormData.name || ''}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    label="Subject"
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id.toString()}>
                        {subject.subject_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Topic</InputLabel>
                  <Select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    label="Topic"
                    disabled={!selectedSubject}
                  >
                    {topics.map((topic) => (
                      <MenuItem key={topic.id} value={topic.id.toString()}>
                        {topic.topic_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Subtopic</InputLabel>
                  <Select
                    value={selectedSubtopic}
                    onChange={(e) => setSelectedSubtopic(e.target.value)}
                    label="Subtopic"
                    disabled={!selectedTopic}
                  >
                    {subtopics.map((subtopic) => (
                      <MenuItem key={subtopic.id} value={subtopic.id.toString()}>
                        {subtopic.subtopic_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Introduction"
                  fullWidth
                  multiline
                  rows={3}
                  value={editFormData.introduction || ''}
                  onChange={(e) => handleEditFormChange('introduction', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Goals</Typography>
                {editFormData.goals?.map((goal: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                    <TextField
                      fullWidth
                      value={goal}
                      onChange={(e) => handleArrayFieldChange('goals', index, e.target.value)}
                    />
                    <Button
                      variant="outline"
                      color="error"
                      onClick={() => handleRemoveArrayItem('goals', index)}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handleAddArrayItem('goals')}
                  className="mt-2"
                >
                  Add Goal
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Materials</Typography>
                {editFormData.materials?.map((material: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                    <TextField
                      fullWidth
                      value={material}
                      onChange={(e) => handleArrayFieldChange('materials', index, e.target.value)}
                    />
                    <Button
                      variant="outline"
                      color="error"
                      onClick={() => handleRemoveArrayItem('materials', index)}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handleAddArrayItem('materials')}
                  className="mt-2"
                >
                  Add Material
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Instructions</Typography>
                {editFormData.instructions?.map((instruction: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                    <TextField
                      fullWidth
                      value={instruction}
                      onChange={(e) => handleArrayFieldChange('instructions', index, e.target.value)}
                    />
                    <Button
                      variant="outline"
                      color="error"
                      onClick={() => handleRemoveArrayItem('instructions', index)}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handleAddArrayItem('instructions')}
                  className="mt-2"
                >
                  Add Instruction
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Tips</Typography>
                {editFormData.tips?.map((tip: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                    <TextField
                      fullWidth
                      value={tip}
                      onChange={(e) => handleArrayFieldChange('tips', index, e.target.value)}
                    />
                    <Button
                      variant="outline"
                      color="error"
                      onClick={() => handleRemoveArrayItem('tips', index)}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handleAddArrayItem('tips')}
                  className="mt-2"
                >
                  Add Tip
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Observations</Typography>
                {editFormData.observations?.map((observation: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                    <TextField
                      fullWidth
                      value={observation}
                      onChange={(e) => handleArrayFieldChange('observations', index, e.target.value)}
                    />
                    <Button
                      variant="outline"
                      color="error"
                      onClick={() => handleRemoveArrayItem('observations', index)}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handleAddArrayItem('observations')}
                  className="mt-2"
                >
                  Add Observation
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Extensions</Typography>
                {editFormData.extensions?.map((extension: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                    <TextField
                      fullWidth
                      value={extension}
                      onChange={(e) => handleArrayFieldChange('extensions', index, e.target.value)}
                    />
                    <Button
                      variant="outline"
                      color="error"
                      onClick={() => handleRemoveArrayItem('extensions', index)}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handleAddArrayItem('extensions')}
                  className="mt-2"
                >
                  Add Extension
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Resources</Typography>
                {editFormData.resources?.map((resource: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                    <TextField
                      fullWidth
                      value={resource}
                      onChange={(e) => handleArrayFieldChange('resources', index, e.target.value)}
                    />
                    <Button
                      variant="outline"
                      color="error"
                      onClick={() => handleRemoveArrayItem('resources', index)}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handleAddArrayItem('resources')}
                  className="mt-2"
                >
                  Add Resource
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleEditSubmit}
              variant="default"
              color="primary"
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
} 