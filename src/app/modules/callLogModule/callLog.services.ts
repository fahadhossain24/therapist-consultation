import { ICallLog } from './callLog.interface';
import CallLog from './callLog.model';

// service to create new call log
const createCallLog = async (callLogData: Partial<ICallLog>) => {
  return await CallLog.create(callLogData);
};

// service to update call log
const updateCallLog = async (callLogId: string, callLogData: Partial<ICallLog>) => {
  return await CallLog.findOneAndUpdate({ _id: callLogId }, callLogData, { new: true });
};

// service to get call log by id
const getCallLogById = async (callLogId: string) => {
  return await CallLog.findById(callLogId);
};

export default {
  createCallLog,
  updateCallLog,
  getCallLogById,
};
