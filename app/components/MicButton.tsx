import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
  isAgentRunning: boolean;
  onStart: () => void;
  onStop: () => void;
};

const MicButton = ({ isAgentRunning, onStart, onStop }: Props) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isAgentRunning ? styles.stopButton : styles.startButton,
      ]}
      onPress={isAgentRunning ? onStop : onStart}
    >
      <Text style={styles.text}>
        {isAgentRunning ? '🛑 Stop Agent' : '🎤 Start Agent'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  startButton: {
    backgroundColor: '#2563EB',
  },
  stopButton: {
    backgroundColor: '#DC2626',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MicButton;
