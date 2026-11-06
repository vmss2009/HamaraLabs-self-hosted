"use client";

import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridRowParams,
} from "@mui/x-data-grid";
import { Button } from "@/components/ui/Button";
import { Slider } from "@mui/material";
import DetailViewer from "@/components/form/DetailViewer";
import { useRouter } from "next/navigation";
import { EditIcon, DeleteIcon } from "@/components/form/Icons";
import ReportShell from "@/components/form/ReportShell";
import Alert from "@/components/ui/Alert";
import AssignDialog from "@/components/form/DialogBox";
import { Course } from "@/lib/db/course/type";
import { Element, useAppAbility, useGridColumns } from "@/components/authz";

export default function CourseReport() {
  const router = useRouter();
  const ability = useAppAbility();
  const [courses, setCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<Course | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Course | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rowHeight, setRowHeight] = useState(52);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await response.json();

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
    } catch {
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

  const handleRowClick = (params: GridRowParams<Course>) => {
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleAssign = (activity: Course) => {
    setSelectedActivity(activity);
    setAssignDialogOpen(true);
  };

  const lineClamp = Math.max(1, Math.floor((rowHeight - 28) / 22));
  const clampStyle = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: lineClamp,
    overflow: "hidden",
    whiteSpace: "normal",
    wordBreak: "break-word",
    lineHeight: "22px",
    width: "100%",
  } as React.CSSProperties;

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "S.No",
      width: 100,
      renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
    },
    { field: "name", headerName: "Course Name", width: 200, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
    { field: "description", headerName: "Description", width: 250, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
    { field: "organised_by", headerName: "Organised By", width: 200, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
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
    { field: "eligibility_from", headerName: "Eligible From", width: 150, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
    { field: "eligibility_to", headerName: "Eligible To", width: 150, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
    {
      field: "requirements",
      headerName: "Requirements",
      width: 200,
      renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span>,
    },

    {
      field: "course_tags",
      headerName: "Course Tags",
      width: 200,
      renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span>,
    },
    { field: "reference_link", headerName: "Reference Link", width: 200, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },

    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 170,
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 w-full h-full">
          {ability.can("view", "CourseReport", "row.assign") && (
            <Button
              variant="default"
              color="primary"
              size="sm"
              onClick={() => handleAssign(params.row)}
            >
              Assign
            </Button>
          )}
          {ability.can("view", "CourseReport", "row.edit") && (
            <GridActionsCellItem
              key="edit"
              icon={<EditIcon />}
              label="Edit"
              onClick={() =>
                router.push(`/protected/course/form/${params.row.id}`)
              }
            />
          )}
          {ability.can("view", "CourseReport", "row.delete") && (
            <GridActionsCellItem
              key="delete"
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => handleDelete(params.row.id)}
              color="error"
            />
          )}
        </div>
      ),
    },
  ];

  const visibleColumns = useGridColumns("CourseReport", columns);

  return (
    <ReportShell>
      <div className="w-full">
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
          <Alert severity="success" className="mb-4">
            {success}
          </Alert>
        )}
        
        <div className="bg-white rounded-xl shadow-sm w-[calc(100vw-5rem)] m-10">
          <DataGrid
            rows={courses}
            columns={visibleColumns}
            loading={loading}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            rowHeight={rowHeight}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            slots={{
              toolbar: () => (
                <GridToolbarContainer className="bg-gray-50 p-2 flex flex-wrap gap-2 items-center">
                  <Element subject="CourseReport" elementKey="tool.quick-filter">
                    <GridToolbarQuickFilter sx={{ flex: 1, minWidth: 160 }} />
                  </Element>
                  <Element subject="CourseReport" elementKey="tool.column-visibility">
                    <GridToolbarColumnsButton />
                  </Element>
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Row height</span>
                    <Slider size="small" min={52} max={300} step={4} value={rowHeight}
                      onChange={(_, v) => setRowHeight(v as number)}
                      sx={{ width: 100, color: "#6366f1" }} />
                    <span className="text-xs text-gray-400 w-8 text-right">{rowHeight}</span>
                  </div>
                </GridToolbarContainer>
              ),
            }}
            sx={{
              borderRadius: "12px",
              "& .MuiDataGrid-cell": {
                alignItems: rowHeight > 52 ? "flex-start" : "center",
                paddingTop: rowHeight > 52 ? "8px" : undefined,
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
              courses.findIndex((course) => course.id === selectedRow?.id) + 1,
          } : null}
          formtype="Course"
          columns={[
            { label: "S.No", field: "index" },
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
      </div>
    </ReportShell>
  );
}
