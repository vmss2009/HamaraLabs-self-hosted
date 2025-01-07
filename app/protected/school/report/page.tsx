"use client";

import React, { useEffect, useState } from "react";
import { useSchools } from "@/hooks/school/useSchools";
import {
    DataGrid,
    GridColDef,
    GridColumnVisibilityModel,
    GridToolbarQuickFilter,
    GridToolbarContainer,
    GridToolbarColumnsButton,
} from "@mui/x-data-grid";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function Page() {
    const { schools, loading, getSchools } = useSchools();
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
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

    const [selectedRow, setSelectedRow] = useState<any>(null); // To store data of the clicked row
    const [drawerOpen, setDrawerOpen] = useState(false); // To manage drawer state

    const columns: GridColDef[] = [
        { field: "serial", headerName: "S. No.", width: 100 },
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
        { field: "principalFirstName", headerName: "Principal First Name", width: 300 },
        { field: "principalLastName", headerName: "Principal Last Name", width: 300 },
        { field: "principalNumber", headerName: "Principal Number", width: 300 },
        { field: "correspondentEmail", headerName: "Correspondent Email", width: 300 },
        { field: "correspondentFirstName", headerName: "Correspondent First Name", width: 300 },
        { field: "correspondentLastName", headerName: "Correspondent Last Name", width: 300 },
        { field: "correspondentNumber", headerName: "Correspondent Number", width: 300 },
        { field: "inChargeEmail", headerName: "In Charge Email", width: 300 },
        { field: "inChargeFirstName", headerName: "In Charge First Name", width: 300 },
        { field: "inChargeLastName", headerName: "In Charge Last Name", width: 300 },
        { field: "inChargeNumber", headerName: "In Charge Number", width: 300 },
    ];

    useEffect(() => {
        // Fetch all schools on component mount
        getSchools(); // Adjust the range or limit as needed
    }, []);

    const handleRowClick = (params: any) => {
        setSelectedRow(params.row); // Store the clicked row's data
        setDrawerOpen(true); // Open the drawer
    };

    const closeDrawer = () => {
        setDrawerOpen(false); // Close the drawer
    };

    return (
        <div className="p-4 text-white">
            <div className="bg-[#F0F4F7] rounded-xl">
                <DataGrid
                    rows={schools}
                    columns={columns}
                    loading={loading}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[5, 10, 25, 50, 100]}
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                    onRowClick={handleRowClick} // Handle row click
                    slots={{
                        toolbar: () => (
                            <GridToolbarContainer>
                                <GridToolbarQuickFilter sx={{ width: "100%" }} />
                                <GridToolbarColumnsButton />
                            </GridToolbarContainer>
                        ),
                    }}
                    sx={{
                        borderRadius: "12px",
                    }}
                />
            </div>

            {/* Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={closeDrawer}
                PaperProps={{
                    sx: {
                        width: "40%", // Set width to 60% of the screen
                        padding: 3,
                        backgroundColor: "#f9f9f9",
                    },
                }}
            >
                {selectedRow ? (
                    <Box>
                        {/* Drawer Header */}
                        <Typography
                            variant="h5"
                            sx={{
                                marginBottom: 3,
                                fontWeight: "bold",
                                textAlign: "center",
                                color: "#333",
                            }}
                        >
                            School Details
                        </Typography>

                        {/* Serial Number */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                S. No.:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.serial || "N/A"}
                            </Typography>
                        </Box>

                        {/* Name */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Name:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.name || "N/A"}
                            </Typography>
                        </Box>

                        {/* Is ATL? */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Is ATL?
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.is_ATL ? "Yes" : "No"}
                            </Typography>
                        </Box>

                        {/* Paid Subscription */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Paid Subscription:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.paid_subscription ? "Yes" : "No"}
                            </Typography>
                        </Box>

                        {/* Website URL */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Website URL:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.website_url || "N/A"}
                            </Typography>
                        </Box>

                        {/* Social Links */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Social Links:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.social_links && selectedRow.social_links.length > 0
                                    ? selectedRow.social_links.join(" | ")
                                    : "N/A"}
                            </Typography>
                        </Box>

                        {/* Syllabus */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Syllabus:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.syllabus || "N/A"}
                            </Typography>
                        </Box>

                        {/* Address Line 1 */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Address Line 1:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.addressLine1 || "N/A"}
                            </Typography>
                        </Box>

                        {/* Address Line 2 */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Address Line 2:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.addressLine2 || "N/A"}
                            </Typography>
                        </Box>

                        {/* City */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                City:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.city || "N/A"}
                            </Typography>
                        </Box>

                        {/* State */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                State:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.state || "N/A"}
                            </Typography>
                        </Box>

                        {/* Country */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Country:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.country || "N/A"}
                            </Typography>
                        </Box>

                        {/* Pincode */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Pincode:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.pincode || "N/A"}
                            </Typography>
                        </Box>

                        {/* Principal Email */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Principal Email:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.principalEmail || "N/A"}
                            </Typography>
                        </Box>

                        {/* Principal First Name */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Principal First Name:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.principalFirstName || "N/A"}
                            </Typography>
                        </Box>

                        {/* Principal Last Name */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Principal Last Name:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.principalLastName || "N/A"}
                            </Typography>
                        </Box>

                        {/* Principal Number */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Principal Number:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.principalNumber || "N/A"}
                            </Typography>
                        </Box>

                        {/* Correspondent Email */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Correspondent Email:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.correspondentEmail || "N/A"}
                            </Typography>
                        </Box>

                        {/* Correspondent First Name */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Correspondent First Name:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.correspondentFirstName || "N/A"}
                            </Typography>
                        </Box>

                        {/* Correspondent Last Name */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Correspondent Last Name:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.correspondentLastName || "N/A"}
                            </Typography>
                        </Box>

                        {/* Correspondent Number */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Correspondent Number:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.correspondentNumber || "N/A"}
                            </Typography>
                        </Box>

                        {/* In Charge Email */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                In Charge Email:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.inChargeEmail || "N/A"}
                            </Typography>
                        </Box>

                        {/* In Charge First Name */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                In Charge First Name:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.inChargeFirstName || "N/A"}
                            </Typography>
                        </Box>

                        {/* In Charge Last Name */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                In Charge Last Name:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.inChargeLastName || "N/A"}
                            </Typography>
                        </Box>

                        {/* In Charge Number */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                In Charge Number:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.inChargeNumber || "N/A"}
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body1">No data available</Typography>
                )}
            </Drawer>
        </div>
    );
}