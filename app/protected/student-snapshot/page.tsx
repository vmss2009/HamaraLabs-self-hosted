'use client';

import React, { useState, useEffect } from 'react';
import {Autocomplete, Box, CircularProgress, Drawer, TextField, Typography} from "@mui/material";
import { useSchoolsAddresses } from "@/hooks/address/useSchoolsAddresses";
import { useSchoolStudents } from "@/hooks/student/useSchoolStudents";
import { useStudentCustomisedTinkeringActivities } from "@/hooks/student-snapshot/useStudentCustomisedTinkeringActivities";
import {
    DataGrid,
    GridColDef,
    GridColumnVisibilityModel, GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";

const SnapshotPage = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
    const [schoolInputValue, setSchoolInputValue] = useState("");
    const [studentInputValue, setStudentInputValue] = useState("");
    const { schoolsAddresses, loading: schoolLoading, getSchoolsAddresses } = useSchoolsAddresses();
    const { students, loading: studentLoading, getSchoolStudents } = useSchoolStudents();

    // Tinkering activity data hooks
    const { customisedTinkeringActivities, loading: customisedTinkeringActivitiesLoading, getStudentCustomisedTinkeringActivities } = useStudentCustomisedTinkeringActivities();


    useEffect(() => {
        getSchoolsAddresses();
    }, []);

    const handleTabChange = (index: number) => {
        setActiveTab(index);
    };

    const onSchoolSelect = (event: React.SyntheticEvent, value: {"label": string, "id": number}) => {
        setSelectedSchool(value?.id || null);
        getSchoolStudents(value?.id);
    };

    const onStudentSelect = async (event: React.SyntheticEvent, value: {"label": string, "id": number}) => {
        setSelectedStudent(value?.id || null);
        if (value && value.id) {
            await getStudentCustomisedTinkeringActivities(value.id);
        }
    };

    // Tinkering activities

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
    ];

    const handleRowClick = (params: any) => {
        setSelectedRow(params.row); // Store the clicked row's data
        setDrawerOpen(true); // Open the drawer
    };

    const closeDrawer = () => {
        setSelectedRow(null); // Reset selected row data
        setDrawerOpen(false); // Close the drawer
    };


    return (
        <div className="w-screen h-screen p-6">
            <Box display="flex" flexDirection="row" gap={4} alignItems="center" maxWidth={"100%"}>
                {/* School Dropdown */}
                <div className="mb-6">
                    <Autocomplete
                        options={schoolsAddresses}
                        loading={schoolLoading}
                        sx={{
                            minWidth: "400px",
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "#f9f9f9",
                                borderRadius: "8px",
                            },
                            "& .Mui-focused": {
                                borderColor: "#1976d2",
                            },
                        }}
                        getOptionLabel={(option) => option.label}
                        onChange={(event, value) => onSchoolSelect(event, value!)}
                        inputValue={schoolInputValue}
                        onInputChange={(event, value) => setSchoolInputValue(value)}
                        filterOptions={(options, state) =>
                            state.inputValue
                                ? options.filter((option) =>
                                    option.label.toLowerCase().includes(state.inputValue.toLowerCase())
                                )
                                : []
                        }
                        noOptionsText={
                            schoolInputValue.trim()
                                ? "No schools match your search"
                                : "Start typing to search schools..."
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select School"
                                variant="outlined"
                                required
                                slotProps={{
                                    input: {
                                        ...params.InputProps,
                                        endAdornment: (
                                            <React.Fragment>
                                                {schoolLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </React.Fragment>
                                        ),
                                    },
                                }}
                            />
                        )}
                    />
                </div>

                {/* Student Dropdown */}
                {selectedSchool !== null && (
                    <div className="mb-6">
                        <Autocomplete
                            options={students}
                            loading={studentLoading}
                            sx={{
                                minWidth: "400px",
                                "& .MuiOutlinedInput-root": {
                                    backgroundColor: "#f9f9f9",
                                    borderRadius: "8px",
                                },
                                "& .Mui-focused": {
                                    borderColor: "#1976d2",
                                },
                            }}
                            getOptionLabel={(option) => option.label}
                            onChange={(event, value) => onStudentSelect(event, value!)}
                            inputValue={studentInputValue}
                            onInputChange={(event, value) => setStudentInputValue(value)}
                            filterOptions={(options, state) =>
                                state.inputValue
                                    ? options.filter((option) =>
                                        option.label.toLowerCase().includes(state.inputValue.toLowerCase())
                                    )
                                    : []
                            }
                            noOptionsText={
                                studentInputValue.trim()
                                    ? "No students match your search"
                                    : "Start typing to search students..."
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Student"
                                    variant="outlined"
                                    required
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {studentLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        },
                                    }}
                                />
                            )}
                        />
                    </div>
                )}
            </Box>

            {/* Tabs */}
            <div className="flex justify-evenly bg-gray-100 p-4 rounded-lg shadow-md mb-6">
                <div
                    onClick={() => handleTabChange(0)}
                    className={`cursor-pointer text-lg font-semibold py-2 px-4 rounded-tl-lg rounded-tr-lg transition-all duration-300 ${activeTab === 0 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800 border-2 border-transparent hover:border-blue-500'}`}
                >
                    Tinkering Activities
                </div>
                <div
                    onClick={() => handleTabChange(1)}
                    className={`cursor-pointer text-lg font-semibold py-2 px-4 rounded-tl-lg rounded-tr-lg transition-all duration-300 ${activeTab === 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800 border-2 border-transparent hover:border-blue-500'}`}
                >
                    Competitions
                </div>
                <div
                    onClick={() => handleTabChange(2)}
                    className={`cursor-pointer text-lg font-semibold py-2 px-4 rounded-tl-lg rounded-tr-lg transition-all duration-300 ${activeTab === 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800 border-2 border-transparent hover:border-blue-500'}`}
                >
                    Courses
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 0 && (
                    selectedStudent !== null ? (
                        <div className="p-4 text-white">
                            <div className="bg-[#F0F4F7] rounded-xl">
                                <DataGrid
                                    rows={customisedTinkeringActivities}
                                    columns={columns}
                                    loading={customisedTinkeringActivitiesLoading}
                                    initialState={{
                                        pagination: {paginationModel: {pageSize: 10}},
                                    }}
                                    pageSizeOptions={[5, 10, 25, 50, 100]}
                                    columnVisibilityModel={columnVisibilityModel}
                                    onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                                    onRowClick={handleRowClick} // Handle row click
                                    slots={{
                                        toolbar: () => (
                                            <GridToolbarContainer>
                                                <GridToolbarQuickFilter sx={{width: "100%"}}/>
                                                <GridToolbarColumnsButton/>
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
                                        <Box sx={{marginBottom: 3}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "#555"}}>
                                                Activity Name:
                                            </Typography>
                                            <Typography variant="body1" sx={{color: "#444"}}>
                                                {selectedRow.name || "N/A"}
                                            </Typography>
                                        </Box>

                                        {/* Introduction */}
                                        <Box sx={{marginBottom: 3}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "#555"}}>
                                                Introduction:
                                            </Typography>
                                            <Typography variant="body1" sx={{color: "#444"}}>
                                                {selectedRow.introduction || "N/A"}
                                            </Typography>
                                        </Box>

                                        {/* Subject */}
                                        <Box sx={{marginBottom: 3}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "#555"}}>
                                                Subject:
                                            </Typography>
                                            <Typography variant="body1" sx={{color: "#444"}}>
                                                {selectedRow.subject || "N/A"}
                                            </Typography>
                                        </Box>

                                        {/* Topic */}
                                        <Box sx={{marginBottom: 3}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "#555"}}>
                                                Topic:
                                            </Typography>
                                            <Typography variant="body1" sx={{color: "#444"}}>
                                                {selectedRow.topic || "N/A"}
                                            </Typography>
                                        </Box>

                                        {/* Subtopic */}
                                        <Box sx={{marginBottom: 3}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "#555"}}>
                                                Subtopic:
                                            </Typography>
                                            <Typography variant="body1" sx={{color: "#444"}}>
                                                {selectedRow.subTopic || "N/A"}
                                            </Typography>
                                        </Box>

                                        {/* Goals */}
                                        <Box sx={{marginBottom: 3}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "#555"}}>
                                                Goals:
                                            </Typography>
                                            <Box sx={{marginLeft: 2}}>
                                                {selectedRow.goals && selectedRow.goals.length > 0 ? (
                                                    selectedRow.goals.map((goal: string, index: number) => (
                                                        <Typography key={index} variant="body1"
                                                                    sx={{color: "#444", marginBottom: 1}}>
                                                            {index + 1}. {goal}
                                                        </Typography>
                                                    ))
                                                ) : (
                                                    <Typography variant="body1" sx={{color: "#444"}}>
                                                        N/A
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Materials */}
                                        <Box sx={{marginBottom: 3}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "#555"}}>
                                                Materials:
                                            </Typography>
                                            <Box sx={{marginLeft: 2}}>
                                                {selectedRow.materials && selectedRow.materials.length > 0 ? (
                                                    selectedRow.materials.map((material: string, index: number) => (
                                                        <Typography key={index} variant="body1"
                                                                    sx={{color: "#444", marginBottom: 1}}>
                                                            {index + 1}. {material}
                                                        </Typography>
                                                    ))
                                                ) : (
                                                    <Typography variant="body1" sx={{color: "#444"}}>
                                                        N/A
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Instructions */}
                                        <Box sx={{marginBottom: 3}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "#555"}}>
                                                Instructions:
                                            </Typography>
                                            <Box sx={{marginLeft: 2}}>
                                                {selectedRow.instructions && selectedRow.instructions.length > 0 ? (
                                                    selectedRow.instructions.map((instruction: string, index: number) => (
                                                        <Typography key={index} variant="body1"
                                                                    sx={{color: "#444", marginBottom: 1}}>
                                                            {index + 1}. {instruction}
                                                        </Typography>
                                                    ))
                                                ) : (
                                                    <Typography variant="body1" sx={{color: "#444"}}>
                                                        N/A
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Tips */}
                                        <Box sx={{marginBottom: 3}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "#555"}}>
                                                Tips:
                                            </Typography>
                                            <Box sx={{marginLeft: 2}}>
                                                {selectedRow.tips && selectedRow.tips.length > 0 ? (
                                                    selectedRow.tips.map((tip: string, index: number) => (
                                                        <Typography key={index} variant="body1"
                                                                    sx={{color: "#444", marginBottom: 1}}>
                                                            {index + 1}. {tip}
                                                        </Typography>
                                                    ))
                                                ) : (
                                                    <Typography variant="body1" sx={{color: "#444"}}>
                                                        N/A
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Observations */}
                                        <Box sx={{marginBottom: 3}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "#555"}}>
                                                Observations:
                                            </Typography>
                                            <Box sx={{marginLeft: 2}}>
                                                {selectedRow.observations && selectedRow.observations.length > 0 ? (
                                                    selectedRow.observations.map((observation: string, index: number) => (
                                                        <Typography key={index} variant="body1"
                                                                    sx={{color: "#444", marginBottom: 1}}>
                                                            {index + 1}. {observation}
                                                        </Typography>
                                                    ))
                                                ) : (
                                                    <Typography variant="body1" sx={{color: "#444"}}>
                                                        N/A
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Extensions */}
                                        <Box sx={{marginBottom: 3}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "#555"}}>
                                                Extensions:
                                            </Typography>
                                            <Box sx={{marginLeft: 2}}>
                                                {selectedRow.extensions && selectedRow.extensions.length > 0 ? (
                                                    selectedRow.extensions.map((extension: string, index: number) => (
                                                        <Typography key={index} variant="body1"
                                                                    sx={{color: "#444", marginBottom: 1}}>
                                                            {index + 1}. {extension}
                                                        </Typography>
                                                    ))
                                                ) : (
                                                    <Typography variant="body1" sx={{color: "#444"}}>
                                                        N/A
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Resources */}
                                        <Box sx={{marginBottom: 3}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "#555"}}>
                                                Resources:
                                            </Typography>
                                            <Box sx={{marginLeft: 2}}>
                                                {selectedRow.resources && selectedRow.resources.length > 0 ? (
                                                    selectedRow.resources.map((resource: string, index: number) => (
                                                        <Typography key={index} variant="body1"
                                                                    sx={{color: "#444", marginBottom: 1}}>
                                                            {index + 1}. {resource}
                                                        </Typography>
                                                    ))
                                                ) : (
                                                    <Typography variant="body1" sx={{color: "#444"}}>
                                                        N/A
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography variant="body1" sx={{textAlign: "center"}}>
                                        No activity selected.
                                    </Typography>
                                )}
                            </Drawer>
                        </div>
                    ) : (
                        <div className="p-4 bg-white rounded-lg shadow-md">
                            <Typography variant="body1" sx={{color: "#444"}}>
                                Please select a student to view tinkering activities.
                            </Typography>
                        </div>
                    )
                )}

                {activeTab === 1 && (
                    <div className="p-4 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Competitions</h2>
                        <ul>
                            <li>Competition 1: National Coding Contest</li>
                            <li>Competition 2: Robotics Championship</li>
                        </ul>
                    </div>
                )}

                {activeTab === 2 && (
                    <div className="p-4 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Courses</h2>
                        <ul>
                            <li>Course 1: Introduction to Programming</li>
                            <li>Course 2: Data Structures & Algorithms</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SnapshotPage;