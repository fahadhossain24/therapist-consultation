import express from 'express'
import sliderControllers from './slider.controllers'
import authorization from '../../middlewares/authorization';
const sliderRouter = express.Router()

sliderRouter.post('/create', authorization('super-admin', 'admin'), sliderControllers.createSlider);
sliderRouter.get('/retrive/all', authorization('super-admin', 'admin', 'outlet', 'user'), sliderControllers.getAllSlider);
sliderRouter.get('/retrive/:id', authorization('super-admin', 'admin', 'outlet', 'user'), sliderControllers.getSpecificSlider);
sliderRouter.patch('/update/:id', authorization('super-admin', 'admin'), sliderControllers.updateSpecificSlider);
sliderRouter.delete('/delete/:id', authorization('super-admin', 'admin'), sliderControllers.deleteSpecificSlider);

export default sliderRouter