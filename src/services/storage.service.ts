import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

const uploadResume = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

    if (uploadError) {
        throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

export const StorageService = {
    uploadResume
};
