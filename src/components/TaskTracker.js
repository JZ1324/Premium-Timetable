import React from 'react';
import { useTaskTracker } from './TaskTracker/useTaskTracker';
import TaskItem from './TaskTracker/TaskItem';
import AddTaskForm from './TaskTracker/AddTaskForm';
import '../styles/components/TaskTracker.css';

const TaskTracker = () => {
    const {
        tasks,
        showAddForm,
        newTask,
        handleInputChange,
        handleAddTask,
        handleDeleteTask,
        handleCancelAdd,
        handleShowAddForm,
        togglePriority,
        formatDate,
        calculateTaskUrgency,
        sortedTasks
    } = useTaskTracker();

    return (
        <div className="task-tracker-container-full">
            <div className="task-tracker-header">
                <h2>Tasks & Assignments</h2>
            </div>
            
            <div className="task-tracker-content">
                {tasks.length === 0 && !showAddForm && (
                    <div className="no-tasks-message">
                        <p>No tasks or assignments added yet.</p>
                    </div>
                )}
                
                <div className="tasks-grid">
                    {sortedTasks.map(task => (
                        <TaskItem 
                            key={task.id}
                            task={task}
                            urgencyClass={calculateTaskUrgency(task.date)}
                            onTogglePriority={togglePriority}
                            onDelete={handleDeleteTask}
                            formatDate={formatDate}
                        />
                    ))}
                </div>
                
                {showAddForm && (
                    <AddTaskForm 
                        newTask={newTask}
                        onChange={handleInputChange}
                        onSave={handleAddTask}
                        onCancel={handleCancelAdd}
                    />
                )}
                
                {!showAddForm && (
                    <button 
                        className="add-task-button"
                        onClick={handleShowAddForm}
                    >
                        <span className="plus-icon">+</span> Add New Task
                    </button>
                )}
            </div>
        </div>
    );
};

export default TaskTracker;
