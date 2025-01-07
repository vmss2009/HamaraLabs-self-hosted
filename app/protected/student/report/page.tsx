"use client";

import React, { useEffect, useState } from "react";
import { useStudents } from "@/hooks/student/useStudents";
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
    const { students, loading, getStudents } = useStudents();
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
        last_name: false,
        section: false,
        email: false,
        aspiration: false,
        comments: false,
    });

    const [selectedRow, setSelectedRow] = useState<any>(null); // To store data of the clicked row
    const [drawerOpen, setDrawerOpen] = useState(false); // To manage drawer state

    const columns: GridColDef[] = [
        { field: "serial", headerName: "S. No.", width: 100 },
        { field: "first_name", headerName: "First Name", width: 200 },
        { field: "last_name", headerName: "Last Name", width: 200 },
        { field: "email", headerName: "Email", width: 200 },
        { field: "gender", headerName: "Gender", width: 200 },
        { field: "schoolName", headerName: "School", width: 200 },
        { field: "class", headerName: "Class", width: 150 },
        { field: "section", headerName: "Section", width: 150 },
        { field: "aspiration", headerName: "Aspiration", width: 200 },
        { field: "comments", headerName: "Comments", width: 200 }
    ];

    useEffect(() => {
        // Fetch all schools on component mount
        getStudents(); // Adjust the range or limit as needed
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
                    rows={students}
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
                        width: "40%", // Set width to 40% of the screen
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
                            Student Details
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

                        {/* First name */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                First name:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.first_name || "N/A"}
                            </Typography>
                        </Box>

                        {/* Last name */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Last name:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.last_name || "N/A"}
                            </Typography>
                        </Box>

                        {/* Email */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Email:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.email || "N/A"}
                            </Typography>
                        </Box>

                        {/* Gender */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Gender:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.gender || "N/A"}
                            </Typography>
                        </Box>

                        {/* School */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                School:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.schoolName || "N/A"}
                            </Typography>
                        </Box>

                        {/* Class */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Class:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.class || "N/A"}
                            </Typography>
                        </Box>

                        {/* Section */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Section:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.section || "N/A"}
                            </Typography>
                        </Box>

                        {/* Aspiration */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Aspiration:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.aspiration || "N/A"}
                            </Typography>
                        </Box>

                        {/* Comments */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Comments:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.comments || "N/A"}
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