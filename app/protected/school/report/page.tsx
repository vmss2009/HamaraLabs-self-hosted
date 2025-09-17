"use client";

import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { EditIcon, DeleteIcon } from "@/components/Icons";
import SchoolDetailViewer from "@/components/SchoolDetailViewer";
import Alert from "@/components/Alert";
import ReportShell from "@/components/ReportShell";

interface UserRole {
  id: string;
  role: 'INCHARGE' | 'PRINCIPAL' | 'CORRESPONDENT';
  user: {
    email: string;
    first_name: string;
    last_name: string;
    user_meta_data?: {
      phone_number?: string;
    };
  };
}

interface School {
  id: number;
  name: string;
  is_ATL: boolean;
  ATL_establishment_year: number | null;
  paid_subscription: boolean;
  website_url: string;
  social_links: string[];
  syllabus: string[];
  addressLine1: string;
  addressLine2?: string;
  cityId?: number;
  stateId?: number;
  countryId?: number;
  pincode?: string;
  user_roles?: UserRole[];
  principals: string;
  correspondents: string;
  inCharges: string;
  city?: string;
  state?: string;
  country?: string;
}

export default function Page() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({
      syllabus: false,
      social_links: false,
      addressLine1: false,
      addressLine2: false,
      state: false,
      country: false,
      pincode: false,
      principals: false,
      correspondents: false,
      inCharges: false,
      ATL_establishment_year: false,
    });

  const [selectedRow, setSelectedRow] = useState<School | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "S.No",
      width: 100,
      renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
    },
    { field: "name", headerName: "Name", width: 200 },
    { field: "is_ATL", headerName: "Is ATL ?", width: 200 },
    {
      field: "ATL_establishment_year",
      headerName: "ATL Establishment Year",
      width: 200,
    },
    { field: "paid_subscription", headerName: "Paid subscription", width: 200 },
    { field: "website_url", headerName: "Website URL", width: 300 },
    { field: "social_links", headerName: "Social Links", width: 300 },
    { field: "syllabus", headerName: "Syllabus", width: 300 },
    { field: "addressLine1", headerName: "Address Line 1", width: 300 },
    { field: "addressLine2", headerName: "Address Line 2", width: 300 },
    { field: "city", headerName: "City", width: 300 },
    { field: "state", headerName: "State", width: 300 },
    { field: "country", headerName: "Country", width: 300 },
    { field: "pincode", headerName: "Pincode", width: 300 },
    { 
      field: "principals", 
      headerName: "Principals", 
      width: 300,
      renderCell: (params) => {
        const principals = params.row.principalsList || [];
        if (principals.length === 0) {
          return <span className="text-gray-400 italic">None</span>;
        }
        const firstNames = principals.map((principal: any) => principal.name.split(' ')[0]);
        const fullNamesList = principals.map((principal: any) => principal.name).join(', ');
        const displayText = firstNames.join(', ');
        
        return (
          <div className="py-2">
            <div className="font-medium text-sm text-blue-600 truncate" title={fullNamesList}>
              {displayText}
            </div>
          </div>
        );
      }
    },
    { 
      field: "correspondents", 
      headerName: "Correspondents", 
      width: 300,
      renderCell: (params) => {
        const correspondents = params.row.correspondentsList || [];
        if (correspondents.length === 0) {
          return <span className="text-gray-400 italic">None</span>;
        }
        const firstNames = correspondents.map((correspondent: any) => correspondent.name.split(' ')[0]);
        const fullNamesList = correspondents.map((correspondent: any) => correspondent.name).join(', ');
        const displayText = firstNames.join(', ');
        
        return (
          <div className="py-2">
            <div className="font-medium text-sm text-green-600 truncate" title={fullNamesList}>
              {displayText}
            </div>
          </div>
        );
      }
    },
    { 
      field: "inCharges", 
      headerName: "In-Charges", 
      width: 300,
      renderCell: (params) => {
        const inCharges = params.row.inChargesList || [];
        if (inCharges.length === 0) {
          return <span className="text-gray-400 italic">None</span>;
        }
        const firstNames = inCharges.map((inCharge: any) => inCharge.name.split(' ')[0]);
        const fullNamesList = inCharges.map((inCharge: any) => inCharge.name).join(', ');
        const displayText = firstNames.join(', ');
        
        return (
          <div className="py-2">
            <div className="font-medium text-sm text-purple-600 truncate" title={fullNamesList}>
              {displayText}
            </div>
          </div>
        );
      }
    },
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
          onClick={() => router.push(`/protected/school/form/${params.row.id}`)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
          color="error"
        />,
      ],
    },
  ];

  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools");
      if (!response.ok) {
        throw new Error("Failed to fetch schools");
      }
      const data = await response.json();

      const transformedData = data.map((school: Record<string, unknown>) => {
        const address = school.address || {};
        const city = address.city || {};
        const state = city.state || {};
        const country = state.country || {};
        const userRoles = school.user_roles || [];

        const principalsList = userRoles
          .filter((role: UserRole) => role.role === 'PRINCIPAL')
          .map((role: UserRole) => ({
            name: `${role.user.first_name} ${role.user.last_name}`,
            email: role.user.email,
            phone: role.user.user_meta_data?.phone_number || 'N/A'
          }));
        
        const correspondentsList = userRoles
          .filter((role: UserRole) => role.role === 'CORRESPONDENT')
          .map((role: UserRole) => ({
            name: `${role.user.first_name} ${role.user.last_name}`,
            email: role.user.email,
            phone: role.user.user_meta_data?.phone_number || 'N/A'
          }));
        
        const inChargesList = userRoles
          .filter((role: UserRole) => role.role === 'INCHARGE')
          .map((role: UserRole) => ({
            name: `${role.user.first_name} ${role.user.last_name}`,
            email: role.user.email,
            phone: role.user.user_meta_data?.phone_number || 'N/A'
          }));

        // Keep legacy string format for DetailViewer compatibility
        const principals = principalsList.map(p => `${p.name} (${p.email})`).join(', ') || 'None';
        const correspondents = correspondentsList.map(c => `${c.name} (${c.email})`).join(', ') || 'None';
        const inCharges = inChargesList.map(i => `${i.name} (${i.email})`).join(', ') || 'None';

        return {
          ...school,
          addressLine1: address.address_line1 || "N/A",
          addressLine2: address.address_line2 || "",
          city: city.city_name || "N/A",
          state: state.state_name || "N/A",
          country: country.country_name || "N/A",
          pincode: address.pincode || "N/A",
          principals,
          correspondents,
          inCharges,
          principalsList,
          correspondentsList,
          inChargesList,
        };
      });

      setSchools(transformedData);
    } catch (error) {
      setError("Error loading schools");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleRowClick = (params: GridRowParams<School>) => {
    setSelectedRow(params.row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this school?")) {
      return;
    }

    try {
      const response = await fetch(`/api/schools/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete school");
      }

      fetchSchools();
    } catch (error) {
      console.error("Error deleting school:", error);
    }
  };


  return (
    <ReportShell>
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-sm w-[calc(100vw-5rem)]  m-10">
          <DataGrid
            rows={schools}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            disableRowSelectionOnClick
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) =>
              setColumnVisibilityModel(newModel)
            }
            onRowClick={handleRowClick}
            slots={{
              toolbar: () => (
                <GridToolbarContainer className="bg-gray-50 p-2">
                  <GridToolbarQuickFilter sx={{ width: "100%" }} />
                  <GridToolbarColumnsButton />
                </GridToolbarContainer>
              ),
            }}
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
          />
        </div>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <SchoolDetailViewer
          drawerOpen={drawerOpen}
          closeDrawer={closeDrawer}
          selectedRow={selectedRow ? {
            ...selectedRow,
            index:
              schools.findIndex((school) => school.id === selectedRow?.id) + 1,
          } : null}
        />
      </div>
    </ReportShell>
  );
}
