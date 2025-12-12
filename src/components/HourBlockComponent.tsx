import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, Text, Pressable, View } from 'react-native';

interface HourBlockProps {
  hour: number;
  content: string;
  onUpdate: (content: string) => void;
  isSelected: boolean;
  onLongPress: () => void;
  onPress: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  sleepingHours?: { start: number; end: number } | null;
}

export const HourBlockComponent: React.FC<HourBlockProps> = ({
  hour,
  content,
  onUpdate,
  isSelected,
  onLongPress,
  onPress,
  onFocus,
  onBlur: onBlurProp,
  sleepingHours,
}) => {
  const [text, setText] = useState(content);
  const [fontSize, setFontSize] = useState(14);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setText(content);
  }, [content]);

  const isSleepingHour = (): boolean => {
    if (!sleepingHours) return false;
    const { start, end } = sleepingHours;

    // If start < end (e.g., 1am to 6am), check if hour is in range
    if (start < end) {
      return hour >= start && hour < end;
    }
    // If start > end (e.g., 10pm to 6am), sleeping time crosses midnight
    return hour >= start || hour < end;
  };

  useEffect(() => {
    // Auto-adjust font size based on text length
    const length = text.length;
    if (length === 0) {
      setFontSize(14);
    } else if (length < 10) {
      setFontSize(14);
    } else if (length < 20) {
      setFontSize(12);
    } else if (length < 30) {
      setFontSize(10);
    } else {
      setFontSize(8);
    }
  }, [text]);

  const formatHour = (h: number): string => {
    if (h === 0) return '12a';
    if (h < 12) return `${h}a`;
    if (h === 12) return '12p';
    return `${h - 12}p`;
  };

  const handlePress = () => {
    setIsEditing(true);
    onPress();
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(text);
    onBlurProp?.();
  };

  const sleeping = isSleepingHour();

  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={handlePress}
      style={[
        styles.container,
        isSelected && styles.selected,
        sleeping && styles.sleeping,
      ]}
    >
      <Text style={styles.hourText}>{formatHour(hour)}</Text>
      {sleeping && <Text style={styles.sleepingIndicator}>zzz...</Text>}
      <TextInput
        style={[styles.input, { fontSize }]}
        value={text}
        onChangeText={setText}
        onFocus={onFocus}
        onBlur={handleBlur}
        editable={isEditing}
        multiline
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    position: 'relative',
  },
  selected: {
    backgroundColor: '#e3f2fd',
  },
  sleeping: {
    backgroundColor: '#f5f5f5',
  },
  hourText: {
    position: 'absolute',
    top: 2,
    left: 2,
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    zIndex: 1,
  },
  sleepingIndicator: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlignVertical: 'center',
  },
});
