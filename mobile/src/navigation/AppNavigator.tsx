import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { LoginScreen } from '@/screens/LoginScreen';
import { HomeScreen } from '@/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    // TODO: Add auth state check
    const isAuthenticated = false;

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Main" component={HomeScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
