import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAppContext } from '../context/AppContext';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ visible, onClose }) => {
  const { sleepingHours, setSleepingHours } = useAppContext();
  const [startHour, setStartHour] = useState(sleepingHours?.start || 22);
  const [endHour, setEndHour] = useState(sleepingHours?.end || 6);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const formatHour = (h: number): string => {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  const handleSave = () => {
    setSleepingHours({ start: startHour, end: endHour });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sleeping Hours</Text>
            <Text style={styles.sectionDescription}>
              Set your sleeping time. These hours will be greyed out in the planner.
            </Text>

            <View style={styles.timeSelector}>
              <View style={styles.timePicker}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <ScrollView style={styles.hourList}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={`start-${hour}`}
                      style={[
                        styles.hourOption,
                        startHour === hour && styles.hourOptionSelected,
                      ]}
                      onPress={() => setStartHour(hour)}
                    >
                      <Text
                        style={[
                          styles.hourText,
                          startHour === hour && styles.hourTextSelected,
                        ]}
                      >
                        {formatHour(hour)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.timePicker}>
                <Text style={styles.timeLabel}>End Time</Text>
                <ScrollView style={styles.hourList}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={`end-${hour}`}
                      style={[
                        styles.hourOption,
                        endHour === hour && styles.hourOptionSelected,
                      ]}
                      onPress={() => setEndHour(hour)}
                    >
                      <Text
                        style={[
                          styles.hourText,
                          endHour === hour && styles.hourTextSelected,
                        ]}
                      >
                        {formatHour(hour)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  timeSelector: {
    flexDirection: 'row',
    gap: 16,
  },
  timePicker: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  hourList: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  hourOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  hourOptionSelected: {
    backgroundColor: '#2196F3',
  },
  hourText: {
    fontSize: 14,
    textAlign: 'center',
  },
  hourTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
