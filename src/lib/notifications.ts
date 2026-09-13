export interface ActiveNotificationAlert {
  id: string;
  batchId: string;
  batchCode: string;
  batchName: string;
  title: string;
  message: string;
  type: 'TASTE' | 'BOTTLE' | 'OVERDUE' | 'CHILL' | 'PRESSURE_CHECK';
  scheduledDate: string;
  dismissed: boolean;
}

export function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve(false);
  }
  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }
  if (Notification.permission !== 'denied') {
    return Notification.requestPermission().then((permission) => permission === 'granted');
  }
  return Promise.resolve(false);
}

export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/icon-kombucha.png',
        badge: '/icon-kombucha.png',
        ...options,
      });
    } catch (e) {
      console.warn('Browser notification failed:', e);
    }
  }
}
