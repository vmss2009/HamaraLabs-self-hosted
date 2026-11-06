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
import Alert from "@/components/ui/Alert";
import { SchoolVisitWithRelations } from "@/lib/db/school-visits/type";
import DetailViewer from "@/components/form/DetailViewer";
import ReportShell from "@/components/form/ReportShell";
import { Element, useAppAbility, useGridColumns } from "@/components/authz";

export default function SchoolVisitReport() {
  const router = useRouter();
  const ability = useAppAbility();
  const [visits, setVisits] = useState<SchoolVisitWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] =
    useState<SchoolVisitWithRelations | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rowHeight, setRowHeight] = useState(52);

  const fetchVisits = async () => {
    try {
      const response = await fetch("/api/school-visits");
      if (!response.ok) {
        throw new Error("Failed to fetch school visits");
      }
      const data = await response.json();
      setVisits(data);
    } catch (error) {
      setError("Error loading school visits");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this school visit?")) {
      return;
    }

    try {
      const response = await fetch(`/api/school-visits/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete school visit");
      }
      
      fetchVisits();
    } catch (error) {
      console.error("Error deleting school visit:", error);
    }
  };

  const handleRowClick = (params: GridRowParams<SchoolVisitWithRelations>) => {
    if (!ability.can("view", "SchoolVisitReport", "row.click-detail")) return;
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
    {
      field: "school",
      headerName: "School",
      width: 200,
      renderCell: (params) => <span style={clampStyle}>{params.row.school?.name || "N/A"}</span>,
    },
    {
      field: "visit_date",
      headerName: "Visit Date",
      width: 150,
      renderCell: (params) =>
        <span style={clampStyle}>{new Date(params.row.visit_date).toLocaleDateString()}</span>,
    },
    {
      field: "school_performance",
      headerName: "School Performance",
      width: 150,
      renderCell: (params) => <span style={clampStyle}>{params.row.school_performance || "N/A"}</span>,
    },
    {
      field: "point_of_contact",
      headerName: "Point of Contact",
      width: 200,
      renderCell: (params) => {
        const text = params.row.point_of_contact
          ? `${params.row.point_of_contact.first_name} ${params.row.point_of_contact.last_name}`
          : params.row.other_poc || "N/A";
        return <span style={clampStyle}>{text}</span>;
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params: { row: SchoolVisitWithRelations }) => (
        <div className="flex items-center justify-center gap-2 w-full h-full">
          {ability.can("view", "SchoolVisitReport", "row.edit") && (
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              onClick={() =>
                router.push(`/protected/sarthi/school-visits/${params.row.id}`)
              }
            />
          )}
          {ability.can("view", "SchoolVisitReport", "row.delete") && (
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => handleDelete(params.row.id.toString())}
              color="error"
            />
          )}
        </div>
      ),
    },
  ];

  const visibleColumns = useGridColumns("SchoolVisitReport", columns);

  return (
    <ReportShell>
      <div className="w-full px-6 md:px-10">
  <div className="bg-white rounded-xl shadow-sm max-w-5xl w-full mt-8 mb-10 mr-auto">
          <DataGrid
            rows={visits}
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
                  <Element subject="SchoolVisitReport" elementKey="tool.quick-filter">
                    <GridToolbarQuickFilter sx={{ flex: 1, minWidth: 160 }} />
                  </Element>
                  <Element subject="SchoolVisitReport" elementKey="tool.column-visibility">
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

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <DetailViewer
          drawerOpen={drawerOpen}
          closeDrawer={closeDrawer}
          selectedRow={selectedRow ? {
            ...selectedRow,
            index: visits.findIndex((visit) => visit.id === selectedRow?.id) + 1,
            point_of_contact_name: selectedRow?.point_of_contact
              ? `${selectedRow.point_of_contact.first_name} ${selectedRow.point_of_contact.last_name}`
              : selectedRow?.other_poc || "N/A",
          } : null}
          formtype="School Visit"
          columns={[
            { label: "S.No", field: "index" },
            { label: "School", field: "school.name" },
            { label: "Visit Date", field: "visit_date", type: "date" },
            { label: "Point of Contact", field: "point_of_contact_name" },
            { label: "School Performance", field: "school_performance" },
            {
              label: "No of UCs submitted",
              field: "details.No of UCs submitted",
            },
            {
              label: "Planned showcase date",
              field: "details.Planned showcase date",
            },
          ]}
        />
      </div>
    </ReportShell>
  );
}
