import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { RootStackParamList } from '../../navigation/types';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { login } = useAuth();

  const handleGeneralLogin = () => {
    login('general');
  };

  const handleElderLogin = () => {
    navigation.navigate('PatternLock');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('appTitle')}</Text>
          <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.generalButton]}
            onPress={handleGeneralLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('accessGeneral')}</Text>
            <Text style={styles.buttonSubtext}>{t('accessCommunity')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.elderButton]}
            onPress={handleElderLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('accessLeader')}</Text>
            <Text style={styles.buttonSubtext}>{t('accessFull')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl * 2,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
  },
  buttonContainer: {
    gap: spacing.lg,
  },
  button: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generalButton: {
    backgroundColor: colors.primary,
  },
  elderButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    ...typography.buttonLarge,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  buttonSubtext: {
    ...typography.caption,
    color: colors.textLight,
    opacity: 0.8,
  },
});
