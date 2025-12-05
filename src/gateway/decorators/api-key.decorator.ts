import { SetMetadata } from '@nestjs/common';

export const API_KEY_META = 'isApiKey';
export const ApiKeyAuth = () => SetMetadata(API_KEY_META, true);
