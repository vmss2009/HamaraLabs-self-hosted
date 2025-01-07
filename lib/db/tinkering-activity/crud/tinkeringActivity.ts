'use server';

import { createClient } from '@/utils/supabase/server';
import { addPayment } from "@/lib/db/payment/crud/payment";
import { TinkeringActivity, CustomisedTinkeringActivity } from '@/lib/db/tinkering-activity/types/tinkeringActivity'
import { Student } from "@/lib/db/student/types/student";
import { Payment } from "@/lib/db/payment/types/payment";

export const addTinkeringActivity = async (dataToSubmit: TinkeringActivity) => {
    const supabase = await createClient();

    const { data, error } = await supabase.from("tinkering_activity").insert([dataToSubmit]).select();
    if (error) throw error;

    return data;
};

export const assignTinkeringActivity = async (taData: TinkeringActivity, studentId: number) => {
    const supabase = await createClient();

    const taDataId = (taData as TinkeringActivity).id;

    delete taData.id;
    delete taData.created_at;
    delete taData.serial;
    delete taData.subject;
    delete taData.topic;
    delete taData.subTopic;
    taData.sub_topic = (taData.sub_topic as unknown as { id: number }).id;
    taData.type = "custom"

    const { data: studentData, error: studentError } = await supabase.from("student").select().eq("id", studentId).single();

    const ta: TinkeringActivity[] = await addTinkeringActivity(taData as TinkeringActivity);

    const user_id = (studentData as Student).student;

    const paymentDetails: Payment = {
        amount: 0,
        currency: "INR",
        status: "not required",
        type: "tinkeringActivity",
        user_id: user_id!,
        ref_table: "tinkering_activity",
        ref_id: ta[0].id!,
        timestamp: new Date().toISOString()
    }
    const payment: Payment[] = await addPayment(paymentDetails);

    const dataToSubmit: CustomisedTinkeringActivity = {
        base_ta: taDataId!,
        ta: ta[0].id!,
        user_id: user_id!,
        payment: payment[0].id!
    }

    const { data, error } = await supabase.from("customised_ta").insert(dataToSubmit).select();

    if (error) throw error;
    return data;

};
