import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MicButton from '../components/MicButton';
import StatusIndicator from '../components/StatusIndicator';
import { AgentMode } from '../services/apiService';
import { useVoiceAgent } from '../hooks/useVoiceAgent';

const ModeChip = ({
  label,
  value,
  current,
  onPress,
}: {
  label: string;
  value: AgentMode;
  current: AgentMode;
  onPress: (value: AgentMode) => void;
}) => (
  <TouchableOpacity
    style={[
      styles.chip,
      current === value ? styles.chipActive : styles.chipInactive,
    ]}
    onPress={() => onPress(value)}
  >
    <Text
      style={[
        styles.chipText,
        current === value ? styles.chipTextActive : styles.chipTextInactive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const ToggleChip = ({
  active,
  onPress,
  label,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
}) => (
  <TouchableOpacity
    style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.chipText,
        active ? styles.chipTextActive : styles.chipTextInactive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const ActionButton = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Text style={styles.actionButtonText}>{label}</Text>
  </TouchableOpacity>
);

const HomeScreen = () => {
  const {
    status,
    teluguText,
    displayEnglish,
    coachTip,
    encouragement,
    followUpQuestion,
    isAgentRunning,
    slowVoiceEnabled,
    mode,
    source,
    warning,
    setMode,
    setSlowVoiceEnabled,
    startAgent,
    stopAgent,
    repeatLastResponse,
  } = useVoiceAgent();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LinguaFlow Conversation Agent</Text>

      <Text style={styles.subTitle}>Mode</Text>
      <View style={styles.row}>
        <ModeChip
          label="Coach"
          value="coach"
          current={mode}
          onPress={setMode}
        />
        <ModeChip
          label="Interpreter"
          value="interpreter"
          current={mode}
          onPress={setMode}
        />
        <ModeChip
          label="Practice"
          value="practice"
          current={mode}
          onPress={setMode}
        />
      </View>

      <Text style={styles.subTitle}>Voice Speed</Text>
      <View style={styles.row}>
        <ToggleChip
          active={slowVoiceEnabled}
          onPress={() => setSlowVoiceEnabled(true)}
          label="Slow"
        />
        <ToggleChip
          active={!slowVoiceEnabled}
          onPress={() => setSlowVoiceEnabled(false)}
          label="Normal"
        />
      </View>

      <MicButton
        isAgentRunning={isAgentRunning}
        onStart={startAgent}
        onStop={stopAgent}
      />

      <View style={styles.row}>
        <ActionButton label="🔁 Repeat Reply" onPress={repeatLastResponse} />
      </View>

      <StatusIndicator
        status={status}
        teluguText={teluguText}
        displayEnglish={displayEnglish}
        coachTip={coachTip}
        encouragement={encouragement}
        followUpQuestion={followUpQuestion}
        source={source}
        warning={warning}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    marginTop: 20,
  },
  subTitle: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipInactive: {
    backgroundColor: '#fff',
    borderColor: '#CBD5E1',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#fff',
  },
  chipTextInactive: {
    color: '#1E293B',
  },
  actionButton: {
    marginTop: 8,
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default HomeScreen;
