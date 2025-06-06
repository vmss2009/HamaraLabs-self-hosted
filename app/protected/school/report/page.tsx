"use client";

import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridColumnVisibilityModel, GridToolbarQuickFilter, GridToolbarContainer, GridToolbarColumnsButton, GridActionsCellItem } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import Alert from "@mui/material/Alert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DetailViewer from "@/components/DetailViewer";
import { School } from "@/lib/db/school/type";

export default function Page() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
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
    });

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "is_ATL", headerName: "Is ATL ?", width: 200 },
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

      const transformedData = data.map((school: any) => {
        const principal = school.principal || {};
        const correspondent = school.correspondent || {};
        const in_charge = school.in_charge || {};

        const address = school.address || {};
        const city = address.city || {};
        const state = city.state || {};
        const country = state.country || {};

        return {
          ...school,
          principal,
          correspondent,
          in_charge,
          addressLine1: address.address_line1 || "N/A",
          addressLine2: address.address_line2 || "",
          city: city.city_name || "N/A",
          state: state.state_name || "N/A",
          country: country.country_name || "N/A",
          pincode: address.pincode || "N/A",
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
    console.log("Selected Row Data:", params.row);
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

      setSuccess("School record deleted sucessfully");
      setTimeout(() => setSuccess(null), 3000);

      fetchSchools();
    } catch (error) {
      console.error("Error deleting school:", error);
    }
  };

  return (
    <div className="flex justify-center items-start h-screen  w-screen bg-gray-500">
      <div className="pt-20  h-auto w-[calc(100vw-6rem)]  m-10">
        <div className="bg-white rounded-xl shadow-sm">
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
          selectedRow={selectedRow}
          formtype="School"
          columns={[
            { label: "ID", field: "id" },
            { label: "Name", field: "name" },
            { label: "Is ATL", field: "is_ATL" },
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
                { label: "City", field: "address.city_name" },
              ],
            },
            {
              label: "Principal Details",
              type: "address",
              fields: [
                { label: "Firstame", field: "principal.firstName" },
                { label: "Lastname", field: "principal.lastName" },
                { label: "Email", field: "principal.email" },
                { label: "Phone", field: "principal.whatsapp" },
              ],
            },
            {
              label: "Correspondent Details",
              type: "address",
              fields: [
                { label: "firstname", field: "correspondent.firstName" },
                { label: "lastname", field: "correspondent.lastName" },
                { label: "Email", field: "correspondent.email" },
                { label: "Phone", field: "correspondent.whatsapp" },
              ],
            },
            {
              label: "In-Charge Details",
              type: "address",
              fields: [
                { label: "firstname", field: "in_charge.firstName" },
                { label: "Lastname", field: "in_charge.lastName" },
                { label: "Email", field: "in_charge.email" },
                { label: "Phone", field: "in_charge.whatsapp" },
              ],
            },

            { label: "Social Links", field: "social_links" },
          ]}
        />
      </div>
    </div>
  );
}
