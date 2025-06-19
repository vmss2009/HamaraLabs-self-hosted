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
} from "@mui/x-data-grid";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DetailViewer from "@/components/DetailViewer";

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
  principal?: {
    email: string;
    first_name: string;
    last_name: string;
    user_meta_data?: {
      phone_number?: string;
    };
  } | null;
  correspondent?: {
    email: string;
    first_name: string;
    last_name: string;
    user_meta_data?: {
      phone_number?: string;
    };
  } | null;
  in_charge?: {
    email: string;
    first_name: string;
    last_name: string;
    user_meta_data?: {
      phone_number?: string;
    };
  } | null;
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
      principalEmail: false,
      principalFirstName: false,
      principalLastName: false,
      principalNumber: false,
      correspondentEmail: false,
      correspondentFirstName: false,
      correspondentLastName: false,
      correspondentNumber: false,
      inChargeEmail: false,
      inChargeFirstName: false,
      inChargeLastName: false,
      inChargeNumber: false,
      ATL_establishment_year: false,
    });

  const [selectedRow, setSelectedRow] = useState<any>(null);
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
    { field: "principalEmail", headerName: "Principal Email", width: 300 },
    {
      field: "principalFirstName",
      headerName: "Principal First Name",
      width: 300,
    },
    {
      field: "principalLastName",
      headerName: "Principal Last Name",
      width: 300,
    },
    { field: "principalNumber", headerName: "Principal Number", width: 300 },
    {
      field: "correspondentEmail",
      headerName: "Correspondent Email",
      width: 300,
    },
    {
      field: "correspondentFirstName",
      headerName: "Correspondent First Name",
      width: 300,
    },
    {
      field: "correspondentLastName",
      headerName: "Correspondent Last Name",
      width: 300,
    },
    {
      field: "correspondentNumber",
      headerName: "Correspondent Number",
      width: 300,
    },
    { field: "inChargeEmail", headerName: "In Charge Email", width: 300 },
    {
      field: "inChargeFirstName",
      headerName: "In Charge First Name",
      width: 300,
    },
    {
      field: "inChargeLastName",
      headerName: "In Charge Last Name",
      width: 300,
    },
    { field: "inChargeNumber", headerName: "In Charge Number", width: 300 },
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
          icon={<DeleteOutlineIcon />}
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

      // Transform the data to include flattened address and user data
      const transformedData = data.map((school: any) => {
        // Flatten address data
        const address = school.address || {};
        const city = address.city || {};
        const state = city.state || {};
        const country = state.country || {};

        // Find users by their roles
        const principal = school.users?.find(
          (user: any) => user.id === school.principal_id
        );
        const correspondent = school.users?.find(
          (user: any) => user.id === school.correspondent_id
        );
        const in_charge = school.users?.find(
          (user: any) => user.id === school.in_charge_id
        );

        return {
          ...school,
          addressLine1: address.address_line1 || "N/A",
          addressLine2: address.address_line2 || "",
          city: city.city_name || "N/A",
          state: state.state_name || "N/A",
          country: country.country_name || "N/A",
          pincode: address.pincode || "N/A",
          principalEmail: principal?.email || "N/A",
          principalFirstName: principal?.first_name || "N/A",
          principalLastName: principal?.last_name || "N/A",
          principalNumber: principal?.user_meta_data?.phone_number || "N/A",
          correspondentEmail: correspondent?.email || "N/A",
          correspondentFirstName: correspondent?.first_name || "N/A",
          correspondentLastName: correspondent?.last_name || "N/A",
          correspondentNumber:
            correspondent?.user_meta_data?.phone_number || "N/A",
          inChargeEmail: in_charge?.email || "N/A",
          inChargeFirstName: in_charge?.first_name || "N/A",
          inChargeLastName: in_charge?.last_name || "N/A",
          inChargeNumber: in_charge?.user_meta_data?.phone_number || "N/A",
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

  const handleRowClick = (params: any) => {
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

  const formatValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return "N/A";
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-5">
          {value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === "object") {
      // Handle location objects
      if (value.country_name) return value.country_name;
      if (value.state_name) return value.state_name;
      if (value.city_name) return value.city_name;
      // For other objects
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    }
    return String(value);
  };

  return (
    <div className="bg-gray-500 flex justify-center h-screen w-auto">
      <div className="pt-20">
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

        <DetailViewer
          drawerOpen={drawerOpen}
          closeDrawer={closeDrawer}
          selectedRow={{
            ...selectedRow,
            index:
              schools.findIndex((school) => school.id === selectedRow?.id) + 1,
          }}
          formtype="School"
          columns={[
            { label: "S.No", field: "index" },
            { label: "Name", field: "name" },
            { label: "Is ATL", field: "is_ATL" },
            {
              label: "ATL Establishment Year",
              field: "ATL_establishment_year",
            },
            { label: "Paid Subscription", field: "paid_subscription" },
            { label: "Website URL", field: "website_url" },
            { label: "Syllabus", field: "syllabus" },
            {
              label: "Address",
              type: "address",
              fields: [
                { label: "Address Line 1", field: "address.address_line1" },
                { label: "Address Line 2", field: "address.address_line2" },
                { label: "Pincode", field: "address.pincode" },
                { label: "City", field: "city" },
                { label: "State", field: "state" },
                { label: "Country", field: "country" },
              ],
            },
            {
              label: "Principal Details",
              type: "Details",
              fields: [
                { label: "First Name", field: "principalFirstName" },
                { label: "Last Name", field: "principalLastName" },
                { label: "Email", field: "principalEmail" },
                { label: "Phone", field: "principalNumber" },
              ],
            },
            {
              label: "Correspondent Details",
              type: "Details",
              fields: [
                { label: "First Name", field: "correspondentFirstName" },
                { label: "Last Name", field: "correspondentLastName" },
                { label: "Email", field: "correspondentEmail" },
                { label: "Phone", field: "correspondentNumber" },
              ],
            },
            {
              label: "In-Charge Details",
              type: "Details",
              fields: [
                { label: "First Name", field: "inChargeFirstName" },
                { label: "Last Name", field: "inChargeLastName" },
                { label: "Email", field: "inChargeEmail" },
                { label: "Phone", field: "inChargeNumber" },
              ],
            },
            { label: "Social Links", field: "social_links" },
          ]}
        />
      </div>
    </div>
  );
}
