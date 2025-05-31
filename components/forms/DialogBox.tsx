import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Box,
    Checkbox,
    TextField,
    Autocomplete,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { Button } from "@/components/ui/Button";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface Student {
    id: string | number;
    first_name: string;
    last_name: string;
}

interface School {
    id: string | number;
    name: string;
}

interface AssignDialogProps {
    open: boolean;
    onClose: () => void;
    formtype: string;
    selectedActivity: {
        id: string | number;
        name: string;
    } | null;
    setSuccess?: (message: string | null) => void;
}

export default function AssignDialog({
    open,
    onClose,
    formtype,
    selectedActivity,
    setSuccess,
}: AssignDialogProps) {
    const [assignError, setAssignError] = useState<string | null>(null);
    const [assignLoading, setAssignLoading] = useState(false);

    const [schools, setSchools] = useState<School[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [selectedSchool, setSelectedSchool] = useState<string | number>("");
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]); // Ensure consistent type (string)

    const fetchSchools = async () => {
        try {
            const response = await fetch("/api/schools");
            if (!response.ok) throw new Error("Failed to fetch schools");
            const data = await response.json();
            setSchools(data);
        } catch (error) {
            console.error("Error fetching schools:", error);
        }
    };

    const fetchStudents = async (schoolId: string) => {
        try {
            const response = await fetch(`/api/students?school_id=${schoolId}`);
            if (!response.ok) throw new Error("Failed to fetch students");
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    useEffect(() => {
        if (open) fetchSchools();
    }, [open]);

    useEffect(() => {
        if (selectedSchool) {
            fetchStudents(String(selectedSchool));
        } else {
            setStudents([]);
            setSelectedStudents([]);
        }
    }, [selectedSchool]);

    const getApiEndpoint = (formType: string): string => {
        switch (formType) {
            case "Course":
                return "/api/customised-courses";
            case "Competition":
                return "/api/customised-competitions";
            case "Tinkering-activity":
                return "/api/customised-tinkering-activities";
            default:
                return "";
        }
    };

    const handleAssignSubmit = async () => {
        if (!selectedStudents.length || !selectedActivity) return;

        const apiEndpoint = getApiEndpoint(formtype);
        if (!apiEndpoint) {
            setAssignError("Invalid form type");
            return;
        }

        try {
            setAssignLoading(true);
            setAssignError(null);

            const formattedDate = new Date().toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });

            console.log("Selected students", selectedStudents);
            console.log("Selected activity", selectedActivity);
            console.log("API endpoint", apiEndpoint);

            const promises = selectedStudents.map((studentId) =>
                fetch(apiEndpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: selectedActivity.id,
                        student_id: studentId,
                        status: [`Assigned - ${formattedDate}`],
                    }),
                })
            );

            await Promise.all(promises);
            onClose();
            setSelectedStudents([]);
            setSelectedSchool("");
            setSuccess?.("Assigned successfully");
            setTimeout(() => setSuccess?.(null), 3000);
        } catch (error) {
            console.error("Error assigning:", error);
            setAssignError("Failed to assign");
        } finally {
            setAssignLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setSelectedSchool("");
        setSelectedStudents([]);
        setAssignError(null);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Assign {formtype}</DialogTitle>
            <DialogContent>
                {assignError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {assignError}
                    </Alert>
                )}
                <Box mt={2}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {formtype}: {selectedActivity?.name}
                        </label>
                    </div>

                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select School
                            </label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={selectedSchool}
                                onChange={(e) => setSelectedSchool(e.target.value)}
                                disabled={assignLoading}
                            >
                                <option value="">Select a school</option>
                                {schools.map((school) => (
                                    <option key={school.id} value={school.id}>
                                        {school.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Students
                            </label>
                            <Autocomplete
                                multiple
                                options={students}
                                disableCloseOnSelect
                                getOptionLabel={(option: Student) =>
                                    `${option.first_name} ${option.last_name}`
                                }
                                value={students.filter((student) =>
                                    selectedStudents.includes(String(student.id))
                                )}
                                onChange={(_, newValue: Student[]) => {
                                    setSelectedStudents(
                                        newValue.map((s) => String(s.id))
                                    );
                                }}
                                disabled={!selectedSchool || assignLoading}
                                renderOption={(props, option: Student, { selected }) => (
                                    <Box component="li" {...props}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option.first_name} {option.last_name}
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Search students..."
                                        variant="outlined"
                                    />
                                )}
                            />
                        </div>
                    </div>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="default"
                    color="primary"
                    size="sm"
                    disabled={assignLoading}
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <Button
                    variant="default"
                    color="primary"
                    size="sm"
                    onClick={handleAssignSubmit}
                    disabled={assignLoading || selectedStudents.length === 0}
                >
                    {assignLoading ? "Assigning..." : "Assign"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
