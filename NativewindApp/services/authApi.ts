import { baseApi } from './baseApi';
import { saveJWTToken } from '../utils/tokenStorage';
import { UserProfile } from '@/types';

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
                    const {data} = await queryFulfilled;
                    console.log(data);
                    if(data) {
                        await saveJWTToken(data);
                    }
                } catch(error) {
                    console.log(error.error)
                }
            }
        }),
        register: build.mutation({
            query: (credentials) => ({
                url: "/Account/Register",
                method: "POST",
                body: credentials
            }),
            async onQueryStarted(arg, {queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled;
                    if(data) {
                        await saveJWTToken(data);
                    }
                } catch(error) {
                    console.log(error.error);
                }
            }
        }),
        me: build.query<UserProfile, void>({
            query: () => ({
                url: "/Account/Me",
                method: "GET"
            })
        })
    })
})

export const {useLoginMutation, useRegisterMutation, useMeQuery} = authApi;