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

export default {
  createCallLog,
  updateCallLog,
};
