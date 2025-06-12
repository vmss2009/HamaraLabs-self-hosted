"use client";

import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarColumnsButton,
} from "@mui/x-data-grid";
import { Button } from "@/components/ui/Button";
import DetailViewer from "@/components/forms/DetailViewer";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Alert from "@mui/material/Alert";
import AssignDialog from "@/components/forms/DialogBox";
import { Course } from "@/lib/db/course/type";

export default function CourseReport() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Course | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      let data = await response.json();

      setCourses(data);
    } catch (error) {
      setError("Error loading competitions");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
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

  const closeAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedActivity(null);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete course");
      setSuccess("Course record deleted sucessfully");
      setTimeout(() => setSuccess(null), 3000);
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleRowClick = (params: any) => {
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleAssign = (activity: Course) => {
    setSelectedActivity(activity);
    setAssignDialogOpen(true);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Course Name", width: 200 },
    { field: "description", headerName: "Description", width: 250 },
    { field: "organized_by", headerName: "Organized By", width: 200 },
    {
      field: "application_start_date",
      headerName: "App Start Date",
      width: 150,
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "application_end_date",
      headerName: "App End Date",
      width: 150,
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "course_start_date",
      headerName: "Course Start",
      width: 150,
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "course_end_date",
      headerName: "Course End",
      width: 150,
      valueFormatter: (params) => formatDate(params),
    },
    { field: "eligibility_from", headerName: "Eligible From", width: 150 },
    { field: "eligibility_to", headerName: "Eligible To", width: 150 },
    {
      field: "requirements",
      headerName: "Requirements",
      width: 200,
    },

    {
      field: "course_tags",
      headerName: "Course Tags",
      width: 200,
    },
    { field: "reference_link", headerName: "Reference Link", width: 200 },

    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 170,
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
              router.push(`/protected/course/form/${params.row.id}`)
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
    <div className="bg-gray-500 flex justify-center h-screen w-auto">
      <div className="pt-20">
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
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto w-[calc(100vw-6rem)]  m-10 ">
          <DataGrid
            rows={courses}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
            onRowClick={handleRowClick}
            sx={{
              borderRadius: "12px",
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
          formtype="Course"
          columns={[
            { label: "Name", field: "name" },
            { label: "Description", field: "description" },
            { label: "Organized By", field: "organized_by" },
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
              label: "Course Start Date",
              field: "course_start_date",
              type: "date",
            },
            {
              label: "Course End Date",
              field: "course_end_date",
              type: "date",
            },
            {
              label: "Eligibility",
              type: "compare",
              fields: [
                { label: "Eligibility From", field: "eligibility_from" },
                { label: "Eligibility To", field: "eligibility_to" },
              ],
            },
            { label: "Reference Link", field: "reference_link" },
            { label: "Requirements", field: "requirements" },
            { label: "Course Tags", field: "course_tags" },
          ]}
        />
        <AssignDialog
          open={assignDialogOpen}
          formtype="Course"
          onClose={closeAssignDialog}
          selectedActivity={selectedActivity}
          setSuccess={setSuccess}
        />
        ;
      </div>
    </div>
  );
}
