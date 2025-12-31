import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export const HomeScreen = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Resident!</Text>
            <Button
                title="Logout"
                onPress={() => navigation.replace('Login')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    }
});
