import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';

type Props = {
  status: string;
  teluguText: string;
  displayEnglish: string;
  coachTip: string;
  encouragement: string;
  followUpQuestion: string;
  source?: string;
  warning?: string;
};

const StatusIndicator = ({
  status,
  teluguText,
  displayEnglish,
  coachTip,
  encouragement,
  followUpQuestion,
  source,
  warning,
}: Props) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Status: {status}</Text>

      <Text style={styles.section}>Telugu</Text>
      <Text style={styles.value}>{teluguText || '-'}</Text>

      <Text style={styles.section}>English</Text>
      <Text style={styles.value}>{displayEnglish || '-'}</Text>

      <Text style={styles.section}>Tip</Text>
      <Text style={styles.value}>{coachTip || '-'}</Text>

      <Text style={styles.section}>Encouragement</Text>
      <Text style={styles.value}>{encouragement || '-'}</Text>

      <Text style={styles.section}>Follow-up</Text>
      <Text style={styles.value}>{followUpQuestion || '-'}</Text>

      <Text style={styles.section}>Mode Source</Text>
      <Text style={styles.value}>{source || '-'}</Text>

      {warning ? (
        <>
          <Text style={styles.section}>Warning</Text>
          <Text style={styles.value}>{warning}</Text>
        </>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  section: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  value: {
    fontSize: 15,
    lineHeight: 22,
    color: '#222',
    marginTop: 4,
  },
});

export default StatusIndicator;
