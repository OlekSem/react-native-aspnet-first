import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Text, View, Image, ActivityIndicator, Pressable } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import {Feather} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMeQuery } from '@/services/authApi';

export default function profile() {

    const { data: user, isLoading, error, refetch } = useMeQuery();

    if (isLoading) {
        return (
            <View className="flex-1 bg-white dark:bg-zinc-950 justify-center items-center">
                <ActivityIndicator size="small" className="text-zinc-900 dark:text-white" />
            </View>
        );
    }

    if (!user) {return (<Text>Error</Text>);}

    return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950 justify-center items-center px-6">
      <View className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 items-center">
        
        {/* Profile Image */}
        {user.image && <View className="relative mb-6">
          <Image 
            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/images/400_${user.image}` }} 
            className="w-28 h-28 rounded-full border-4 border-zinc-50 dark:border-zinc-800 shadow-inner"
          />
          <View className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900" />
        </View> }

        {/* Identity Tag */}
        <View className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full mb-4">
          <Text className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
            ID: {user.id}
          </Text>
        </View>

        {/* Full Name */}
        <Text className="text-2xl font-bold text-zinc-900 dark:text-white text-center">
          {user.firstName} {user.lastName}
        </Text>

        {/* Email Address */}
        <View className="flex-row items-center space-x-2 mt-2 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 rounded-xl w-full justify-center border border-zinc-100 dark:border-zinc-800">
          <Feather name="mail" size={14} className="text-zinc-400 dark:text-zinc-500" />
          <Text className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {user.email}
          </Text>
        </View>

        {/* Action Button (Optional Edit/Back placeholder) */}
        <Pressable className="w-full mt-6 bg-zinc-900 dark:bg-white active:opacity-90 py-3.5 rounded-2xl items-center">
          <Text className="text-white dark:text-zinc-900 font-semibold text-sm">
            Edit Profile
          </Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}