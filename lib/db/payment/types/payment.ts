export type Payment = {
    id?: number;
    created_at?: string;
    amount: number;
    currency: string;
    merchantTransactionId?: string;
    status: "not required" | "pending" | "success" | "failed";
    type: string;
    user_id: string;
    ref_table: string;
    ref_id: number;
    timestamp: string;
}