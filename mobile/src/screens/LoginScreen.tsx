import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export const LoginScreen = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Barangay Management</Text>
            <Text style={styles.subtitle}>Mobile App</Text>
            <Button
                title="Login (Demo)"
                onPress={() => navigation.replace('Main')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 40,
    }
});
