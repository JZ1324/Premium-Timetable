import { useState, useCallback } from 'react';

/**
 * Encapsulates study timer logic to isolate frequent timer state updates
 * from the large AcademicPlanner component.
 *
 * @param {Array} tasks
 * @param {(updater:Function|Array)=>void} setTasks - accepts functional updater like useState
 * @param {(msg:string,type?:string)=>void} showToast
 */
export function useStudyTimer(tasks, setTasks, showToast) {
  const [studyTimer, setStudyTimer] = useState({ taskId: null, startTime: null, isRunning: false });

  // Helper to find either a main task or subtask
  const findTaskOrSubtask = useCallback((taskId) => {
    const mainTask = tasks.find(t => t.id === taskId);
    if (mainTask) return { task: mainTask, isSubtask: false, parentTask: null };
    for (const t of tasks) {
      if (t.subtasks) {
        const sub = t.subtasks.find(st => st.id === taskId);
        if (sub) return { task: sub, isSubtask: true, parentTask: t };
      }
    }
    return null;
  }, [tasks]);

  const startStudyTimer = useCallback((taskId) => {
    // Stop any current timer first
    if (studyTimer.isRunning) stopStudyTimer();

    const info = findTaskOrSubtask(taskId);
    if (!info) { console.error('Task not found for timer start', taskId); return; }

    const now = new Date();
    setStudyTimer({ taskId, startTime: now, isRunning: true });

    // Update tasks to mark timer active
    if (info.isSubtask) {
      setTasks(prev => prev.map(t => t.id === info.parentTask.id ? {
        ...t,
        subtasks: t.subtasks.map(st => st.id === taskId ? {
          ...st,
          status: 'in-progress',
          timerData: {
            ...st.timerData,
            lastStartTime: now.toISOString(),
            isActive: true
          }
        } : st)
      } : t));
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? {
        ...t,
        status: 'in-progress',
        timerData: {
          ...t.timerData,
          lastStartTime: now.toISOString(),
          isActive: true
        }
      } : t));
    }

    showToast && showToast(`Timer started for "${info.task.title}" ⏱️`, 'timer');
  }, [studyTimer.isRunning, findTaskOrSubtask, setTasks, showToast]);

  const stopStudyTimer = useCallback(() => {
    if (!studyTimer.isRunning || !studyTimer.taskId) return;

    const info = findTaskOrSubtask(studyTimer.taskId);
    const now = new Date();
    const sessionDuration = Math.floor((now - studyTimer.startTime) / 1000);

    if (!info) { setStudyTimer({ taskId: null, startTime: null, isRunning: false }); return; }

    if (sessionDuration >= 5) {
      if (info.isSubtask) {
        setTasks(prev => prev.map(t => t.id === info.parentTask.id ? {
          ...t,
          subtasks: t.subtasks.map(st => st.id === studyTimer.taskId ? {
            ...st,
            timerData: {
              ...st.timerData,
              totalTimeSpent: (st.timerData?.totalTimeSpent || 0) + sessionDuration,
              lastStartTime: null,
              isActive: false,
              sessions: [ ...(st.timerData?.sessions || []), {
                startTime: studyTimer.startTime.toISOString(),
                endTime: now.toISOString(),
                duration: sessionDuration
              }]
            }
          } : st)
        } : t));
      } else {
        setTasks(prev => prev.map(t => t.id === studyTimer.taskId ? {
          ...t,
          timerData: {
            ...t.timerData,
            totalTimeSpent: (t.timerData?.totalTimeSpent || 0) + sessionDuration,
            lastStartTime: null,
            isActive: false,
            sessions: [ ...(t.timerData?.sessions || []), {
              startTime: studyTimer.startTime.toISOString(),
              endTime: now.toISOString(),
              duration: sessionDuration
            }]
          }
        } : t));
      }
    } else {
      // Just clear active flag if short session
      if (info) {
        if (info.isSubtask) {
          setTasks(prev => prev.map(t => t.id === info.parentTask.id ? {
            ...t,
            subtasks: t.subtasks.map(st => st.id === studyTimer.taskId ? {
              ...st,
              timerData: { ...st.timerData, lastStartTime: null, isActive: false }
            } : st)
          } : t));
        } else {
          setTasks(prev => prev.map(t => t.id === studyTimer.taskId ? {
            ...t,
            timerData: { ...t.timerData, lastStartTime: null, isActive: false }
          } : t));
        }
      }
    }

    setStudyTimer({ taskId: null, startTime: null, isRunning: false });
    showToast && showToast('Timer stopped ⏹️', 'timer');
  }, [studyTimer, findTaskOrSubtask, setTasks, showToast]);

  const restoreActiveTimer = useCallback(() => {
    try {
      const saved = localStorage.getItem('academicPlannerTasks');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      const active = parsed.find(t => t.timerData?.isActive);
      if (active?.timerData?.lastStartTime) {
        const lastStart = new Date(active.timerData.lastStartTime);
        const hours = (Date.now() - lastStart.getTime()) / 36e5;
        if (hours < 24) {
          setStudyTimer({ taskId: active.id, startTime: lastStart, isRunning: true });
          showToast && showToast(`Restored timer for "${active.title}" 🔄`, 'info');
        } else {
          // Clean old flag
          setTasks(prev => prev.map(t => t.id === active.id ? {
            ...t,
            timerData: { ...t.timerData, isActive: false, lastStartTime: null }
          } : t));
        }
      }
    } catch (e) { /* ignore */ }
  }, [setTasks, showToast]);

  return { studyTimer, startStudyTimer, stopStudyTimer, restoreActiveTimer };
}

export default useStudyTimer;
