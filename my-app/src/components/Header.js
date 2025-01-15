import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = ({ title }) => (
    <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    header: {
        padding: 20,
        backgroundColor: '#4CAF50',
    },
    title: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Header;
