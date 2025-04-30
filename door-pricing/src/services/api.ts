import axios from 'axios';
import { DoorData } from '../types/Door';

// Mock data as fallback when API is unavailable
const mockData: DoorData[] = [
    {
        "id": 1,
        "code": "FIX1200400300",
        "product_code": "FIX",
        "pressure": 1200,
        "width": 400,
        "height": 300,
        "price": "60351.00"
    },
    {
        "id": 2,
        "code": "FIX1200500300",
        "product_code": "FIX",
        "pressure": 1200,
        "width": 500,
        "height": 300,
        "price": "75401.00"
    },
    {
        "id": 3,
        "code": "FIX600400300",
        "product_code": "FIX",
        "pressure": 600,
        "width": 400,
        "height": 300,
        "price": "50351.00"
    },
    {
        "id": 4,
        "code": "FIX600500300",
        "product_code": "FIX",
        "pressure": 600,
        "width": 500,
        "height": 300,
        "price": "65401.00"
    }
];

// Function to fetch data from real API
export const fetchDoorData = async (): Promise<DoorData[]> => {
    try {
        console.log('Attempting to fetch data from:', `${import.meta.env.VITE_API_URL}/api/products`);
        const response = await axios.get<DoorData[]>(`${import.meta.env.VITE_API_URL}/api/products`, {
            // Add CORS headers in case that's the issue
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            // Increase timeout to allow for slower connections
            timeout: 100000
        });
        console.log('API response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching door data:', error);
        // Log more detailed error information
        if (axios.isAxiosError(error)) {
            console.error('API Error details:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                data: error.response?.data
            });

            // Show alert with guidance
            alert(`Could not connect to the API at ${import.meta.env.VITE_API_URL}. Using mock data instead. Please ensure your backend server is running.`);
        }

        console.log('Falling back to mock data');
        // Return mock data as fallback
        return mockData;
    }
};

// Function to find the appropriate price based on specifications
export const findPrice = (
    productCode: string,
    pressure: number,
    width: number,
    height: number,
    doorData: DoorData[]
): string => {
    // Round up width and height as per specifications
    const roundedWidth = Math.ceil(width / 100) * 100;
    const roundedHeight = Math.ceil(height / 100) * 100;

    // Find matching door specification
    const matchingDoor = doorData.find(
        door =>
            door.product_code === productCode &&
            door.pressure === pressure &&
            door.width === roundedWidth &&
            door.height === roundedHeight
    );

    return matchingDoor ? matchingDoor.price : "Not available";
}; 