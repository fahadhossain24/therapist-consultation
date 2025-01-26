import { ITherapistProfessional } from './therapistProfessional.interface';
import therapistProfessionalServices from './therapistProfessional.services';

// function for create or update specific therapist professional by user Id
const createOrUpdateTherapistProfessional = async (userId: string, data: Partial<ITherapistProfessional>) => {
  const therapistProfessional = await therapistProfessionalServices.getSpecificTherapistProfessional(userId);

  if (therapistProfessional) {
    const updatedTherapistProfessional = await therapistProfessionalServices.updateTherapistProfessionalByuserId(userId, data);
    if (!updatedTherapistProfessional) {
      throw new Error('Failed to update therapist professional');
    }
    return therapistProfessional;
  }

  data.isPremium = true;
  const newTherapistProfessional = await therapistProfessionalServices.createTherapistProfessional(data);
  if (!newTherapistProfessional) {
    throw new Error('Failed to create therapist professional');
  }
  return newTherapistProfessional;
};

export default {
  createOrUpdateTherapistProfessional,
};
