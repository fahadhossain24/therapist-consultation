import { ISpeciality } from './speciality.interface';
import Speciality from './speciality.model';

class SpecialityServices {
    public async addSpeciality(speciality: Partial<ISpeciality>) {
        const newSpeciality = new Speciality(speciality);
        return await newSpeciality.save();
    }

    public async getAllSpecialities(searchQuery: string, skip: number, limit: number): Promise<Partial<ISpeciality[]>> {
        const query: any = {};
        if (searchQuery) {
            query.$text = { $search: searchQuery };
        }
        return await Speciality.find(query).skip(skip).limit(limit);
    }

    public async deleteSpecificSpeciality(id: string) {
        return await Speciality.deleteOne({ _id: id });
    }

    public async updateSpecificSpeciality(id: string, data: Partial<ISpeciality>) {
        return await Speciality.updateOne({ _id: id }, data, {
            runValidators: true,
        });
    }
}

export default new SpecialityServices();
