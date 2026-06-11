import { baseApi } from "@/services/baseApi";
import { removeJWTToken } from "@/utils/tokenStorage";
import { useDispatch } from "react-redux";

export const useLogout = () => {
    const dispatch = useDispatch();

    const logout = async () => {
        await removeJWTToken();
        // This is safe here because baseApi is imported inside a hook, 
        // which gets executed long after the API initialization script completes.
        dispatch(baseApi.util.resetApiState());
    };
    
    return logout;
}
