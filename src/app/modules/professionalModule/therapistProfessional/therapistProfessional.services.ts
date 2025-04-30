import { ITherapistProfessional } from './therapistProfessional.interface';
import TherapistProfessional from './therapistProfessional.model';

// service for create new therapist professional
const createTherapistProfessional = async (data: Partial<ITherapistProfessional>) => {
    // console.log(data)
    return await TherapistProfessional.create(data);
};

// service for retrive specific therapist professional by user id
const getSpecificTherapistProfessional = async (userId: string) => {
    return await TherapistProfessional.findOne({ therapist: userId });
};

// service for update specific therapist professional by user id
const updateTherapistProfessionalByuserId = async (userId: string, data: Partial<ITherapistProfessional>) => {
    return await TherapistProfessional.updateOne({ therapist: userId }, data, { runValidators: true });
};

// service to get all therapists by speciality
const getAllTherapistsBySpeciality = async (speciality: string, skip: number, limit: number) => {
    return await TherapistProfessional.find({ speciality })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'therapist',
            select: '-verification -password -isEmailVerified -isSocial -fcmToken -createdAt -updatedAt',
            populate: {
                path: 'profile',
                select: '',
                populate: {
                    path: 'speciality',
                    select: 'name image',
                },
            },
        });
};

export default {
    createTherapistProfessional,
    getSpecificTherapistProfessional,
    updateTherapistProfessionalByuserId,
    getAllTherapistsBySpeciality,
};
