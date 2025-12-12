import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { ActivityGroup } from '../types';

export const ActivityGroupScreen: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const { activityGroups, setActivityGroups } = useAppContext();
  const [editingGroup, setEditingGroup] = useState<ActivityGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [renamingGroup, setRenamingGroup] = useState<ActivityGroup | null>(null);
  const [renameText, setRenameText] = useState('');

  const createNewGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: ActivityGroup = {
        id: Date.now().toString(),
        name: newGroupName.trim(),
        activities: [],
      };
      setActivityGroups([...activityGroups, newGroup]);
      setNewGroupName('');
      setEditingGroup(newGroup);
    }
  };

  const deleteSelectedGroups = () => {
    if (selectedGroups.length === 0) return;

    Alert.alert(
      'Delete Groups',
      `Delete ${selectedGroups.length} group(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = activityGroups.filter((g) => !selectedGroups.includes(g.id));
            setActivityGroups(updated);
            setSelectedGroups([]);
            if (editingGroup && selectedGroups.includes(editingGroup.id)) {
              setEditingGroup(null);
            }
          },
        },
      ]
    );
  };

  const toggleGroupSelection = (id: string) => {
    if (selectedGroups.includes(id)) {
      setSelectedGroups(selectedGroups.filter((gid) => gid !== id));
    } else {
      setSelectedGroups([...selectedGroups, id]);
    }
  };

  const addActivityToGroup = () => {
    if (!editingGroup || !newActivity.trim()) return;

    const updated = activityGroups.map((g) =>
      g.id === editingGroup.id
        ? { ...g, activities: [...g.activities, newActivity.trim()] }
        : g
    );
    setActivityGroups(updated);
    const updatedGroup = updated.find((g) => g.id === editingGroup.id);
    if (updatedGroup) setEditingGroup(updatedGroup);
    setNewActivity('');
  };

  const deleteActivity = (activityIndex: number) => {
    if (!editingGroup) return;

    Alert.alert('Delete Activity', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = activityGroups.map((g) =>
            g.id === editingGroup.id
              ? { ...g, activities: g.activities.filter((_, i) => i !== activityIndex) }
              : g
          );
          setActivityGroups(updated);
          const updatedGroup = updated.find((g) => g.id === editingGroup.id);
          if (updatedGroup) setEditingGroup(updatedGroup);
        },
      },
    ]);
  };

  const renameGroup = (group: ActivityGroup) => {
    setRenamingGroup(group);
    setRenameText(group.name);
  };

  const confirmRename = () => {
    if (!renamingGroup || !renameText.trim()) return;

    const updated = activityGroups.map((g) =>
      g.id === renamingGroup.id ? { ...g, name: renameText.trim() } : g
    );
    setActivityGroups(updated);
    if (editingGroup?.id === renamingGroup.id) {
      setEditingGroup({ ...renamingGroup, name: renameText.trim() });
    }
    setRenamingGroup(null);
    setRenameText('');
  };

  const cancelRename = () => {
    setRenamingGroup(null);
    setRenameText('');
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Activity Groups</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Rename Dialog */}
        {renamingGroup && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.dialogOverlay}>
              <View style={styles.dialogBox}>
                <Text style={styles.dialogTitle}>Rename Group</Text>
                <TextInput
                  style={styles.dialogInput}
                  value={renameText}
                  onChangeText={setRenameText}
                  placeholder="Enter new name"
                  autoFocus
                  onSubmitEditing={confirmRename}
                />
                <View style={styles.dialogButtons}>
                  <TouchableOpacity style={styles.dialogButton} onPress={cancelRename}>
                    <Text style={styles.dialogButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dialogButton, styles.dialogButtonPrimary]}
                    onPress={confirmRename}
                  >
                    <Text style={[styles.dialogButtonText, styles.dialogButtonTextPrimary]}>
                      Rename
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        <View style={styles.content}>
          {/* Left side - Groups list */}
          <View style={styles.leftPanel}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="New group name..."
                placeholderTextColor="#999"
                onSubmitEditing={createNewGroup}
              />
              <TouchableOpacity style={styles.addButton} onPress={createNewGroup}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {selectedGroups.length > 0 && (
              <TouchableOpacity
                style={styles.deleteSelectedButton}
                onPress={deleteSelectedGroups}
              >
                <Text style={styles.deleteSelectedText}>
                  Delete {selectedGroups.length} group(s)
                </Text>
              </TouchableOpacity>
            )}

            <ScrollView style={styles.groupsList}>
              {activityGroups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupItem,
                    editingGroup?.id === group.id && styles.activeGroupItem,
                    selectedGroups.includes(group.id) && styles.selectedGroupItem,
                  ]}
                  onPress={() => setEditingGroup(group)}
                  onLongPress={() => toggleGroupSelection(group.id)}
                >
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.activityCount}>
                    {group.activities.length} activities
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Right side - Activities list */}
          <View style={styles.rightPanel}>
            {editingGroup ? (
              <>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityHeaderText} numberOfLines={1} ellipsizeMode="tail">
                    {editingGroup.name}
                  </Text>
                  <TouchableOpacity onPress={() => renameGroup(editingGroup)} style={styles.renameButtonContainer}>
                    <Text style={styles.renameButton}>Rename</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={newActivity}
                    onChangeText={setNewActivity}
                    placeholder="Add activity..."
                    placeholderTextColor="#999"
                    onSubmitEditing={addActivityToGroup}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={addActivityToGroup}>
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.activitiesList}>
                  {editingGroup.activities.map((activity, index) => (
                    <View key={index} style={styles.activityItem}>
                      <Text style={styles.activityText}>{activity}</Text>
                      <TouchableOpacity onPress={() => deleteActivity(index)}>
                        <Text style={styles.deleteActivityButton}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Select a group to edit activities
                </Text>
              </View>
            )}
          </View>
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
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  rightPanel: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    marginLeft: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  deleteSelectedButton: {
    backgroundColor: '#f44336',
    padding: 12,
    margin: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  deleteSelectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  groupsList: {
    flex: 1,
  },
  groupItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  activeGroupItem: {
    backgroundColor: '#e3f2fd',
  },
  selectedGroupItem: {
    backgroundColor: '#ffebee',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityCount: {
    fontSize: 12,
    color: '#666',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  activityHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  renameButtonContainer: {
    paddingLeft: 8,
  },
  renameButton: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  activitiesList: {
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  activityText: {
    fontSize: 14,
    flex: 1,
  },
  deleteActivityButton: {
    fontSize: 28,
    color: '#f44336',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dialogInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  dialogButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  dialogButtonPrimary: {
    backgroundColor: '#2196F3',
  },
  dialogButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dialogButtonTextPrimary: {
    color: '#fff',
  },
});
