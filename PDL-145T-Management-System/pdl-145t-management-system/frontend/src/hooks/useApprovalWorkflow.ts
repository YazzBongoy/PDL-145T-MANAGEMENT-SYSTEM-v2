import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApprovalWorkflow {
  id: number;
  expenseId: number;
  currentLevel: number;
  level1_approver?: number;
  level1_status?: string;
  level1_date?: string;
  level1_notes?: string;
  level2_approver?: number;
  level2_status?: string;
  level2_date?: string;
  level2_notes?: string;
  level3_approver?: number;
  level3_status?: string;
  level3_date?: string;
  level3_notes?: string;
  level4_approver?: number;
  level4_status?: string;
  level4_date?: string;
  level4_notes?: string;
  paymentBlockedUntil?: string;
  createdAt: string;
  completedAt?: string;
}

interface PendingApproval {
  id: number;
  expenseId: number;
  expense: {
    id: number;
    TaskID: number;
    Cost: number;
    Date: string;
    Description?: string;
    task?: {
      Title: string;
    };
  };
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3010/api';

/**
 * Hook for fetching pending approvals
 */
export function usePendingApprovals() {
  return useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/approvals/pending`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch approvals');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

/**
 * Hook for fetching approval status
 */
export function useApprovalStatus(expenseId: number) {
  return useQuery({
    queryKey: ['approvals', 'status', expenseId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/approvals/${expenseId}/status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch approval status');
      return res.json();
    },
  });
}

/**
 * Hook for submitting an approval decision
 */
export function useSubmitApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      expenseId,
      level,
      action,
      notes,
    }: {
      expenseId: number;
      level: number;
      action: 'approve' | 'reject';
      notes: string;
    }) => {
      const res = await fetch(
        `${API_BASE}/approvals/${expenseId}/level/${level}/${action}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ notes }),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to submit approval');
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['approvals', 'pending'],
      });
      queryClient.invalidateQueries({
        queryKey: ['approvals', 'status', variables.expenseId],
      });
    },
  });
}

/**
 * Hook for checking if payment is ready
 */
export function usePaymentReady(expenseId: number) {
  return useQuery({
    queryKey: ['approvals', 'payment-ready', expenseId],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/approvals/${expenseId}/payment-ready`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (!res.ok) throw new Error('Failed to check payment status');
      return res.json();
    },
  });
}

/**
 * Hook for fetching audit trail
 */
export function useAuditTrail(entityType: string, entityId: number) {
  return useQuery({
    queryKey: ['audit', 'trail', entityType, entityId],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/audit/logs/${entityType}/${entityId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch audit trail');
      return res.json();
    },
  });
}

/**
 * Hook for fetching expense history
 */
export function useExpenseHistory(expenseId: number) {
  return useQuery({
    queryKey: ['audit', 'history', expenseId],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/audit/expense/${expenseId}/history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch expense history');
      return res.json();
    },
  });
}

/**
 * Hook for fetching reconciliation status
 */
export function useReconciliationStatus(expenseId: number) {
  return useQuery({
    queryKey: ['reconciliation', 'history', expenseId],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/reconciliation/expense/${expenseId}/history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch reconciliation status');
      return res.json();
    },
  });
}
