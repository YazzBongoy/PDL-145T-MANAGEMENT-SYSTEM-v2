import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDevices, fetchDeviceById, createDevice, updateDevice, deleteDevice, type UpdateDeviceData } from '../api/devices';

const DEVICES_KEY = 'devices';

export function useDevices(filters?: { type?: string; status?: string; location?: string; search?: string }) {
  return useQuery({
    queryKey: [DEVICES_KEY, filters],
    queryFn: () => fetchDevices(filters),
  });
}

export function useDevice(id: number) {
  return useQuery({
    queryKey: [DEVICES_KEY, id],
    queryFn: () => fetchDeviceById(id),
    enabled: !!id,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEVICES_KEY] });
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDeviceData }) => updateDevice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [DEVICES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEVICES_KEY, id] });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEVICES_KEY] });
    },
  });
}
