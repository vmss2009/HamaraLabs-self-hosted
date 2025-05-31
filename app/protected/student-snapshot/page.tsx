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
import DetailViewer from "@/components/forms/DetailViewer";
import { Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel, FormLabel, TextField, Grid } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditActivityDialog from "./Edit_Activity/page";
import { getCourseColumns } from "./Courses/page";
import { getCompetitionColumns } from "./Competition/page";
import { getTinkeringActivityColumns } from "./Tinkering-activities/page";
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
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);



  const latestStatus = selectedActivity?.status?.[selectedActivity.status.length - 1]?.split(" - ")[0] || ""

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
      setIsSubmitEnabled(false); // disable initially
    }
  }, [selectedActivity]);

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);
    setIsSubmitEnabled(newStatus !== latestStatus); // enable only if different from latest
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

  const handleModifyCourse = (item: any) => {
    setSelectedActivity(item);
    setStatusType('courses');
    setStatusDialogOpen(true);
  };
  const handleModifyCompetition = (item: any) => {
    setSelectedActivity(item);
    setStatusType('competition');
    setStatusDialogOpen(true);
  };
  const handleModifyactivity = (item: any) => {
    setSelectedActivity(item);
    setStatusType('tinkering');
    setStatusDialogOpen(true);
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

  const tinkeringActivityColumns = getTinkeringActivityColumns(handleModifyactivity, handleEditTinkeringActivity, handleDeleteTinkeringActivity);
  const competitionColumns = getCompetitionColumns(handleModifyCompetition, handleDeleteCompetition)
  const courseColumns = getCourseColumns(handleModifyCourse, handleDeleteCourse);




  const handleRowClick = (params: any) => {
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  useEffect(() => {
    if (selectedRow) {
      console.log("Updated selectedRow", selectedRow);
    }
  }, [selectedRow]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRow(null);
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A';
    if (Array.isArray(value)) return value.join(', ');
    return value.toString();
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
            <label className="block text-sm font-medium text-black mb-1">
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
            <label className="block text-sm font-medium text-black mb-1">
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



        {activeTab === 'tinkering' ? (

          <DetailViewer
            drawerOpen={drawerOpen}
            closeDrawer={closeDrawer}
            selectedRow={selectedRow}
            formtype="Tinkering-Activity"
            columns={[
              { label: "ID", field: "id" },
              { label: "Activity Name", field: "name" },
              {
                label: "Subject",
                field: "subtopic.topic.subject.subject_name"
              },
              {
                label: "Topic",
                field: "subtopic.topic.topic_name"
              },
              {
                label: "Subtopic",
                field: "subtopic.subtopic_name"
              },
              { label: "Introduction", field: "introduction" },
              {
                label: "Goals",
                field: "goals"

              },
              {
                label: "Materials",
                field: "materials"

              },
              {
                label: "Instructions",
                field: "instructions"

              },
              {
                label: "Tips",
                field: "tips"

              },
              { label: "Observations",field: "observations"

              },
              {
                label: "Extensions",
                field: "extensions"
              },
              {
                label: "Resources",
                field: "resources"
              },
              {
                label: "Status",
                field: "status"
              }
            ]}
          />
        ) : activeTab === 'competition' ? (



          <DetailViewer
            drawerOpen={drawerOpen}
            closeDrawer={closeDrawer}
            selectedRow={selectedRow}
            formtype="Competition"
            columns={[
              { label: "ID", field: "id" },
              { label: "Competition Name", field: "competition.name" },
              { label: "Description", field: "competition.description" },
              { label: "Organised By", field: "competition.organised_by" },
              {
                label: "Eligibility Criteria",
                field: "competition.eligibility"
              },
              {
                label: "Requirements",
                field: "competition.requirements"
              },
              { label: "Payment", field: "competition.payment" },
              {
                label: "Fee",
                field: "competition.fee",
                // showIf: (selectedrow) => selectedRowrow.competition?.payment === "paid"
              },
              {
                label: "Application Start Date",
                field: "competition.application_start_date",
                type: "date"
              },
              {
                label: "Application End Date",
                field: "competition.application_end_date",
                type: "date"
              },
              {
                label: "Competition Start Date",
                field: "competition.competition_start_date",
                type: "date"
              },
              {
                label: "Competition End Date",
                field: "competition.competition_end_date",
                type: "date"
              },
              {
                label: "Reference Links",
                field: "competition.reference_links"
              },
              {
                label: "Status",
                field: "status"
              }
            ]}
          />

        ) : activeTab === 'courses' ? (
          <DetailViewer
            drawerOpen={drawerOpen}
            closeDrawer={closeDrawer}
            selectedRow={selectedRow}
            formtype="Course"
            columns={[
              { label: "ID", field: "id" },
              { label: "Course Name", field: "course.name" },
              { label: "Organized By", field: "course.organized_by" },
              { label: "Description", field: "course.description" },
              {
                label: "Application Start Date",
                field: "course.application_start_date",
                type: "date"
              },
              {
                label: "Application End Date",
                field: "course.application_end_date",
                type: "date"
              },
              {
                label: "Start Date",
                field: "course.course_start_date",
                type: "date"
              },
              {
                label: "End Date",
                field: "course.course_end_date",
                type: "date"
              },
              {
                label: "Eligibility_from",
                field: "course.eligibility_from"

              },
              {
                label: "Eligibility_to",
                field: "course.eligibility_to"

              },
              {
                label: "Reference Link",
                field: "course.reference_link"

              },
              {
                label: "Status",
                field: "status"
              }
            ]}
          />

        ) : null}


        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
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
                    disabled={status === latestStatus} // disable current status radio button
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