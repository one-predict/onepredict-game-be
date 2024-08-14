import { Inject } from '@nestjs/common';
import UserInventoryModuleTokens from '@inventory/inventory.module.tokens';

const InjectUserInventoryService = () => {
  return Inject(UserInventoryModuleTokens.Services.UserInventoryService);
};

export default InjectUserInventoryService;
