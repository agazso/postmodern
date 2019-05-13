import { Model } from './Model';

export interface Feed extends Model {
    name: string;
    url: string;
    feedUrl: string;
    favicon: string | number;
    followed?: boolean;
    favorite?: boolean;
    contentHash?: string;
}
