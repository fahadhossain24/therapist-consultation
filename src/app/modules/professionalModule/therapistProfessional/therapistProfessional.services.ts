import { ITherapistProfessional } from "./therapistProfessional.interface";
import TherapistProfessional from "./therapistProfessional.model";

// service for create new therapist professional
const createTherapistProfessional = async (data: Partial<ITherapistProfessional>) => {
    // console.log(data)
    return await TherapistProfessional.create(data);
}

// service for retrive specific therapist professional by user id
const getSpecificTherapistProfessional = async (userId: string) => {
    return await TherapistProfessional.findOne({ therapist: userId });
}

// service for update specific therapist professional by user id
const updateTherapistProfessionalByuserId = async (userId: string, data: Partial<ITherapistProfessional>) => {
    return await TherapistProfessional.updateOne({ therapist: userId }, data, { runValidators: true });
}

export default {
    createTherapistProfessional,
    getSpecificTherapistProfessional,
    updateTherapistProfessionalByuserId
}