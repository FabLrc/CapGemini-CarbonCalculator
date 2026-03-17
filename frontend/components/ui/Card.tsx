import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.surface,
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
