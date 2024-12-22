declare module "youtube-search-api";

declare interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

declare interface UserPrefs {
    name: string | null;
    theme: string | null;
    art_style: string | null;
}

declare interface InventoryItem {
    name: string;
    description: string;
}

declare interface ResponseData {
    content: string;
    image_url: string | null;
    image_pending?: boolean;
    options: string[];
    inventory: InventoryItem[];
}