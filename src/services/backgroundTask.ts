import * as TaskManager from 'expo-task-manager';
import { getJSON, setJSON } from './storage';

export const MILESTONE_TASK = 'MILESTONE_REFRESH';

// Defined at module level — must be imported before AppRegistry
TaskManager.defineTask(MILESTONE_TASK, async () => {
  try {
    const dates = await getJSON<unknown[]>('anchor_dates');
    await setJSON('milestone_last_refresh', new Date().toISOString());
    console.log('[MilestoneTask] refreshed', dates?.length ?? 0, 'dates');
    return 'noData';
  } catch (e) {
    console.error('[MilestoneTask]', e);
    return 'failed';
  }
});
