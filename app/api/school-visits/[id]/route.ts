import { failure, success } from "@/lib/api/http";
import { getSchoolVisitById, updateSchoolVisit, deleteSchoolVisit } from "@/lib/db/school-visits/crud";
import { SchoolVisitUpdateInput, schoolVisitSchema } from "@/lib/db/school-visits/type";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
    try {
        const visit = await getSchoolVisitById(params.id);
        
        if (!visit) {
            return failure("School visit not found", 404);
        }
        
        return success(visit);
    } catch (error) {
        console.error("Error fetching school visit:", error);
        return failure("Failed to fetch school visit", 500, {
            details: error instanceof Error ? error.message : String(error),
        });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {

    try {
        const visit = await getSchoolVisitById(params.id);
        
        if (!visit) {
            return failure("School visit not found", 404);
        }
        
        const body = await request.json();
        const result = schoolVisitSchema.partial().safeParse(body);
        if (!result.success) {
            const errorMessages = result.error.errors.map((err) => err.message);
            console.error("Validation failed:", errorMessages);
            return failure(errorMessages[0] ?? "Invalid data", 400, {
                code: "VALIDATION_ERROR",
                details: result.error.flatten(),
            });
        }

        const updatedData: SchoolVisitUpdateInput = {
            school_id: body.school_id,
            visit_date: new Date(body.visit_date),
            poc_id: body.poc_id === "other" ? null : body.poc_id,
            other_poc: body.other_poc,
            school_performance: body.school_performance,
            details: body.details,
        };

        const updatedVisit = await updateSchoolVisit(params.id, updatedData);

        return success(updatedVisit);
    } catch (error) {
        console.error("Error updating school visit:", error);
        return failure("Failed to update school visit", 500, {
            details: error instanceof Error ? error.message : String(error),
        });
    }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
    try {
        const visit = await getSchoolVisitById(params.id);
        
        if (!visit) {
            return failure("School visit not found", 404);
        }
        
        await deleteSchoolVisit(params.id);
        return success({ message: "School visit deleted successfully" });
    } catch (error) {
        console.error("Error deleting school visit:", error);
        return failure("Failed to delete school visit", 500, {
            details: error instanceof Error ? error.message : String(error),
        });
    }
} 
