import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '@/theme/colors';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style
                ]}
                placeholderTextColor={colors.gray[400]}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.gray[700],
        marginBottom: 6,
    },
    input: {
        backgroundColor: colors.semantic.surface,
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.gray[900],
    },
    inputError: {
        borderColor: colors.semantic.error,
    },
    errorText: {
        marginTop: 4,
        fontSize: 12,
        color: colors.semantic.error,
    },
});
