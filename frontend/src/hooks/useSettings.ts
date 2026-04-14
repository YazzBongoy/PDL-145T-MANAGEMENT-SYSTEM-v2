import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSettings, updateSettings, updateNotifications } from '../api/settings';

const SETTINGS_KEY = 'settings';

export function useSettings() {
  return useQuery({
    queryKey: [SETTINGS_KEY],
    queryFn: fetchSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY] });
    },
  });
}

export function useUpdateNotifications() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY] });
    },
  });
}
