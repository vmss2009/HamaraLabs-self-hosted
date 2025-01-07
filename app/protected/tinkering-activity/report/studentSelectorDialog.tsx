import React, { useState, useEffect } from "react";
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Autocomplete,
    TextField,
    CircularProgress,
} from "@mui/material";
import { useSchoolsAddresses } from "@/hooks/address/useSchoolsAddresses";
import { useSchoolStudents } from "@/hooks/student/useSchoolStudents";
import { assignTinkeringActivity } from "@/lib/db/tinkering-activity/crud/tinkeringActivity";
import { TinkeringActivity } from "@/lib/db/tinkering-activity/types/tinkeringActivity";

export const StudentSelectorDialog = ({ open, onClose, rowData }: {open: boolean, onClose: () => void, rowData: object}) => {
    const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [schoolInputValue, setSchoolInputValue] = useState("");
    const [studentInputValue, setStudentInputValue] = useState("");

    const { schoolsAddresses, loading: schoolLoading, getSchoolsAddresses } = useSchoolsAddresses();
    const { students, loading: studentLoading, getSchoolStudents } = useSchoolStudents();

    useEffect(() => {
        getSchoolsAddresses();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        await assignTinkeringActivity(rowData as TinkeringActivity, selectedStudent!);
        setLoading(false);
        onClose();
    };
    const onSchoolSelect = (event: React.SyntheticEvent, value: {"label": string, "id": number}) => {
        setSelectedSchool(value?.id || null);
        getSchoolStudents(value?.id);
    }

    const onStudentSelect = (event: React.SyntheticEvent, value: {"label": string, "id": number}) => {
        setSelectedStudent(value?.id || null);
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Select a School</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="200px"
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={2}> {/* Added gap for spacing */}
                        <Autocomplete
                            options={schoolsAddresses}
                            loading={schoolLoading}
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
                        {selectedSchool !== null && (
                            <Autocomplete
                                options={students}
                                loading={studentLoading}
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
                        )}
                    </Box>
                )}
            </DialogContent>
            {!loading && (
                <DialogActions>
                    <Button onClick={onClose} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        disabled={!selectedSchool}
                    >
                        Save
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};