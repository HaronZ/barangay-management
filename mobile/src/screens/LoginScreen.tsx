import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export const LoginScreen = ({ navigation }: any) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            // 1. Call API
            const response = await api.post('/auth/login', { email, password });

            // 2. Save Session (Token + User)
            // Note: Adjust based on your actual API response structure
            const { token, user } = response.data;

            await login(token, user);

            // Navigation is handled by AppNavigator based on token presence
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            Alert.alert('Login Failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>BM</Text>
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to your account</Text>
                    </View>

                    <View style={styles.formCard}>
                        <Input
                            label="Email Address"
                            placeholder="e.g. juan@delacruz.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <Input
                            label="Password"
                            placeholder="••••••••"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            style={{ marginTop: 8 }}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account?</Text>
                            <Text style={styles.linkText} onPress={() => Alert.alert('TODO', 'Register feature coming next!')}>Register</Text>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50], // Match web bg
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 64,
        height: 64,
        backgroundColor: colors.primary[600],
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        // Shadow
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.gray[900],
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.gray[500],
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        // Shadow similar to web card
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    footer: {
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    footerText: {
        color: colors.gray[600],
    },
    linkText: {
        color: colors.primary[600],
        fontWeight: '600',
    }
});
