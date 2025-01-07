"use client";

import React, {useState, FormEvent, useEffect} from "react";
import {
    Paper,
    TextField,
    Button,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Autocomplete,
    Box,
    Typography,
    CircularProgress
} from "@mui/material";
import {useSchoolsAddresses} from "@/hooks/address/useSchoolsAddresses";

export default function Page() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
    const { schoolsAddresses, loading, getSchoolsAddresses } = useSchoolsAddresses();

    useEffect(() => {
        getSchoolsAddresses();
    }, []);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData(event.currentTarget);
            const response = await fetch("/api/student", {
                method: "POST",
                body: JSON.stringify({
                    school: selectedSchool,
                    firstName: formData.get("firstName"),
                    lastName: formData.get("lastName"),
                    gender: formData.get("gender"),
                    aspiration: formData.get("aspiration"),
                    email: formData.get("email"),
                    class: formData.get("class"),
                    section: formData.get("section"),
                    comments: formData.get("comments"),
                }),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit the form.");
            }

            alert("Form submitted successfully!");
            if (event.currentTarget) {
                event.currentTarget.reset();  // Reset the form only if currentTarget is not null
            }
        } catch (error) {
            setError((error as Error).message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Paper elevation={3} sx={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
            <div className="max-w-4xl mx-auto space-y-6">
                {error && <Typography color="error">{error}</Typography>}
                <form onSubmit={onSubmit}>
                    {/* School Selection */}
                    <Box mb={2}>
                        <Autocomplete
                            options={schoolsAddresses}
                            loading={loading}
                            getOptionLabel={(option) => option.label}
                            onChange={(event, value) => setSelectedSchool(value?.id || null)}
                            inputValue={inputValue}
                            onInputChange={(event, value) => setInputValue(value)}
                            filterOptions={(options, state) =>
                                state.inputValue
                                    ? options.filter((option) =>
                                        option.label.toLowerCase().includes(state.inputValue.toLowerCase())
                                    )
                                    : []
                            }
                            noOptionsText={
                                inputValue.trim()
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
                                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        },
                                    }}
                                />
                            )}
                        />
                    </Box>

                    {/* First Name */}
                    <Box mb={2}>
                        <TextField
                            label="First Name"
                            name="firstName"
                            variant="outlined"
                            fullWidth
                            required
                        />
                    </Box>

                    {/* Last Name */}
                    <Box mb={2}>
                        <TextField
                            label="Last Name"
                            name="lastName"
                            variant="outlined"
                            fullWidth
                            required
                        />
                    </Box>

                    {/* Gender */}
                    <Box mb={2}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Gender</FormLabel>
                            <RadioGroup name="gender" row>
                                <FormControlLabel
                                    value="Male"
                                    control={<Radio />}
                                    label="Male"
                                />
                                <FormControlLabel
                                    value="Female"
                                    control={<Radio />}
                                    label="Female"
                                />
                                <FormControlLabel
                                    value="Other"
                                    control={<Radio />}
                                    label="Other"
                                />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    {/* Aspiration */}
                    <Box mb={2}>
                        <TextField
                            label="Aspiration"
                            name="aspiration"
                            variant="outlined"
                            required
                            fullWidth
                        />
                    </Box>

                    {/* Email ID */}
                    <Box mb={2}>
                        <TextField
                            label="Email ID"
                            name="email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            required
                        />
                    </Box>

                    {/* Class */}
                    <Box mb={2}>
                        <TextField
                            label="Class"
                            name="class"
                            variant="outlined"
                            fullWidth
                            required
                        />
                    </Box>

                    {/* Section */}
                    <Box mb={2}>
                        <TextField
                            label="Section"
                            name="section"
                            variant="outlined"
                            fullWidth
                            required
                        />
                    </Box>

                    {/* Comments */}
                    <Box mb={2}>
                        <TextField
                            label="Comments"
                            name="comments"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                        />
                    </Box>

                    {/* Submit Button */}
                    <Box mb={2}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isLoading}
                        >
                            {isLoading ? "Submitting..." : "Submit"}
                        </Button>
                    </Box>
                </form>
            </div>
        </Paper>
    );
}