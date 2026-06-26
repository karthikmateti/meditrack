import { useEffect, useCallback } from 'react';
import { medicinesService } from '../services/healthService';

export const useMedicineNotifications = (enabled = true) => {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  const checkMedicines = useCallback(async () => {
    if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const { data: medicines } = await medicinesService.getToday();
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      medicines.forEach((med) => {
        if (!med.time) return;
        const times = med.time.split(',').map((t) => t.trim());
        times.forEach((time) => {
          if (time === currentTime) {
            const notifiedKey = `notified_${med.id}_${time}_${todayKey()}`;
            if (!sessionStorage.getItem(notifiedKey)) {
              new Notification('MediTrack Reminder', {
                body: `Time to take ${med.medicine_name} (${med.dosage || 'as prescribed'})`,
                icon: '/favicon.svg',
              });
              sessionStorage.setItem(notifiedKey, 'true');
            }
          }
        });
      });
    } catch {
      // silently fail
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    requestPermission();
    checkMedicines();
    const interval = setInterval(checkMedicines, 60000);
    return () => clearInterval(interval);
  }, [enabled, checkMedicines, requestPermission]);
};

const todayKey = () => new Date().toISOString().split('T')[0];

export default useMedicineNotifications;
