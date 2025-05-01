import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import bankInfoService from './bankInfo.service';
import sendResponse from '../../../shared/sendResponse';
import CustomError from '../../errors';
import { StatusCodes } from 'http-status-codes';
import { isVerifiedSwiftAndIban } from '../../../shared/testSwiftAndIBAN';
import mongoose from 'mongoose';

// Controller for creating a new bankInfo
const createBankInfo = asyncHandler(async (req: Request, res: Response) => {
    const bankInfo = req.body;

    // isVerifiedSwiftAndIban(bankInfo.swiftCode, bankInfo.iban);

    const newBankInfo = await bankInfoService.createBankInfo(bankInfo);
    if (!newBankInfo) {
        throw new CustomError.BadRequestError('Failed to create new bankInfo!');
    }

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        status: 'success',
        message: 'Bank Info created successfully',
        data: newBankInfo,
    });
});

// Controller for getting all bankInfos
const getBankInfos = asyncHandler(async (req: Request, res: Response) => {
    const bankInfos = await bankInfoService.getAllBankInfos();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Bank Infos retrieved successfully',
        data: bankInfos,
    });
});

// Controller for getting a specific bankInfo
const getSpecificBankInfo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const bankInfo = await bankInfoService.getSpecificBankInfo(id);
    if (!bankInfo) {
        throw new CustomError.NotFoundError('Bank Info not found!');
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Bank Info retrieved successfully',
        data: bankInfo,
    });
});

// Controller for updating a specific bankInfo
const updateSpecificBankInfo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const updatedBankInfo = await bankInfoService.updateSpecificBankInfo(id, data);
    if (!updatedBankInfo.modifiedCount) {
        throw new CustomError.BadRequestError('Failed to update Bank Info!');
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Bank Info updated successfully',
    });
});

// Controller for deleting a specific bankInfo
const deleteSpecificBankInfo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedBankInfo = await bankInfoService.deleteSpecificBankInfo(id);
    if (!deletedBankInfo.deletedCount) {
        throw new CustomError.BadRequestError('Failed to delete Bank Info!');
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Bank Info deleted successfully',
    });
});

// controller for active specific bank
const activeSpecificBankInfo = asyncHandler(async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError.BadRequestError('Invalid Bank Info ID provided!');
        }

        // Check if the bank info is already active
        const existingActiveBankInfo = await bankInfoService.retriveBankInfoWithTrueByBankId(id);
        if (existingActiveBankInfo) {
            throw new CustomError.BadRequestError('The specified Bank Info is already active!');
        }

        // Inactivate all bank info
        const inactiveBankInfos = await bankInfoService.inactiveAllBankInfo(session);
        if (inactiveBankInfos.modifiedCount === 0) {
            throw new CustomError.BadRequestError('No Bank Info found to inactivate!');
        }

        // Activate the specific bank info
        const activeSpecificBankInfo = await bankInfoService.activeSpecificBankInfo(id, session);
        if (activeSpecificBankInfo.modifiedCount === 0) {
            throw new CustomError.BadRequestError(`Failed to activate Bank Info with ID: ${id}.`);
        }

        // Commit the transaction
        await session.commitTransaction();
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            status: 'success',
            message: 'Bank Info activated successfully',
        });
    } catch (error) {
        // Abort the transaction on error
        await session.abortTransaction();
        throw error; // Re-throw the error for further handling
    } finally {
        session.endSession();
    }
});

export default {
    createBankInfo,
    getBankInfos,
    getSpecificBankInfo,
    updateSpecificBankInfo,
    deleteSpecificBankInfo,
    activeSpecificBankInfo,
};
