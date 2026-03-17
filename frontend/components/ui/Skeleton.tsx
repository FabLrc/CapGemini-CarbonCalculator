import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#D1D5DB',
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Carte squelette pour un site dans le dashboard */
export function SiteCardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Skeleton width="55%" height={18} />
        <Skeleton width={10} height={10} borderRadius={5} />
      </View>
      <Skeleton width="35%" height={12} style={{ marginBottom: 12 }} />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <Skeleton width="30%" height={12} />
        <Skeleton width="30%" height={12} />
        <Skeleton width="25%" height={12} />
      </View>
      <View style={{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Skeleton width="40%" height={14} />
        <Skeleton width="25%" height={14} />
      </View>
    </View>
  );
}

/** Squelette de la bannière stats du dashboard */
export function StatsBannerSkeleton() {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
      }}
    >
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ alignItems: 'center', gap: 6 }}>
          <Skeleton width={40} height={22} />
          <Skeleton width={60} height={11} />
        </View>
      ))}
    </View>
  );
}

/** Squelette pour la page de détail d'un site */
export function SiteDetailSkeleton() {
  return (
    <View style={{ padding: 16 }}>
      {/* KPIs */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -6, marginBottom: 20 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ margin: 6, flex: 1, minWidth: 100 }}>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14 }}>
              <Skeleton width={28} height={28} borderRadius={14} style={{ marginBottom: 8 }} />
              <Skeleton width="70%" height={20} style={{ marginBottom: 6 }} />
              <Skeleton width="50%" height={12} />
            </View>
          </View>
        ))}
      </View>
      {/* Cards */}
      {[120, 180, 80].map((h, i) => (
        <View
          key={i}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <Skeleton width="40%" height={13} style={{ marginBottom: 14 }} />
          <Skeleton height={h} borderRadius={8} />
        </View>
      ))}
    </View>
  );
}
