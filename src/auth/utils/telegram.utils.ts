import * as crypto from 'crypto';
import { TelegramAppInitData } from '@auth/types';

export const getTelegramInitDataFromSignInMessage = (signInMessage: string) => {
  const signInSearchParams = new URLSearchParams(signInMessage);
  const initData = {};

  for (const [key, value] of signInSearchParams.entries()) {
    initData[key] = value;
  }

  return initData as TelegramAppInitData;
}

export const verifyTelegramSignInMessage = (telegramSignInMessage: string, telegramBotToken: string) => {
  const searchParams = new URLSearchParams(telegramSignInMessage);
  const dataToCheck: string[] = [];

  const signature = searchParams.get('hash');

  searchParams.delete('hash');
  searchParams.sort();

  searchParams.forEach((value, key) => dataToCheck.push(`${key}=${value}`));

  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(telegramBotToken)
    .digest();

  const messageHash = crypto
    .createHmac('sha256', secret)
    .update(dataToCheck.join('\n'))
    .digest('hex');

  return signature === messageHash;
}
