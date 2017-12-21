import upperFirst from 'lodash/upperFirst';

export const formatDuration = (ms) => {
  const totalSecs = Math.round(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatTitle = f => (f === 'time_signature' ? 'Timesig' : upperFirst(f).replace('_', ' '));
