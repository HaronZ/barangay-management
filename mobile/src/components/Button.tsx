import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { colors } from '@/theme/colors';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
}

export const Button = ({ title, variant = 'primary', loading, style, disabled, ...props }: ButtonProps) => {
    const getBackgroundColor = () => {
        if (disabled) return colors.gray[300];
        switch (variant) {
            case 'primary': return colors.primary[600];
            case 'secondary': return colors.gray[800];
            case 'outline': return 'transparent';
            default: return colors.primary[600];
        }
    };

    const getTextColor = () => {
        if (disabled) return colors.gray[500];
        switch (variant) {
            case 'outline': return colors.primary[600];
            default: return '#ffffff';
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: getBackgroundColor() },
                variant === 'outline' && styles.outlineborder,
                style
            ]}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    outlineborder: {
        borderWidth: 1,
        borderColor: colors.primary[600],
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});
