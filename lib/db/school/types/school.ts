import { Address } from "@/lib/db/address/types/address";

export type School = {
    id?: number;
    created_at?: string;
    name: string;
    is_ATL: boolean;
    address: Address["id"];
    in_charge?: string;
    correspondent?: string;
    principal?: string;
    syllabus?: string[];
    website_url?: string;
    paid_subscription: boolean;
    social_links?: string[];
}