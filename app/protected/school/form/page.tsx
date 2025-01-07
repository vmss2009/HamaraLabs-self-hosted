"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { Country, State, City } from "@/lib/db/address/types/address";
import { useCountries } from "@/hooks/address/useCountries";
import { useStates } from "@/hooks/address/useStates";
import { useCities } from "@/hooks/address/useCities";
import {
    Paper,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    InputLabel,
    Box,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid2';

export default function Page() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [socialLinks, setSocialLinks] = useState<string[]>([""]);
    const [selectedSyllabi, setSelectedSyllabi] = useState<string[]>([]);
    const { countries, getCountries } = useCountries();
    const { states, getStates } = useStates();
    const { cities, getCities } = useCities();

    useEffect(() => {
        getCountries();
    }, []);

    const handleCountryChange = (e: SelectChangeEvent<unknown>) => {
        getStates(Number(e.target.value));
    };

    const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
        getCities(Number(e.target.value));
    };

    const handleSyllabiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setSelectedSyllabi((prev) => {
            if (checked) {
                return [...prev, value];
            } else {
                return prev.filter((syllabus) => syllabus !== value);
            }
        });
    };

    const handleSocialLinkChange = (index: number, value: string) => {
        const updatedLinks = [...socialLinks];
        updatedLinks[index] = value;
        setSocialLinks(updatedLinks);
    };

    const addSocialLink = () => setSocialLinks([...socialLinks, ""]);
    const removeSocialLink = (index: number) =>
        setSocialLinks(socialLinks.filter((_, i) => i !== index));

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData(event.currentTarget);
            const response = await fetch("/api/school", {
                method: "POST",
                body: JSON.stringify({
                    name: formData.get("name"),
                    is_ATL: formData.get("isATL"),
                    address: {
                        address_line1: formData.get("addressLine1"),
                        address_line2: formData.get("addressLine2"),
                        city: formData.get("city"),
                        pincode: formData.get("pincode"),
                    },
                    in_charge: {
                        firstName: formData.get("inChargeFirstName"),
                        lastName: formData.get("inChargeLastName"),
                        email: formData.get("inChargeEmail"),
                        whatsapp: formData.get("inChargeWhatsapp"),
                    },
                    correspondent: {
                        firstName: formData.get("correspondentFirstName"),
                        lastName: formData.get("correspondentLastName"),
                        email: formData.get("correspondentEmail"),
                        whatsapp: formData.get("correspondentWhatsapp"),
                    },
                    principal: {
                        firstName: formData.get("principalFirstName"),
                        lastName: formData.get("principalLastName"),
                        email: formData.get("principalEmail"),
                        whatsapp: formData.get("principalWhatsapp"),
                    },
                    syllabus: selectedSyllabi,
                    website_url: formData.get("websiteURL"),
                    paid_subscription: formData.get("paidSubscription"),
                    social_links: socialLinks,
                }),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit the data.");
            }

            alert("Form submitted successfully!");
            event.currentTarget.reset();
            setSocialLinks([""]);
            setSelectedSyllabi([]);
        } catch (error) {
            setError((error as Error).message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Paper elevation={3} sx={{ padding: '20px', backgroundColor: '#f5f5f5' }} >
            <div className="max-w-4xl mx-auto space-y-6">
                {error && <Typography color="error">{error}</Typography>}
                <form onSubmit={onSubmit}>
                    {/* Name */}
                    <Box mb={2}>
                        <TextField
                            label="Name"
                            name="name"
                            variant="outlined"
                            fullWidth
                            required
                        />
                    </Box>

                    {/* isATL */}
                    <Box mb={2}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Is ATL ?</FormLabel>
                            <RadioGroup name="isATL" row>
                                <FormControlLabel
                                    value="Yes"
                                    control={<Radio />}
                                    label="Yes"
                                />
                                <FormControlLabel
                                    value="No"
                                    control={<Radio />}
                                    label="No"
                                />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    {/* Address */}
                    <Box mb={2}>
                        <Typography variant="h6">School Address</Typography>
                        <TextField
                            label="Address Line 1"
                            name="addressLine1"
                            variant="outlined"
                            fullWidth
                            required
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Address Line 2"
                            name="addressLine2"
                            variant="outlined"
                            fullWidth
                        />
                    </Box>

                    <Box mb={2}>
                        <InputLabel>Country</InputLabel>
                        <Select
                            defaultValue={""}
                            onChange={handleCountryChange}
                            name="country"
                            fullWidth
                        >
                            <MenuItem value="">Select country</MenuItem>
                            {countries.map((country: Country) => (
                                <MenuItem key={country.id} value={country.id}>
                                    {country.country_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>

                    <Box mb={2}>
                        <InputLabel>State</InputLabel>
                        <Select
                            onChange={handleSelectChange}
                            defaultValue={""}
                            name="state"
                            fullWidth
                        >
                            <MenuItem value="">Select state</MenuItem>
                            {states.map((state: State) => (
                                <MenuItem key={state.id} value={state.id}>
                                    {state.state_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>

                    <Box mb={2}>
                        <InputLabel>City</InputLabel>
                        <Select name="city" fullWidth defaultValue={""}>
                            <MenuItem value="">Select city</MenuItem>
                            {cities.map((city: City) => (
                                <MenuItem key={city.id} value={city.id}>
                                    {city.city_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>

                    <Box mb={2}>
                        <TextField
                            label="Pincode"
                            name="pincode"
                            variant="outlined"
                            fullWidth
                            required
                        />
                    </Box>

                    {/* In-charge Details */}
                    <Box mb={2}>
                        <Typography variant="h6">In-Charge Details (Optional)</Typography>
                        <TextField
                            label="First Name"
                            name="inChargeFirstName"
                            variant="outlined"
                            fullWidth
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Last Name"
                            name="inChargeLastName"
                            variant="outlined"
                            fullWidth
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Email"
                            name="inChargeEmail"
                            variant="outlined"
                            fullWidth
                            type="email"
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="WhatsApp No"
                            name="inChargeWhatsapp"
                            variant="outlined"
                            fullWidth
                        />
                    </Box>

                    {/* Correspondent Details */}
                    <Box mb={2}>
                        <Typography variant="h6">Correspondent Details (Optional)</Typography>
                        <TextField
                            label="First Name"
                            name="correspondentFirstName"
                            variant="outlined"
                            fullWidth
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Last Name"
                            name="correspondentLastName"
                            variant="outlined"
                            fullWidth
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Email"
                            name="correspondentEmail"
                            variant="outlined"
                            fullWidth
                            type="email"
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="WhatsApp No"
                            name="correspondentWhatsapp"
                            variant="outlined"
                            fullWidth
                        />
                    </Box>

                    {/* Principal Details */}
                    <Box mb={2}>
                        <Typography variant="h6">Principal Details (Optional)</Typography>
                        <TextField
                            label="First Name"
                            name="principalFirstName"
                            variant="outlined"
                            fullWidth
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Last Name"
                            name="principalLastName"
                            variant="outlined"
                            fullWidth
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Email"
                            name="principalEmail"
                            variant="outlined"
                            fullWidth
                            type="email"
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="WhatsApp No"
                            name="principalWhatsapp"
                            variant="outlined"
                            fullWidth
                        />
                    </Box>

                    {/* Syllabus */}
                    <Box mb={2}>
                        <Typography variant="h6">Syllabus</Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value="CBSE"
                                    onChange={handleSyllabiChange}
                                />
                            }
                            label="CBSE"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value="State"
                                    onChange={handleSyllabiChange}
                                />
                            }
                            label="State"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value="ICSE"
                                    onChange={handleSyllabiChange}
                                />
                            }
                            label="ICSE"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value="IGCSE"
                                    onChange={handleSyllabiChange}
                                />
                            }
                            label="IGCSE"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value="IB"
                                    onChange={handleSyllabiChange}
                                />
                            }
                            label="IB"
                        />
                    </Box>

                    {/* Website URL */}
                    <Box mb={2}>
                        <TextField
                            label="Website URL"
                            name="websiteURL"
                            variant="outlined"
                            fullWidth
                        />
                    </Box>

                    {/* Paid Subscription */}
                    <Box mb={2}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Paid Subscription</FormLabel>
                            <RadioGroup name="paidSubscription" row>
                                <FormControlLabel
                                    value="Yes"
                                    control={<Radio />}
                                    label="Yes"
                                />
                                <FormControlLabel
                                    value="No"
                                    control={<Radio />}
                                    label="No"
                                />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    {/* Social Links */}
                    <Box mb={2}>
                        <Typography variant="h6">Social Links</Typography>
                        {socialLinks.map((link, index) => (
                            <Grid container spacing={2} key={index}>
                                <Grid size={{xs: 10}}>
                                    <TextField
                                        value={link}
                                        onChange={(e) =>
                                            handleSocialLinkChange(index, e.target.value)
                                        }
                                        label={`Social Link ${index + 1}`}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={{xs: 2}}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        fullWidth
                                        onClick={() => removeSocialLink(index)}
                                    >
                                        <MdOutlineDeleteOutline />
                                    </Button>
                                </Grid>
                            </Grid>
                        ))}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={addSocialLink}
                        >
                            Add Social Link
                        </Button>
                    </Box>

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