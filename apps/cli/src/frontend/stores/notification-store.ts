
import { atom, computed } from 'nanostores';
import type { Notification } from '@progy/core';
import { createFetcherStore, createMutatorStore, mutateCache } from './query-client';

// Fetcher for notifications
export const $notificationsQuery = createFetcherStore<Notification[]>(['/notifications']);

// Computed unread notifications
export const $unreadNotifications = computed($notificationsQuery, (q) => {
  const list = q.data || [];
  return list.filter(n => !n.read);
});

export const $hasUnread = computed($unreadNotifications, (unread) => unread.length > 0);

// Mutator for marking as read
const $markReadMutator = createMutatorStore<any>((ctx: { data: { id: string } }) => ({
  method: 'POST',
  body: JSON.stringify(ctx.data), // Acessando o id via ctx.data
  headers: { 'Content-Type': 'application/json' }
}));

// Mesma lógica aqui para manter consistência, mesmo que não use dados
const $markAllReadMutator = createMutatorStore<any>(() => ({
  method: 'POST',
}));

/**
 * Fetch notifications manually
 */
export const fetchNotifications = () => $notificationsQuery.revalidate();

/**
 * Mark a notification as read
 */
export const markAsRead = async (id: string) => {
  const res = await $markReadMutator.mutate({ id }, '/notifications/read');
  if (res.error) {
    console.error('Failed to mark notification as read:', res.error);
    return;
  }

  // Optimistic update
  const current = $notificationsQuery.get().data || [];
  const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
  mutateCache('/notifications', updated);
};

/**
 * Mark all as read
 */
export const markAllAsRead = async () => {
  const res = await $markAllReadMutator.mutate({}, '/notifications/read-all');
  if (res.error) {
    console.error('Failed to mark all as read:', res.error);
    return;
  }

  const current = $notificationsQuery.get().data || [];
  const updated = current.map(n => ({ ...n, read: true }));
  mutateCache('/notifications', updated);
};
