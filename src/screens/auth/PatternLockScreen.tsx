import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import PatternLock from '../../components/auth/PatternLock';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

// Simple pattern validation - in production, use secure hashing
const ELDER_PATTERN = [0, 1, 2, 5, 8]; // L-shape pattern

export default function PatternLockScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handlePatternComplete = (pattern: number[]) => {
    // Simple pattern matching for MVP
    const isCorrect =
      pattern.length === ELDER_PATTERN.length &&
      pattern.every((val, idx) => val === ELDER_PATTERN[idx]);

    if (isCorrect) {
      login('elder');
    } else {
      setAttempts((prev) => prev + 1);
      setError(`Incorrect pattern. ${3 - attempts - 1} attempts remaining.`);

      if (attempts >= 2) {
        setError('Too many attempts. Please try again later.');
      }

      setTimeout(() => setError(null), 2000);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Elder Access</Text>
        <Text style={styles.subtitle}>Draw your pattern to unlock</Text>

        <View style={styles.patternContainer}>
          <PatternLock
            onPatternComplete={handlePatternComplete}
            disabled={attempts >= 3}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.hint}>
          Hint: Draw an L shape starting from top-left
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  patternContainer: {
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  backButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
});
