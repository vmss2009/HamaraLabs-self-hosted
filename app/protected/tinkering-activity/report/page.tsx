"use client";

import React, { useEffect, useState } from "react";
import { useTinkeringActivities } from "@/hooks/tinkering-activities/useTinkeringActivities";
import {
    DataGrid,
    GridColDef,
    GridColumnVisibilityModel,
    GridToolbarQuickFilter,
    GridToolbarContainer,
    GridToolbarColumnsButton,
} from "@mui/x-data-grid";
import { Drawer, Typography, Box, Button } from "@mui/material";
import { StudentSelectorDialog } from "@/app/protected/tinkering-activity/report/studentSelectorDialog";

export default function Page() {
    const { tinkeringActivities, loading, getTinkeringActivities } = useTinkeringActivities();
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
        goals: false,
        materials: false,
        instructions: false,
        tips: false,
        observations: false,
        extensions: false,
        resources: false,
    });

    const [selectedRow, setSelectedRow] = useState<any>(null); // To store data of the clicked row
    const [drawerOpen, setDrawerOpen] = useState(false); // To manage drawer state

    const [dialogOpen, setDialogOpen] = useState(false); // Manage popup state
    const [actionRow, setActionRow] = useState<any>(null); // Store data of the row for action

    const columns: GridColDef[] = [
        { field: "serial", headerName: "S. No.", width: 100 },
        { field: "name", headerName: "Activity Name", width: 200 },
        { field: "introduction", headerName: "Introduction", width: 200 },
        { field: "topic", headerName: "Topic", width: 300 },
        { field: "subTopic", headerName: "Sub Topic", width: 300 },
        { field: "subject", headerName: "Subject", width: 200 },
        { field: "goals", headerName: "Goals", width: 200 },
        { field: "materials", headerName: "Materials", width: 200 },
        { field: "instructions", headerName: "Instructions", width: 200 },
        { field: "tips", headerName: "Tips", width: 200 },
        { field: "observations", headerName: "Observations", width: 200 },
        { field: "extensions", headerName: "Extensions", width: 200 },
        { field: "resources", headerName: "Resources", width: 200 },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    style={{ marginLeft: 16 }}
                    tabIndex={params.hasFocus ? 0 : -1}
                    onClick={(event) => handleAssignClick(event, params.row)} // Corrected to onClick
                >
                    Assign
                </Button>
            ),
        },
    ];

    useEffect(() => {
        getTinkeringActivities(); // Fetch tinkering activities on component mount
    }, []);

    const handleRowClick = (params: any) => {
        setSelectedRow(params.row); // Store the clicked row's data
        setDrawerOpen(true); // Open the drawer
    };

    const closeDrawer = () => {
        setSelectedRow(null); // Reset selected row data
        setDrawerOpen(false); // Close the drawer
    };

    const handleAssignClick = (event: React.MouseEvent, row: any) => {
        event.stopPropagation(); // Prevent triggering row click event
        setActionRow(row); // Store row data
        setDialogOpen(true); // Open the dialog
    }

    const handleCloseDialog = () => setDialogOpen(false);

    return (
        <div className="p-4 text-white">
            <div className="bg-[#F0F4F7] rounded-xl">
                <DataGrid
                    rows={tinkeringActivities}
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
                            Tinkering Activity Details
                        </Typography>

                        {/* Activity Name */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Activity Name:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.name || "N/A"}
                            </Typography>
                        </Box>

                        {/* Introduction */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Introduction:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.introduction || "N/A"}
                            </Typography>
                        </Box>

                        {/* Subject */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Subject:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.subject || "N/A"}
                            </Typography>
                        </Box>

                        {/* Topic */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Topic:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.topic || "N/A"}
                            </Typography>
                        </Box>

                        {/* Subtopic */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Subtopic:
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#444" }}>
                                {selectedRow.subTopic || "N/A"}
                            </Typography>
                        </Box>

                        {/* Goals */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Goals:
                            </Typography>
                            <Box sx={{ marginLeft: 2 }}>
                                {selectedRow.goals && selectedRow.goals.length > 0 ? (
                                    selectedRow.goals.map((goal: string, index: number) => (
                                        <Typography key={index} variant="body1" sx={{ color: "#444", marginBottom: 1 }}>
                                            {index + 1}. {goal}
                                        </Typography>
                                    ))
                                ) : (
                                    <Typography variant="body1" sx={{ color: "#444" }}>
                                        N/A
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Materials */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Materials:
                            </Typography>
                            <Box sx={{ marginLeft: 2 }}>
                                {selectedRow.materials && selectedRow.materials.length > 0 ? (
                                    selectedRow.materials.map((material: string, index: number) => (
                                        <Typography key={index} variant="body1" sx={{ color: "#444", marginBottom: 1 }}>
                                            {index + 1}. {material}
                                        </Typography>
                                    ))
                                ) : (
                                    <Typography variant="body1" sx={{ color: "#444" }}>
                                        N/A
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Instructions */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Instructions:
                            </Typography>
                            <Box sx={{ marginLeft: 2 }}>
                                {selectedRow.instructions && selectedRow.instructions.length > 0 ? (
                                    selectedRow.instructions.map((instruction: string, index: number) => (
                                        <Typography key={index} variant="body1" sx={{ color: "#444", marginBottom: 1 }}>
                                            {index + 1}. {instruction}
                                        </Typography>
                                    ))
                                ) : (
                                    <Typography variant="body1" sx={{ color: "#444" }}>
                                        N/A
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Tips */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Tips:
                            </Typography>
                            <Box sx={{ marginLeft: 2 }}>
                                {selectedRow.tips && selectedRow.tips.length > 0 ? (
                                    selectedRow.tips.map((tip: string, index: number) => (
                                        <Typography key={index} variant="body1" sx={{ color: "#444", marginBottom: 1 }}>
                                            {index + 1}. {tip}
                                        </Typography>
                                    ))
                                ) : (
                                    <Typography variant="body1" sx={{ color: "#444" }}>
                                        N/A
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Observations */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Observations:
                            </Typography>
                            <Box sx={{ marginLeft: 2 }}>
                                {selectedRow.observations && selectedRow.observations.length > 0 ? (
                                    selectedRow.observations.map((observation: string, index: number) => (
                                        <Typography key={index} variant="body1" sx={{ color: "#444", marginBottom: 1 }}>
                                            {index + 1}. {observation}
                                        </Typography>
                                    ))
                                ) : (
                                    <Typography variant="body1" sx={{ color: "#444" }}>
                                        N/A
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Extensions */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Extensions:
                            </Typography>
                            <Box sx={{ marginLeft: 2 }}>
                                {selectedRow.extensions && selectedRow.extensions.length > 0 ? (
                                    selectedRow.extensions.map((extension: string, index: number) => (
                                        <Typography key={index} variant="body1" sx={{ color: "#444", marginBottom: 1 }}>
                                            {index + 1}. {extension}
                                        </Typography>
                                    ))
                                ) : (
                                    <Typography variant="body1" sx={{ color: "#444" }}>
                                        N/A
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Resources */}
                        <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555" }}>
                                Resources:
                            </Typography>
                            <Box sx={{ marginLeft: 2 }}>
                                {selectedRow.resources && selectedRow.resources.length > 0 ? (
                                    selectedRow.resources.map((resource: string, index: number) => (
                                        <Typography key={index} variant="body1" sx={{ color: "#444", marginBottom: 1 }}>
                                            {index + 1}. {resource}
                                        </Typography>
                                    ))
                                ) : (
                                    <Typography variant="body1" sx={{ color: "#444" }}>
                                        N/A
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body1" sx={{ textAlign: "center" }}>
                        No activity selected.
                    </Typography>
                )}
            </Drawer>

            {/* Dialog */}

            <StudentSelectorDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                rowData={actionRow}
            />

        </div>
    );
}