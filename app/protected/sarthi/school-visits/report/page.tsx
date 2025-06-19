"use client";

import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridRowParams,
} from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { SchoolVisitWithRelations } from "@/lib/db/school-visits/type";
import DetailViewer from "@/components/DetailViewer";

export default function SchoolVisitReport() {
  const router = useRouter();
  const [visits, setVisits] = useState<SchoolVisitWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] =
    useState<SchoolVisitWithRelations | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

      // Refresh the data
      fetchVisits();
    } catch (error) {
      console.error("Error deleting school visit:", error);
    }
  };

  const handleRowClick = (params: GridRowParams<SchoolVisitWithRelations>) => {
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") return JSON.stringify(value);
    return value.toString();
  };

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
      renderCell: (params) => params.row.school?.name || "N/A",
    },
    {
      field: "visit_date",
      headerName: "Visit Date",
      width: 150,
      renderCell: (params) =>
        new Date(params.row.visit_date).toLocaleDateString(),
    },
    {
      field: "school_performance",
      headerName: "School Performance",
      width: 150,
      renderCell: (params) => params.row.school_performance || "N/A",
    },
    {
      field: "point_of_contact",
      headerName: "Point of Contact",
      width: 200,
      renderCell: (params) => {
        if (params.row.point_of_contact) {
          return `${params.row.point_of_contact.first_name} ${params.row.point_of_contact.last_name}`;
        }
        return params.row.other_poc || "N/A";
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params: { row: SchoolVisitWithRelations }) => (
        <div className="flex items-center justify-center gap-2 w-full h-full">
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() =>
              router.push(`/protected/sarthi/school-visits/${params.row.id}`)
            }
          />
          <GridActionsCellItem
            icon={<DeleteOutlineIcon />}
            label="Delete"
            onClick={() => handleDelete(params.row.id.toString())}
            color="error"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
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

      <div className="bg-white rounded-xl shadow-sm">
        <DataGrid
          rows={visits}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          disableRowSelectionOnClick
          autoHeight
          onRowClick={handleRowClick}
          sx={{
            borderRadius: "12px",
            "& .MuiDataGrid-cell": {
              color: "#1f2937",
            },
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
        selectedRow={{
          ...selectedRow,
          index: visits.findIndex((visit) => visit.id === selectedRow?.id) + 1,
          point_of_contact_name: selectedRow?.point_of_contact
            ? `${selectedRow.point_of_contact.first_name} ${selectedRow.point_of_contact.last_name}`
            : selectedRow?.other_poc || "N/A",
        }}
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
  );
}
