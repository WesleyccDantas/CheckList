import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Button, Dialog, Portal, RadioButton, List, TextInput as PaperTextInput, Provider as PaperProvider } from 'react-native-paper';

type Task = {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  subtasks: Subtask[];
};

type Subtask = {
  id: string;
  text: string;
  completed: boolean;
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskText, setTaskText] = useState('');
  const [subtaskText, setSubtaskText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [showPriorityDialog, setShowPriorityDialog] = useState(false);
  const [showAddSubtaskDialog, setShowAddSubtaskDialog] = useState(false);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [category, setCategory] = useState<string>('all');
  const [parentTaskText, setParentTaskText] = useState<string>('');

  const addTask = () => {
    if (taskText.trim() !== '') {
      const newTask = {
        id: String(new Date().getTime()),
        text: taskText,
        completed: false,
        priority: selectedPriority,
        category: category,
        subtasks: [],
      };
      setTasks([...tasks, newTask]);
      setTaskText('');
      setSelectedPriority('low');
      setCategory('all');
    }
  };

  const addSubtask = () => {
    if (subtaskText.trim() !== '' && parentTaskId) {
      const newSubtask = {
        id: String(new Date().getTime()),
        text: subtaskText,
        completed: false,
      };
      setTasks(tasks.map(task =>
        task.id === parentTaskId
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task
      ));
      setSubtaskText('');
      setShowAddSubtaskDialog(false);
    }
  };

  const toggleCompletion = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
          ...task,
          subtasks: task.subtasks.map(subtask =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          ),
        }
        : task
    ));
  };

  const getTaskCompletionPercentage = (task: Task) => {
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return (completedSubtasks / task.subtasks.length) * 100 || 0;
  };

  return (
    <PaperProvider>
      <View style={[styles.container, theme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
        <Text style={styles.header}>Checklist</Text>
        
        {/* Filter Tasks by Category */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Categoria:</Text>
          <Button mode="text" onPress={() => setCategory('all')}>Todos</Button>
          <Button mode="text" onPress={() => setCategory('work')}>Trabalho</Button>
          <Button mode="text" onPress={() => setCategory('personal')}>Pessoal</Button>
        </View>
        
        {/* Task Input */}
        <View style={styles.inputContainer}>
          <PaperTextInput
            placeholder="Nova Tarefa"
            value={taskText}
            onChangeText={setTaskText}
            style={styles.input}
          />
          <Button mode="contained" onPress={() => setShowPriorityDialog(true)}>
            Adicionar
          </Button>
        </View>
        
        {/* Task List */}
        <FlatList
          data={tasks.filter(task => category === 'all' || task.category === category)}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.taskCard, { backgroundColor: item.priority === 'low' ? '#e0f7fa' : item.priority === 'medium' ? '#ffe0b2' : '#ffebee' }]}>
              <View style={styles.taskContainer}>
                <TouchableOpacity onPress={() => toggleCompletion(item.id)}>
                  <Text style={[styles.taskText, item.completed && styles.completed]}>{item.text}</Text>
                </TouchableOpacity>
                <Text style={styles.dueDate}>{item.category}</Text>
                <Text style={styles.priority}>Prioridade: {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}</Text>
                <Text style={styles.completion}>Conclusão: {getTaskCompletionPercentage(item).toFixed(0)}%</Text>
                <Button mode="outlined" style={styles.subtaskButton} onPress={() => {
                  setParentTaskId(item.id);
                  setParentTaskText(item.text);
                  setShowAddSubtaskDialog(true);
                }}>
                  Adicionar Subtarefa
                </Button>
                {item.subtasks.map(subtask => (
                  <TouchableOpacity key={subtask.id} onPress={() => toggleSubtaskCompletion(item.id, subtask.id)}>
                    <View style={styles.subtaskContainer}>
                      <Text style={[styles.subtaskText, subtask.completed && styles.completed]}>{subtask.text}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />
        
        {/* Dialog for Priority Selection */}
        <Portal>
          <Dialog visible={showPriorityDialog} onDismiss={() => setShowPriorityDialog(false)}>
            <Dialog.Title>Escolher Prioridade</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group
                onValueChange={value => setSelectedPriority(value as 'low' | 'medium' | 'high')}
                value={selectedPriority}
              >
                <List.Item title="Baixa" left={() => <RadioButton value="low" />} />
                <List.Item title="Média" left={() => <RadioButton value="medium" />} />
                <List.Item title="Alta" left={() => <RadioButton value="high" />} />
              </RadioButton.Group>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => {
                addTask();
                setShowPriorityDialog(false);
              }}>Adicionar Tarefa</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        
        {/* Dialog for Adding Subtasks */}
        <Portal>
          <Dialog visible={showAddSubtaskDialog} onDismiss={() => setShowAddSubtaskDialog(false)}>
            <Dialog.Title>Adicionar Subtarefa</Dialog.Title>
            <Dialog.Content>
              <PaperTextInput
                label="Texto da Subtarefa"
                value={subtaskText}
                onChangeText={setSubtaskText}
                style={styles.subtaskInput}
              />
              <View style={styles.taskInfoContainer}>
                <Text style={styles.taskInfoLabel}>Tarefa Mãe:</Text>
                <Text style={styles.taskInfo}>{parentTaskText}</Text>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => {
                addSubtask();
                setShowAddSubtaskDialog(false);
              }}>Adicionar Subtarefa</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        
        {/* Theme Toggle */}
        <View style={styles.themeToggle}>
          <Text>Modo Escuro:</Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  lightContainer: {
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
  },
  taskCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taskContainer: {
    padding: 16,
  },
  taskText: {
    fontSize: 18,
    color: '#333',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  priority: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 8,
  },
  completion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  subtaskButton: {
    marginTop: 12,
  },
  subtaskContainer: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginTop: 8,
  },
  subtaskText: {
    fontSize: 16,
    color: '#333',
  },
  taskInfoContainer: {
    marginTop: 12,
  },
  taskInfoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  taskInfo: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  subtaskInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'center',
  },
  dueDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});
