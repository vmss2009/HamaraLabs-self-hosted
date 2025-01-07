export type Country = {
    id?: number;
    created_at?: string;
    country_name: string;
}

export type State = {
    id?: number;
    created_at?: string;
    state_name: string;
    country: Country["id"];
}

export type City = {
    id?: number;
    created_at?: string;
    city_name: string;
    state: State["id"];
}

export type Address = {
    id?: number;
    created_at?: string;
    address_line1?: string;
    address_line2?: string;
    city: City["id"];
    pincode: string;
}
