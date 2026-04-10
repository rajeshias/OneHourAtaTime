import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { ReminderSettings } from '../types';
import { storageUtils } from '../utils/storage';
import { notificationUtils } from '../utils/notifications';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ visible, onClose }) => {
  const { sleepingHours, setSleepingHours } = useAppContext();
  const [startHour, setStartHour] = useState(sleepingHours?.start || 22);
  const [endHour, setEndHour] = useState(sleepingHours?.end || 6);

  // Reminder settings
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [morningHour, setMorningHour] = useState(8);
  const [eveningEnabled, setEveningEnabled] = useState(false);
  const [eveningHour, setEveningHour] = useState(21);
  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      loadReminderSettings();
    }
  }, [visible]);

  const loadReminderSettings = async () => {
    const settings = await storageUtils.getReminderSettings();
    setReminderEnabled(settings.enabled);
    setMorningHour(settings.morningHour);
    setEveningEnabled(settings.eveningEnabled);
    setEveningHour(settings.eveningHour);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const formatHour = (h: number): string => {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  const handleSave = () => {
    setSleepingHours({ start: startHour, end: endHour });

    const reminderSettings: ReminderSettings = {
      enabled: reminderEnabled,
      morningHour,
      eveningEnabled,
      eveningHour,
    };
    // Save and schedule in background — don't block the UI
    storageUtils.saveReminderSettings(reminderSettings);
    notificationUtils.scheduleDailyReminders(reminderSettings);

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
          {/* Sleeping Hours Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sleeping Hours</Text>
            <Text style={styles.sectionDescription}>
              Set your sleeping time. These hours will be greyed out in the planner.
            </Text>

            <View style={styles.timeSelector}>
              <View style={styles.timePicker}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <ScrollView style={styles.hourList} nestedScrollEnabled>
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
                <ScrollView style={styles.hourList} nestedScrollEnabled>
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

          {/* Daily Reminders Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Reminders</Text>
            <Text style={styles.sectionDescription}>
              Get notified to plan your day and review your schedule.
            </Text>

            {/* Morning Reminder Toggle */}
            <View style={styles.reminderRow}>
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderLabel}>Morning Planning Reminder</Text>
                <Text style={styles.reminderDescription}>
                  Reminds you to fill in today's schedule
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#ccc', true: '#81C784' }}
                thumbColor={reminderEnabled ? '#4CAF50' : '#f4f3f4'}
              />
            </View>

            {reminderEnabled && (
              <View style={styles.timePickerInline}>
                <Text style={styles.inlineLabel}>Remind at:</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowMorningPicker(!showMorningPicker)}
                >
                  <Text style={styles.timeButtonText}>{formatHour(morningHour)}</Text>
                </TouchableOpacity>
                {showMorningPicker && (
                  <ScrollView style={styles.inlineHourList} nestedScrollEnabled>
                    {hours.map((hour) => (
                      <TouchableOpacity
                        key={`morning-${hour}`}
                        style={[
                          styles.hourOption,
                          morningHour === hour && styles.hourOptionSelected,
                        ]}
                        onPress={() => {
                          setMorningHour(hour);
                          setShowMorningPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.hourText,
                            morningHour === hour && styles.hourTextSelected,
                          ]}
                        >
                          {formatHour(hour)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            {/* Evening Reminder Toggle */}
            <View style={[styles.reminderRow, { marginTop: 20 }]}>
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderLabel}>Evening Review Reminder</Text>
                <Text style={styles.reminderDescription}>
                  Reminds you to review and plan tomorrow
                </Text>
              </View>
              <Switch
                value={eveningEnabled}
                onValueChange={setEveningEnabled}
                trackColor={{ false: '#ccc', true: '#81C784' }}
                thumbColor={eveningEnabled ? '#4CAF50' : '#f4f3f4'}
              />
            </View>

            {eveningEnabled && (
              <View style={styles.timePickerInline}>
                <Text style={styles.inlineLabel}>Remind at:</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowEveningPicker(!showEveningPicker)}
                >
                  <Text style={styles.timeButtonText}>{formatHour(eveningHour)}</Text>
                </TouchableOpacity>
                {showEveningPicker && (
                  <ScrollView style={styles.inlineHourList} nestedScrollEnabled>
                    {hours.map((hour) => (
                      <TouchableOpacity
                        key={`evening-${hour}`}
                        style={[
                          styles.hourOption,
                          eveningHour === hour && styles.hourOptionSelected,
                        ]}
                        onPress={() => {
                          setEveningHour(hour);
                          setShowEveningPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.hourText,
                            eveningHour === hour && styles.hourTextSelected,
                          ]}
                        >
                          {formatHour(hour)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reminderInfo: {
    flex: 1,
    marginRight: 12,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reminderDescription: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  timePickerInline: {
    marginTop: 12,
    marginLeft: 4,
  },
  inlineLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    alignSelf: 'flex-start',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  inlineHourList: {
    maxHeight: 200,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
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
