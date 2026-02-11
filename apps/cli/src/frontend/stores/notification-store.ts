import { atom, computed } from 'nanostores';
import type { Notification } from '@progy/core';
import { createFetcherStore, mutateCache } from './query-client';

// Fetcher for notifications
export const $notificationsQuery = createFetcherStore<Notification[]>(['/notifications']);

// Computed unread notifications
export const $unreadNotifications = computed($notificationsQuery, (q) => {
  const list = q.data || [];
  return list.filter(n => !n.read);
});

export const $hasUnread = computed($unreadNotifications, (unread) => unread.length > 0);

/**
 * Fetch notifications manually
 */
export const fetchNotifications = () => $notificationsQuery.revalidate();

/**
 * Mark a notification as read
 */
export const markAsRead = async (id: string) => {
  try {
    const res = await fetch('/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    if (res.ok) {
      // Optimistic update
      const current = $notificationsQuery.get().data || [];
      const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
      mutateCache('/notifications', updated);
    }
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
  }
};

/**
 * Mark all as read
 */
export const markAllAsRead = async () => {
  try {
    const res = await fetch('/notifications/read-all', { method: 'POST' });
    if (res.ok) {
      const current = $notificationsQuery.get().data || [];
      const updated = current.map(n => ({ ...n, read: true }));
      mutateCache('/notifications', updated);
    }
  } catch (err) {
    console.error('Failed to mark all as read:', err);
  }
};
