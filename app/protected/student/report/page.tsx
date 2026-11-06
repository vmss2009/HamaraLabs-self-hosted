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
import { Slider } from "@mui/material";
import { useRouter } from "next/navigation";
import { EditIcon, DeleteIcon } from "@/components/form/Icons";
import ReportShell from "@/components/form/ReportShell";
import DetailViewer from "@/components/form/DetailViewer";
import Alert from "@/components/ui/Alert";
import { StudentWithSchool } from "@/lib/db/student/type";
import { Element, useAppAbility, useGridColumns } from "@/components/authz";

export default function StudentReport() {
  const router = useRouter();
  const ability = useAppAbility();
  const [students, setStudents] =useState<StudentWithSchool[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<StudentWithSchool | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [rowHeight, setRowHeight] = useState(52);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setError("Error loading students");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      setSuccess("Student record deleted sucessfully");
      setTimeout(() => setSuccess(null), 3000);

      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const handleRowClick = (params: GridRowParams<StudentWithSchool>) => {
    if (!ability.can("view", "StudentReport", "row.click-detail")) return;
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
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
    { field: "first_name", headerName: "First Name", width: 150, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
    { field: "last_name", headerName: "Last Name", width: 150, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
    { field: "email", headerName: "Email", width: 200, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
    { field: "gender", headerName: "Gender", width: 100, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
    {
      field: "calendar_link",
      headerName: "Calendar",
      width: 150,
      renderCell: (params) => {
        const userId = params.row.user_id;
        if (!userId) {
          return <span className="text-gray-400 text-xs">No calendar</span>;
        }
        if (!ability.can("view", "StudentReport", "row.open-calendar")) {
          return <span className="text-gray-400 text-xs">—</span>;
        }
        return (
          <a
            href={`/calendar/${userId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            View Calendar
          </a>
        );
      },
    },
    {
      field: "school",
      headerName: "School",
      width: 200,
      valueGetter: (params) => {
        const p = params as any;
        return p?.row?.school?.name ?? "N/A";
      },
      renderCell: (params) => <span style={clampStyle}>{(params.row as any)?.school?.name ?? "N/A"}</span>,
    },
    { field: "class", headerName: "Class", width: 100, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
    { field: "section", headerName: "Section", width: 100, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
    { field: "aspiration", headerName: "Aspiration", width: 200, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
    { field: "comments", headerName: "Comments", width: 200, renderCell: (params) => <span style={clampStyle}>{params.value ?? ""}</span> },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => {
        const actions: any[] = [];
        if (ability.can("view", "StudentReport", "row.edit")) {
          actions.push(
            <GridActionsCellItem
              key="edit"
              icon={<EditIcon />}
              label="Edit"
              onClick={() =>
                router.push(`/protected/student/form/${params.row.id}`)
              }
            />,
          );
        }
        if (ability.can("view", "StudentReport", "row.delete")) {
          actions.push(
            <GridActionsCellItem
              key="delete"
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => handleDelete(params.row.id)}
              color="error"
            />,
          );
        }
        return actions;
      },
    },
  ];

  const visibleColumns = useGridColumns("StudentReport", columns);

  return (
    <ReportShell>
      <div className="w-full">
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
            rows={students}
            columns={visibleColumns}
            loading={loading}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              columns: {
                columnVisibilityModel: {
                  calendar_link: false,
                },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            rowHeight={rowHeight}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            slots={{
              toolbar: () => (
                <GridToolbarContainer className="bg-gray-50 p-2 flex flex-wrap gap-2 items-center">
                  <Element subject="StudentReport" elementKey="tool.quick-filter">
                    <GridToolbarQuickFilter sx={{ flex: 1, minWidth: 160 }} />
                  </Element>
                  <Element subject="StudentReport" elementKey="tool.column-visibility">
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
              students.findIndex((student) => student.id === selectedRow?.id) + 1,
            calendar_link: selectedRow.user_id ? `/calendar/${selectedRow.user_id}` : null,
            guardians_display: (selectedRow as any).guardians && Array.isArray((selectedRow as any).guardians) && (selectedRow as any).guardians.length > 0
              ? ((selectedRow as any).guardians as any[]).map((g: any, i: number) => 
                  `${i + 1}. ${g.name || 'N/A'} (${g.relationship || 'N/A'}) - ${g.email || 'N/A'}`
                ).join('\n')
              : 'No guardians',
          } : null}
          formtype="Student"
          columns={[
            { label: "S.No", field: "index" },
            { label: "First Name", field: "first_name" },
            { label: "Last Name", field: "last_name" },
            { label: "Email", field: "email" },
            { label: "Gender", field: "gender" },
            { label: "School", field: "school.name" },
            { label: "Class", field: "class" },
            { label: "Section", field: "section" },
            { label: "Aspiration", field: "aspiration" },
            { label: "Comments", field: "comments" },
            { label: "Guardians", field: "guardians_display", type: "text" },
            { label: "Calendar", field: "calendar_link", type: "link" },
          ]}
        />
      </div>
    </ReportShell>
  );
}
