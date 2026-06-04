import { baseApi } from './baseApi';
import { saveJWTToken } from '../utils/tokenStorage';

export const authApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        login: build.mutation({
            query: (credentials) => ({
                url: "/Account/Login",
                method: "POST",
                body: credentials
            }),
            async onQueryStarted(arg, {queryFulfilled}) {
                try {
                    const data = await queryFulfilled;
                    if(data?.token) {
                        await saveJWTToken(data.token);
                    }
                } catch(error) {
                    console.log(error.error)
                }
            }
        }),
    })
})

export const {useLoginMutation} = authApi;