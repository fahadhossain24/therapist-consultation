import { Request, Response } from 'express';
import fileUploader from '../../../utils/fileUploader';
import { FileArray } from 'express-fileupload';
import Slider from './slider.model';
import CustomError from '../../errors';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import asyncHandler from '../../../shared/asyncHandler';

// controller for create new slider
const createSlider = asyncHandler(async (req: Request, res: Response) => {
    const sliderData = req.body;

    if (req.files) {
        const sliderImagePath = await fileUploader(req.files as FileArray, `slider-image`, 'image');
        sliderData.image = sliderImagePath;
    }

    const slider = await Slider.create(sliderData);
    if (!slider) {
        throw new CustomError.BadRequestError('Failed to create slider!');
    }

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        status: 'success',
        message: 'slider image create successfull',
        data: slider,
    });
});

const getAllSlider = asyncHandler(async (req: Request, res: Response) => {
    const sliders = await Slider.find();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'slider images retrive successfull',
        data: sliders,
    });
});

const getSpecificSlider = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new CustomError.BadRequestError('Missing id in request params!');
    }

    const slider = await Slider.findOne({ _id: id });
    if (!slider) {
        throw new CustomError.NotFoundError('No slider found!');
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'slider images retrive successfull',
        data: slider,
    });
});

const updateSpecificSlider = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const files = req.files;
    if (!id) {
        throw new CustomError.BadRequestError('Missing id in request params!');
    }

    if (files) {
        const sliderImagePath = await fileUploader(req.files as FileArray, `slider-image`, 'image');
        req.body.image = sliderImagePath;
    }

    const updatedSlider = await Slider.updateOne({ _id: id }, req.body, {
        runValidators: true,
    });

    if (!updatedSlider.modifiedCount) {
        throw new CustomError.BadRequestError('Failed to update slider');
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'slider update successfull',
    });
});

const deleteSpecificSlider = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new CustomError.BadRequestError('Missing id in request params!');
    }

    const deletedSlider = await Slider.deleteOne({ _id: id });

    if (!deletedSlider.deletedCount) {
        throw new CustomError.BadRequestError('Failed to delete slider');
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'slider delete successfull',
    });
});

export default {
    createSlider,
    getAllSlider,
    getSpecificSlider,
    updateSpecificSlider,
    deleteSpecificSlider,
};
