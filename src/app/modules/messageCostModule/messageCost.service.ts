import MessageCost from './messageCost.model';
import { IMessageCost } from './messageCost.interface';

class MessageCostServices {
  public async createMessageCost(messageCost: Partial<IMessageCost>) {
    const newMessageCost = new MessageCost(messageCost);
    return await newMessageCost.save();
  }

  public async getMessageCosts() {
    return await MessageCost.findOne({})
  }

  public async updateSpecificMessageCost(id: string, data: Partial<IMessageCost>) {
    const updatedMessageCost = await MessageCost.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return updatedMessageCost;
  }

  public async deleteSpecificMessageCost(id: string) {
    const deletedMessageCost = await MessageCost.findByIdAndDelete(id);
    return deletedMessageCost;
  }
}

export default new MessageCostServices();
