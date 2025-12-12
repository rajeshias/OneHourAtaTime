import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { Habit, DayOfWeek } from '../types';

interface HabitsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const HabitsScreen: React.FC<HabitsScreenProps> = ({ visible, onClose }) => {
  const { habits, setHabits, activityGroups } = useAppContext();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Reset state when modal is closed or opened
  useEffect(() => {
    if (!visible) {
      // Reset state when modal closes
      setEditingHabit(null);
      setIsAddingNew(false);
    }
  }, [visible]);

  const allDays: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const formatHour = (h: number): string => {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  const formatTimeRange = (start: number, end: number): string => {
    return `${formatHour(start)} - ${formatHour(end)}`;
  };

  const formatDays = (days: DayOfWeek[]): string => {
    if (days.length === 7) return 'Every day';
    if (days.length === 0) return 'No days';
    return days.join(', ');
  };

  const getHabitDisplayName = (habit: Habit): string => {
    if (habit.type === 'standalone') {
      return habit.activityReference;
    } else {
      const group = activityGroups.find(g => g.id === habit.activityReference);
      return group ? `[Group] ${group.name}` : '[Unknown Group]';
    }
  };

  const deleteHabit = (habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = habits.filter(h => h.id !== habitId);
            setHabits(updated);
            if (editingHabit?.id === habitId) {
              setEditingHabit(null);
            }
          },
        },
      ]
    );
  };

  const toggleHabitEnabled = (habitId: string) => {
    const updated = habits.map(h =>
      h.id === habitId ? { ...h, enabled: !h.enabled } : h
    );
    setHabits(updated);
    if (editingHabit?.id === habitId) {
      setEditingHabit(updated.find(h => h.id === habitId) || null);
    }
  };

  const startAddNew = () => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      type: 'standalone',
      activityReference: '',
      days: [],
      startHour: 9,
      endHour: 17,
      enabled: true,
    };
    setEditingHabit(newHabit);
    setIsAddingNew(true);
  };

  const isFormValid = (): boolean => {
    if (!editingHabit) return false;
    if (editingHabit.activityReference.trim() === '') return false;
    if (editingHabit.days.length === 0) return false;
    if (editingHabit.startHour >= editingHabit.endHour) return false;
    return true;
  };

  const saveHabit = () => {
    if (!editingHabit || !isFormValid()) return;

    if (isAddingNew) {
      setHabits([...habits, editingHabit]);
    } else {
      const updated = habits.map(h =>
        h.id === editingHabit.id ? editingHabit : h
      );
      setHabits(updated);
    }

    setEditingHabit(null);
    setIsAddingNew(false);
  };

  const cancelEdit = () => {
    setEditingHabit(null);
    setIsAddingNew(false);
  };

  const toggleDay = (day: DayOfWeek) => {
    if (!editingHabit) return;

    const days = editingHabit.days.includes(day)
      ? editingHabit.days.filter(d => d !== day)
      : [...editingHabit.days, day];

    setEditingHabit({ ...editingHabit, days });
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Habits</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        {!editingHabit ? (
          <>
            <TouchableOpacity style={styles.addButton} onPress={startAddNew}>
              <Text style={styles.addButtonText}>+ Add New Habit</Text>
            </TouchableOpacity>

            <ScrollView style={styles.habitsList}>
              {habits.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No habits yet. Create one to automatically populate your schedule!
                  </Text>
                </View>
              ) : (
                habits.map(habit => (
                  <View
                    key={habit.id}
                    style={[
                      styles.habitItem,
                      !habit.enabled && styles.habitItemDisabled,
                    ]}
                  >
                    <View style={styles.habitItemHeader}>
                      <Text style={styles.habitName}>
                        {getHabitDisplayName(habit)}
                      </Text>
                      <Switch
                        value={habit.enabled}
                        onValueChange={() => toggleHabitEnabled(habit.id)}
                      />
                    </View>
                    <Text style={styles.habitDetails}>
                      {formatDays(habit.days)}
                    </Text>
                    <Text style={styles.habitDetails}>
                      {formatTimeRange(habit.startHour, habit.endHour)}
                    </Text>
                    <View style={styles.habitActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          setEditingHabit(habit);
                          setIsAddingNew(false);
                        }}
                      >
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteHabit(habit.id)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </>
        ) : (
          <ScrollView style={styles.editForm}>
            <Text style={styles.sectionTitle}>
              {isAddingNew ? 'New Habit' : 'Edit Habit'}
            </Text>

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  editingHabit.type === 'standalone' && styles.typeButtonActive,
                ]}
                onPress={() =>
                  setEditingHabit({
                    ...editingHabit,
                    type: 'standalone',
                    activityReference: '',
                  })
                }
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    editingHabit.type === 'standalone' && styles.typeButtonTextActive,
                  ]}
                >
                  Standalone Activity
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  editingHabit.type === 'activityGroup' && styles.typeButtonActive,
                ]}
                onPress={() =>
                  setEditingHabit({
                    ...editingHabit,
                    type: 'activityGroup',
                    activityReference: '',
                  })
                }
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    editingHabit.type === 'activityGroup' && styles.typeButtonTextActive,
                  ]}
                >
                  Activity Group
                </Text>
              </TouchableOpacity>
            </View>

            {editingHabit.type === 'standalone' ? (
              <>
                <Text style={styles.label}>Activity Name</Text>
                <TextInput
                  style={styles.input}
                  value={editingHabit.activityReference}
                  onChangeText={(text) =>
                    setEditingHabit({ ...editingHabit, activityReference: text })
                  }
                  placeholder="Enter activity name..."
                  placeholderTextColor="#999"
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Activity Group</Text>
                {activityGroups.length === 0 ? (
                  <Text style={styles.warningText}>
                    No activity groups available. Create one first!
                  </Text>
                ) : (
                  <ScrollView style={styles.groupSelector}>
                    {activityGroups.map(group => (
                      <TouchableOpacity
                        key={group.id}
                        style={[
                          styles.groupOption,
                          editingHabit.activityReference === group.id &&
                            styles.groupOptionSelected,
                        ]}
                        onPress={() =>
                          setEditingHabit({
                            ...editingHabit,
                            activityReference: group.id,
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.groupOptionText,
                            editingHabit.activityReference === group.id &&
                              styles.groupOptionTextSelected,
                          ]}
                        >
                          {group.name}
                        </Text>
                        <Text style={styles.groupActivityCount}>
                          {group.activities.length} activities
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </>
            )}

            <Text style={styles.label}>Days</Text>
            <View style={styles.daysSelector}>
              {allDays.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    editingHabit.days.includes(day) && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      editingHabit.days.includes(day) && styles.dayButtonTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Time Range</Text>
            <View style={styles.timeSelector}>
              <View style={styles.timePicker}>
                <Text style={styles.timeLabel}>Start</Text>
                <ScrollView style={styles.hourList} nestedScrollEnabled={true}>
                  {hours.map(hour => (
                    <TouchableOpacity
                      key={`start-${hour}`}
                      style={[
                        styles.hourOption,
                        editingHabit.startHour === hour && styles.hourOptionSelected,
                      ]}
                      onPress={() =>
                        setEditingHabit({ ...editingHabit, startHour: hour })
                      }
                    >
                      <Text
                        style={[
                          styles.hourText,
                          editingHabit.startHour === hour && styles.hourTextSelected,
                        ]}
                      >
                        {formatHour(hour)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.timePicker}>
                <Text style={styles.timeLabel}>End</Text>
                <ScrollView style={styles.hourList} nestedScrollEnabled={true}>
                  {hours.map(hour => (
                    <TouchableOpacity
                      key={`end-${hour}`}
                      style={[
                        styles.hourOption,
                        editingHabit.endHour === hour && styles.hourOptionSelected,
                      ]}
                      onPress={() =>
                        setEditingHabit({ ...editingHabit, endHour: hour })
                      }
                    >
                      <Text
                        style={[
                          styles.hourText,
                          editingHabit.endHour === hour && styles.hourTextSelected,
                        ]}
                      >
                        {formatHour(hour)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={cancelEdit}
              >
                <Text style={styles.formButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, styles.saveButton, !isFormValid() && styles.saveButtonDisabled]}
                onPress={saveHabit}
                disabled={!isFormValid()}
              >
                <Text style={styles.formButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
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
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitsList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  habitItem: {
    padding: 16,
    margin: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  habitItemDisabled: {
    opacity: 0.5,
  },
  habitItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  habitDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  habitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f44336',
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  editForm: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#2196F3',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  warningText: {
    fontSize: 14,
    color: '#f44336',
    fontStyle: 'italic',
  },
  groupSelector: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  groupOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  groupOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  groupOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  groupOptionTextSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  groupActivityCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#4CAF50',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  timeSelector: {
    flexDirection: 'row',
    gap: 16,
  },
  timePicker: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  hourList: {
    height: 300,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  hourOption: {
    padding: 10,
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
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  formButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonDisabled: {
    backgroundColor: '#a5d6a7',
    opacity: 0.7,
  },
  formButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
