"use client"

import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const stored = localStorage.getItem('islandfull_favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  const toggleFavorite = (activityId: string) => {
    setFavorites(prev => {
      let next;
      if (prev.includes(activityId)) {
        next = prev.filter(id => id !== activityId);
      } else {
        next = [...prev, activityId];
      }
      localStorage.setItem('islandfull_favorites', JSON.stringify(next));
      setTimeout(() => {
        window.dispatchEvent(new Event('favoritesChanged'));
      }, 0);
      return next;
    });
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('islandfull_favorites');
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (e) {}
      } else {
        setFavorites([]);
      }
    };
    window.addEventListener('favoritesChanged', handleStorageChange);
    return () => window.removeEventListener('favoritesChanged', handleStorageChange);
  }, []);

  return { favorites, toggleFavorite, isHydrated };
}
