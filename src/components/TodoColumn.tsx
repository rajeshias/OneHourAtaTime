import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Pressable,
} from 'react-native';
import { TodoItem } from '../types';

interface TodoColumnProps {
  todos: TodoItem[];
  onUpdateTodos: (todos: TodoItem[]) => void;
  width: number;
  onFocus: () => void;
  onBlur: () => void;
}

export const TodoColumn: React.FC<TodoColumnProps> = ({
  todos,
  onUpdateTodos,
  width,
  onFocus,
  onBlur,
}) => {
  const [newTodoText, setNewTodoText] = useState('');
  const animatedWidth = useRef(new Animated.Value(width)).current;
  const textInputRef = useRef<TextInput>(null);

  // Animate width changes
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: width,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [width]);

  const addTodo = () => {
    if (newTodoText.trim()) {
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
      };
      onUpdateTodos([...todos, newTodo]);
      setNewTodoText('');
    }
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    onUpdateTodos(updated);
  };

  const deleteTodo = (id: string) => {
    Alert.alert('Delete Todo', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = todos.filter((todo) => todo.id !== id);
          onUpdateTodos(updated);
        },
      },
    ]);
  };

  const handleColumnPress = () => {
    textInputRef.current?.focus();
    onFocus();
  };

  return (
    <Animated.View style={[styles.container, { width: animatedWidth }]}>
      <Pressable onPress={handleColumnPress} style={styles.header}>
        <Text style={styles.headerText}>Todo List</Text>
      </Pressable>
      <View style={styles.inputContainer}>
        <TextInput
          ref={textInputRef}
          style={styles.input}
          value={newTodoText}
          onChangeText={setNewTodoText}
          placeholder="Add new todo..."
          placeholderTextColor="#999"
          onSubmitEditing={addTodo}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={addTodo}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Pressable onPress={handleColumnPress} style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView}>
          {todos.map((todo) => (
            <View key={todo.id} style={styles.todoItem}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleTodo(todo.id)}
              >
                <View style={[styles.checkboxInner, todo.completed && styles.checked]}>
                  {todo.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
              <Text
                style={[styles.todoText, todo.completed && styles.completedText]}
                numberOfLines={2}
              >
                {todo.text}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTodo(todo.id)}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderBottomWidth: 2,
    borderBottomColor: '#388E3C',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
  },
  addButton: {
    width: 40,
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
  scrollView: {
    flex: 1,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoText: {
    flex: 1,
    fontSize: 14,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#f44336',
  },
});
