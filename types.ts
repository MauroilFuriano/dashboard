import React from 'react';

export enum Tab {
  WELCOME = 'WELCOME',
  EXCHANGE = 'EXCHANGE',
  TELEGRAM = 'TELEGRAM',
  ACTIVATION = 'ACTIVATION',
  ANALYZER = 'ANALYZER'
}

export interface NavigationItem {
  id: Tab;
  label: string;
  icon: React.ElementType;
}