import * as SecureStore from 'expo-secure-store'; 

export const getJWTToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync('user_jwt');
    } catch (error) {
        return null;
    }
}

export const saveJWTToken = async (token: string): Promise<void> => {
    await SecureStore.setItemAsync("user_jwt", token);
}

export const removeJWTToken = async (): Promise<void> => {
    await SecureStore.deleteItemAsync("user_jwt");
}