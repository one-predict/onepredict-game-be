export interface TelegramAppInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    is_premium?: boolean;
    photo_url?: string;
  };
  hash: string;
}
