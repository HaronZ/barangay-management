import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export const HomeScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            // Assuming GET /announcements returns { data: [...] } or [...]
            const response = await api.get('/announcements');
            setAnnouncements(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error(error);
            // Fail silently or show toast
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout }
        ]);
    };

    const renderAnnouncement = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.cardContent}>{item.content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.username}>{user?.firstName || 'Resident'}!</Text>
                </View>
                <Button
                    title="Logout"
                    variant="outline"
                    onPress={handleLogout}
                    style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                />
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Announcements</Text>
                <FlatList
                    data={announcements}
                    renderItem={renderAnnouncement}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAnnouncements} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No announcements yet.</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    greeting: {
        fontSize: 16,
        color: colors.gray[500],
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.gray[900],
    },
    content: {
        flex: 1,
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.gray[800],
        marginBottom: 16,
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary[700],
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 12,
        color: colors.gray[400],
        marginBottom: 8,
    },
    cardContent: {
        fontSize: 14,
        color: colors.gray[600],
        lineHeight: 20,
    },
    emptyState: {
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: colors.gray[500],
    }
});
