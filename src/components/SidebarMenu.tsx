import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';

const APP_VERSION = '1.0.0';

interface SidebarMenuProps {
  visible: boolean;
  onClose: () => void;
  onGroupsPress: () => void;
  onHabitsPress: () => void;
  onSettingsPress: () => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  visible,
  onClose,
  onGroupsPress,
  onHabitsPress,
  onSettingsPress,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sidebar} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem} onPress={onGroupsPress}>
              <Text style={styles.menuIcon}>📁</Text>
              <Text style={styles.menuText}>Activity Groups</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onHabitsPress}>
              <Text style={styles.menuIcon}>🔄</Text>
              <Text style={styles.menuText}>Habits</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onSettingsPress}>
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  sidebar: {
    width: 280,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#2196F3',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  menuItems: {
    paddingTop: 8,
    paddingBottom: 60,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  versionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
