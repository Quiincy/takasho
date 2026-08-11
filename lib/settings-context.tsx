'use client';

import React, { createContext, useContext } from 'react';

export interface SiteSettings {
  contact_phone: string;
  contact_address: string;
  contact_schedule: string;
  contact_email: string;
  fop_name: string;
  fop_itn: string;
  work_time_start: string;
  work_time_end: string;
  is_ordering_enabled: boolean;
  gtm_id: string;
}

const defaultSettings: SiteSettings = {
  contact_phone: '+380 95 797 29 43',
  contact_address: 'вул. Едуарда Вільде, 10Б, Дніпровський район, м. Київ',
  contact_schedule: 'Пн-Нд: 10:00 – 21:00',
  contact_email: 'hello@enotsushi.kyiv.ua',
  fop_name: 'ФОП Гулак Дмитро Сергійович',
  fop_itn: '3139607532',
  work_time_start: '10:00',
  work_time_end: '21:00',
  is_ordering_enabled: true,
  gtm_id: '',
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
