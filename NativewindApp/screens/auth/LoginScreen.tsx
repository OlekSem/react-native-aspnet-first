import { View, Text, TextInput, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import {useRouter} from "expo-router";
import { useLoginMutation } from "@/services/authApi";
import { useDispatch } from "react-redux";

type LoginFormData = {
    email: string;
    password: string;
};

export default function LoginScreen() {
    const { control, handleSubmit } = useForm<LoginFormData>();
    const router = useRouter();

    const dispatch = useDispatch();
    const [login, {isLoading, error}] = useLoginMutation();

    const onSubmit = async (data: LoginFormData) => {
        console.log("Form data:", data);
        try {
            await login(data).unwrap();
            router.push("/explore"); 
        } catch (err) {
            console.error('Failed to log in:', err);
        }
    };
    
    return (
        <View className="flex-1 justify-center items-center bg-gray-100 px-6">
            <Text className="text-3xl font-bold text-blue-600 mb-4">
                Увійти в акаунт
            </Text>
            {error && <View className="text-red-500 "><Text>{error.data}</Text></View>}

            <Controller control={control}
                        name="email"
                        rules={{ required: "Email обов’язковий" }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                placeholder="Email"
                                keyboardType="email-address"
                                value={value}
                                onChangeText={onChange}
                                className="w-full max-w-md bg-white rounded-lg px-4 py-3 mb-4 border border-gray-300"
                            />
                        )}
            />

            <Controller control={control}
                        name="password"
                        rules={{ required: "Пароль обов’язковий" }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput placeholder="Пароль"
                                       secureTextEntry
                                       value={value}
                                       onChangeText={onChange}
                                       className="w-full max-w-md bg-white rounded-lg px-4 py-3 mb-6 border border-gray-300"
                            />
                        )}
            />

            <Pressable onPress={handleSubmit(onSubmit)}
                       className="w-full max-w-md bg-blue-500 rounded-lg py-3 items-center"
            >
                <Text className="text-white font-semibold">Увійти</Text>
            </Pressable>

        </View>
    );
}