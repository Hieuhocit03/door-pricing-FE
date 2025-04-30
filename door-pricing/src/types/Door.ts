export interface DoorData {
    id: number;
    code: string;
    product_code: string;
    pressure: number;
    width: number;
    height: number;
    price: string;
}

export interface DoorPricingFormData {
    product_code: string;
    pressure: number;
    width: number;
    height: number;
} 