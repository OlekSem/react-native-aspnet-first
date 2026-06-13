import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { getJWTToken, removeJWTToken } from '../utils/tokenStorage';
import { DeviceEventEmitter } from 'react-native';

const rawBaseQuery = fetchBaseQuery({
    // baseUrl: "http://192.168.0.143:5207/api/",
    baseUrl: process.env.EXPO_PUBLIC_API_URL + "api/",
    prepareHeaders: async (headers) => {
        const token = await getJWTToken();
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    }
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);
    
    if (result.error && result.error.status === 401) {
        console.warn("JWT token expired. Logging out user automatically.");

        // 1. Wipe storage
        await removeJWTToken();
        
        // 2. Clear API cache safely using the string type identifier
        api.dispatch({ type: "baseApi/resetApiState" });

        // 3. Inform React Native layers to update UI and redirect immediately
        DeviceEventEmitter.emit('auth:force_logout');
    }

    return result;
}

export const baseApi = createApi({
    reducerPath: "baseApi",
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({})
});
