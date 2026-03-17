import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = TextInputProps & {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export function Input({ label, error, containerStyle, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: Colors.textSecondary,
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{
          borderWidth: 1.5,
          borderColor: error ? Colors.danger : focused ? Colors.primary : Colors.border,
          borderRadius: 8,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
          color: Colors.textPrimary,
          backgroundColor: Colors.white,
        }}
        placeholderTextColor={Colors.textSecondary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && (
        <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>
      )}
    </View>
  );
}
