import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import {useColorScheme} from '@/hooks/use-color-scheme';
import { store } from '../store';
import {Provider} from 'react-redux';

import {Pressable, View, Text} from 'react-native';

import NetworkLogger from 'react-native-network-logger';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// export const unstable_settings = {
//     anchor: '(tabs)',
// };

export default function RootLayout() {

    const colorScheme = useColorScheme();

    const [showLogger, setShowLogger] = useState(false);

    return (
        <SafeAreaProvider>
            <Provider store={store}>
                <View className='flex-1'>
                    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                        <Stack>
                            <Stack.Screen name="(auth)" options={{headerShown: false}}/>
                            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                            <Stack.Screen name="modal" options={{presentation: 'modal', title: 'Modal'}}/>
                        </Stack>
                        <StatusBar style="auto"/>
                    </ThemeProvider>
                    { __DEV__ && (
                        <Pressable 
                        onPress={() => setShowLogger(!showLogger)}
                        className={`w-14 h-14 p-2 text-center rounded-full justify-center items-center ${showLogger ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ 
                            position: 'absolute', 
                            bottom: 90, 
                            right: 20, 
                            zIndex: 99999,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.30,
                            shadowRadius: 4.65,
                            elevation: 8,
                        }}>
                            <Text>Logs</Text>
                        </Pressable>
                        )
                    }
                    { __DEV__ && showLogger && (
                        <NetworkLogger/>
                    )}
                </View>
            </Provider>
        </SafeAreaProvider>
    );
}