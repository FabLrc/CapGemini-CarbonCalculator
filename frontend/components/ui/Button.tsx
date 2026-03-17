import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

type Variant = 'primary' | 'outline' | 'ghost';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  fullWidth = false,
}: Props) {
  const isDisabled = disabled || isLoading;

  const containerStyle: ViewStyle = {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isDisabled ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
    ...(variant === 'primary' && { backgroundColor: Colors.primary }),
    ...(variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: Colors.primary,
    }),
    ...(variant === 'ghost' && { backgroundColor: 'transparent' }),
    ...style,
  };

  const textColor =
    variant === 'primary' ? Colors.white : Colors.primary;

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress} disabled={isDisabled} activeOpacity={0.8}>
      {isLoading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
