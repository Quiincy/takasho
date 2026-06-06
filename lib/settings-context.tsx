'use client';

import React, { createContext, useContext } from 'react';

export interface SiteSettings {
  contact_phone: string;
  contact_address: string;
  contact_schedule: string;
}

const defaultSettings: SiteSettings = {
  contact_phone: '+380 95 797 29 43',
  contact_address: 'вул. Едуарда Вільде, 10Б, Дніпровський район, м. Київ',
  contact_schedule: 'Пн-Нд: 10:00 – 21:00',
};

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);

export function SiteSettingsProvider({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings?: Partial<SiteSettings>;
}) {
  const value = { ...defaultSettings, ...settings };
  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
