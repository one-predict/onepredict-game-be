import { Inject } from '@nestjs/common';
import UserInventoryModuleTokens from '@inventory/inventory.module.tokens';

const InjectUserInventoryRepository = () => {
  return Inject(UserInventoryModuleTokens.Repositories.UserInventoryRepository);
};

export default InjectUserInventoryRepository;
