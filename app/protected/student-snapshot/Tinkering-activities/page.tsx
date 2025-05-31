import React from 'react';
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { Button } from "@/components/ui/Button";

type ModifyStatusHandler = (item: any, type: 'tinkering' | 'competition' | 'courses') => void;
type EditTinkeringHandler = (item: any) => void;
type DeleteTinkeringHandler = (item: any) => void;

export function getTinkeringActivityColumns(
  handleModifyStatus: ModifyStatusHandler,
  handleEditTinkeringActivity: EditTinkeringHandler,
  handleDeleteTinkeringActivity: DeleteTinkeringHandler
): GridColDef[] {
  return [
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
      renderCell: (params) => params.value ?? "N/A",
    },
    {
      field: 'introduction',
      headerName: 'Introduction',
      width: 200,
      renderCell: (params) => params.value ?? "N/A",
    },
    {
      field: 'subject',
      headerName: 'Subject',
      width: 150,
      renderCell: (params) => params.row?.subtopic?.topic?.subject?.subject_name ?? 'N/A',
    },
    {
      field: 'topic',
      headerName: 'Topic',
      width: 150,
      renderCell: (params) => params.row?.subtopic?.topic?.topic_name ?? 'N/A',
    },
    {
      field: 'subtopic',
      headerName: 'Subtopic',
      width: 150,
      renderCell: (params) => params.row?.subtopic?.subtopic_name ?? 'N/A',
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
        <div className="flex items-center justify-center space-x-2 w-full h-full" key="tinkering-actions">
          <Button
            variant="default"
            color="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleModifyStatus(params.row, 'tinkering');
            }}
          >
            Modify status
          </Button>

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
}
