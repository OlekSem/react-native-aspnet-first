import { View, Text, TextInput, Pressable, Image, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { ImagePickerAsset, launchImageLibraryAsync } from "expo-image-picker";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "@/services/authApi";

type RegisterFormData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    image: ImagePickerAsset | null;
};

export default function RegisterScreen() {
    const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            image: null
        }
    });

    const router = useRouter();

    const dispatch = useDispatch();
    const [register, { isLoading, error }] = useRegisterMutation();

    const onSubmit = async (data: RegisterFormData) => {
    console.log("Form data before submit:", data);

    try {
        const formData = new FormData();
        formData.append("firstName", data.firstName);
        formData.append("lastName", data.lastName);
        formData.append("email", data.email);
        formData.append("password", data.password);

        if (data.image && data.image.uri) {
            const fileUri = data.image.uri;

            // 1. Безпечно дістаємо ім'я файлу з URI (наприклад, "image-name.jpg")
            const extractedName = fileUri.split('/').pop() || `avatar_${Date.now()}.jpg`;

            // 2. Визначаємо розширення файлу для формування MIME-типу
            const fileExtension = extractedName.split('.').pop()?.toLowerCase() || 'jpg';
            
            // Задаємо правильний формат типу: image/jpeg або image/png
            const correctMimeType = `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`;

            formData.append("Image", { 
                uri: fileUri, 
                type: correctMimeType,
                name: extractedName
            } as any);
        }

        // Надсилаємо сформований FormData в RTK Query
        await register(formData).unwrap();
        
        dispatch(setAuthenticated(true));
        router.push("/explore");
    } catch (error) {
        console.error('Failed to register:', error);
    }
};

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-gray-100"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
                <Text className="text-3xl font-bold text-blue-600 mb-8">
                    Реєстрація користувача
                </Text>

                <Controller control={control}
                    name="firstName"
                    rules={{ required: "First Name обов’язковий" }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="First Name"
                            value={value}
                            onChangeText={onChange}
                            className="w-full max-w-md bg-white rounded-lg px-4 py-3 mb-4 border border-gray-300"
                        />
                    )}
                />

                <Controller control={control}
                    name="lastName"
                    rules={{ required: "Last Name обов’язковий" }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Last Name"
                            value={value}
                            onChangeText={onChange}
                            className="w-full max-w-md bg-white rounded-lg px-4 py-3 mb-4 border border-gray-300"
                        />
                    )}
                />
                <View className="w-full max-w-md mb-4">
                    <Controller control={control}
                        name="email"
                        rules={{ required: "Email обов’язковий" }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                placeholder="Email"
                                keyboardType="email-address"
                                value={value}
                                onChangeText={onChange}
                                className="w-full max-w-md bg-white rounded-lg px-4 py-3 border border-gray-300"
                            />
                        )}
                    />
                    {errors.email && (
                        <Text className="text-red-500 text-xs pl-1">{errors.email.message}</Text>
                    )}
                </View>

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

                {/* Контролер для Зображення */}
                <Controller
                    control={control}
                    name="image"
                    render={({ field: { onChange, value } }) => {

                        const handlePickImage = async () => {
                            let result = await launchImageLibraryAsync({
                                mediaTypes: ['images'],
                                allowsEditing: true,
                                aspect: [3, 3],
                                quality: 1,
                            });

                            if (!result.canceled && result.assets.length > 0) {
                                // Передаємо вибраний файл у react-hook-form
                                onChange(result.assets[0]);
                            }
                        };

                        return (
                            <View className="w-full max-w-md items-center mb-6">
                                {/* Якщо зображення вибрано — показуємо його прев'ю */}
                                {value?.uri && (
                                    <Image
                                        source={{ uri: value.uri }}
                                        className="w-32 h-32 rounded-full mb-3 bg-gray-300"
                                    />
                                )}

                                {/* Ваша кастомна кнопка або звичайний Pressable */}
                                <Pressable
                                    onPress={handlePickImage}
                                    className="bg-gray-200 px-4 py-2 rounded-lg border border-gray-400"
                                >
                                    <Text className="text-gray-700 font-medium">
                                        {value?.uri ? "Змінити фото" : "Обрати аватар"}
                                    </Text>
                                </Pressable>
                            </View>
                        );
                    }}
                />


                <Pressable onPress={handleSubmit(onSubmit)}
                    className="w-full max-w-md bg-blue-500 rounded-lg py-3 items-center"
                >
                    <Text className="text-white font-semibold">Зареєструватися</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}