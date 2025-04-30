import { Document } from 'mongoose';

export interface ISpeciality extends Document {
    name: string;
    image: string;
}
