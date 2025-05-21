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
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function CourseReport() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      let data = await response.json();

    

      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
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

  const formatValue = (value: any): string => {
    if (!value) return "N/A";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Course Name", width: 200 },
    { field: "description", headerName: "Description", width: 250 },
    { field: "organized_by", headerName: "Organized By", width: 200 },
    { field: "application_start_date", headerName: "App Start Date", width: 150 },
    { field: "application_end_date", headerName: "App End Date", width: 150 },
    { field: "course_start_date", headerName: "Course Start", width: 150 },
    { field: "course_end_date", headerName: "Course End", width: 150 },
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
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => router.push(`/protected/course/form/${params.row.id}`)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteOutlineIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
          color="error"
        />,
      ],
    },
  ];


  return (
    <div className="bg-gray-500 flex justify-center h-screen w-auto">
      <div className="pt-20 pl-20">
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto ">
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
              <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}>
                Course Details
              </Typography>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Name:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.name)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Description:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.description)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Organized By:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.organized_by)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Application Start Date:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.application_start_date)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Application End Date:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.application_end_date)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Course Start Date:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.course_start_date)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Course End Date:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.course_end_date)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Eligibility From:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.eligibility_from)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Eligibility To:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.eligibility_to)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Reference Link:
                </Typography>
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatValue(selectedRow.reference_link)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Requirements:
                </Typography>
                {Array.isArray(selectedRow.requirements) ? (
                  (selectedRow.requirements as string[]).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))
                ) : (
                  <Typography>{formatValue(selectedRow.requirements)}</Typography>
                )}

              </Box>

              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4b5563" }}>
                  Course Tags:
                </Typography>
                 {Array.isArray(selectedRow.course_tags) ? (
                  (selectedRow.course_tags as string[]).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))
                ) : (
                  <Typography>{formatValue(selectedRow.course_tags)}</Typography>
                )}

               </Box>


            </Box>
          ) : (
            <Typography variant="body1">No course selected.</Typography>
          )}
        </Drawer>
      </div>
    </div>
  );
}
