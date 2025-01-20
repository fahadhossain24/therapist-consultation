import { Document } from 'mongoose';

export interface ISlider extends Document {
  title: string;
  image: string;
}
