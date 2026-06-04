import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { getJWTToken, removeJWTToken } from '../utils/tokenStorage';
import { logoutUser } from '@/slices/authSlice';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: "https://p32-native.itstep.click/api",
    prepareHeaders: async (headers) => {
        const token = await getJWTToken();

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        return headers;
    }
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);
    if(result.error && result.error.status == 401) {
        console.warn("JWT token expired. Logging out user automatically.");

        await removeJWTToken();
        api.dispatch(logoutUser());
    }

    return result;
}

export const baseApi = createApi({
    reducerPath: "baseApi",
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({})
});