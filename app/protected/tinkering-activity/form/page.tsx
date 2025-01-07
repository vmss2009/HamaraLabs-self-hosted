"use client";

import React, { useState, useEffect, FormEvent } from "react";
import {
    Paper,
    TextField,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Box,
    Typography, SelectChangeEvent,
} from "@mui/material";
import { useSubjects } from "@/hooks/subject/useSubject";
import { useTopics } from "@/hooks/subject/useTopic";
import { useSubTopics } from "@/hooks/subject/useSubTopics";

export default function TinkeringActivityForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Dynamic fields state
    const [goals, setGoals] = useState<string[]>([""]);
    const [materials, setMaterials] = useState<string[]>([""]);
    const [instructions, setInstructions] = useState<string[]>([""]);
    const [tips, setTips] = useState<string[]>([""]);
    const [observations, setObservations] = useState<string[]>([""]);
    const [extensions, setExtensions] = useState<string[]>([""]);
    const [resources, setResources] = useState<string[]>([""]);
    const { subjects, getSubjects } = useSubjects();
    const { topics, getTopics } = useTopics();
    const { subTopics, getSubTopics } = useSubTopics();

    useEffect(() => {
        getSubjects();
    }, []);

    const handleSubjectChange = (event: SelectChangeEvent<unknown>) => {
        getTopics(Number(event.target.value));
    }

    const handleTopicChange = (event: SelectChangeEvent<unknown>) => {
        getSubTopics(Number(event.target.value));
    }

    // Helper functions for managing dynamic fields
    const handleChange = (
        setField: React.Dispatch<React.SetStateAction<string[]>>,
        index: number,
        value: string
    ) => {
        setField((prev) => {
            const updated = [...prev]; // Ensure `prev` is an array.
            updated[index] = value; // Update specific index.
            return updated;
        });
    };

    const addField = (
        setField: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setField((prev) => [...prev, ""]); // Add new field.
    };

    const removeField = (
        setField: React.Dispatch<React.SetStateAction<string[]>>,
        index: number
    ) => {
        setField((prev) => prev.filter((_, i) => i !== index)); // Remove field.
    };

    // Form submission
    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData(event.currentTarget);
            const response = await fetch("/api/tinkering-activity", {
                method: "POST",
                body: JSON.stringify({
                    sub_topic: Number(formData.get("sub_topic")),
                    name: formData.get("name"),
                    introduction: formData.get("introduction"),
                    goals,
                    materials,
                    instructions,
                    tips,
                    observations,
                    extensions,
                    resources,
                }),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit the form.");
            }

            alert("Form submitted successfully!");
        } catch (error) {
            setError((error as Error).message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }

    // Reusable dynamic field renderer
    const renderDynamicFields = (
        fieldName: string,
        fieldValues: string[],
        eachTextFieldFieldName: string,
        setFieldValues: React.Dispatch<React.SetStateAction<string[]>>
    ) => (
        <Box mb={3}>
            <Typography variant="h6">{fieldName}</Typography>
            {fieldValues.map((value, index) => (
                <Box key={index} mb={1} display="flex" alignItems="center">
                    <TextField
                        label={`${eachTextFieldFieldName} ${index + 1}`}
                        value={value}
                        onChange={(e) => handleChange(setFieldValues, index, e.target.value)}
                        fullWidth
                        sx={{ marginRight: "10px" }}
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => removeField(setFieldValues, index)}
                        disabled={fieldValues.length === 1}
                    >
                        Remove
                    </Button>
                </Box>
            ))}
            <Button
                variant="outlined"
                color="primary"
                onClick={() => addField(setFieldValues)}
            >
                Add {fieldName}
            </Button>
        </Box>
    );

    return (
        <Paper elevation={3} sx={{ padding: "20px", backgroundColor: "#f5f5f5" }}>
            {error && <Typography color="error">{error}</Typography>}
            <form onSubmit={onSubmit}>
                {/* Subject */}
                <Box mb={2}>
                    <FormControl fullWidth>
                        <InputLabel>Subject</InputLabel>
                        <Select onChange={handleSubjectChange} name="subject" defaultValue={""} required>
                            <MenuItem value="">Select subject</MenuItem>
                            {subjects.map((subject) => (
                                <MenuItem key={subject.id} value={subject.id}>
                                    {subject.subject}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Topic */}
                <Box mb={2}>
                    <FormControl fullWidth>
                        <InputLabel>Topic</InputLabel>
                        <Select name="topic" onChange={handleTopicChange} defaultValue={""} required>
                            <MenuItem value="">Select topic</MenuItem>
                            {topics.map((topic) => (
                                <MenuItem key={topic.id} value={topic.id}>
                                    {topic.topic}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Subtopic */}
                <Box mb={2}>
                    <FormControl fullWidth>
                        <InputLabel>Subtopic</InputLabel>
                        <Select name="sub_topic" defaultValue={""} required>
                            <MenuItem value="">Select subtopic</MenuItem>
                            {subTopics.map((subTopic) => (
                                <MenuItem key={subTopic.id} value={subTopic.id}>
                                    {subTopic.sub_topic}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Activity Name */}
                <Box mb={2}>
                    <TextField
                        label="Activity Name"
                        name="name"
                        fullWidth
                        required
                    />
                </Box>

                {/* Introduction */}
                <Box mb={2}>
                    <TextField
                        label="Introduction"
                        name="introduction"
                        fullWidth
                        multiline
                        rows={3}
                        required
                    />
                </Box>

                {/* Dynamic Fields */}
                {renderDynamicFields("Goals", goals, "Goal", setGoals)}
                {renderDynamicFields("Materials", materials, "Material", setMaterials)}
                {renderDynamicFields("Instructions", instructions, "Instruction", setInstructions)}
                {renderDynamicFields("Tips", tips, "Tip", setTips)}
                {renderDynamicFields("Observations", observations, "Observation", setObservations)}
                {renderDynamicFields("Extensions", extensions, "Extension", setExtensions)}
                {renderDynamicFields("Resources", resources, "Resource", setResources)}

                <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                    Submit
                </Button>
            </form>
        </Paper>
    );
}