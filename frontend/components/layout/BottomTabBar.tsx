import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/colors';
import { Home, BarChart3, Plus, Map, LogOut } from 'lucide-react-native';

const ICON_SIZE = 22;
const ICON_SIZE_NEW = 26;

type Tab =
  | { kind: 'nav'; label: string; icon: React.ReactNode; href: string }
  | { kind: 'new' }
  | { kind: 'action'; label: string; icon: React.ReactNode; action: () => void };

export function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '';
    return pathname.startsWith(href);
  };

  const tabs: Tab[] = [
    { kind: 'nav', label: 'Accueil',  icon: <Home  size={ICON_SIZE} />, href: '/' },
    { kind: 'nav', label: 'Comparer', icon: <BarChart3 size={ICON_SIZE} />, href: '/compare' },
    { kind: 'new' },
    { kind: 'nav', label: 'Carte',    icon: <Map   size={ICON_SIZE} />, href: '/map' },
    { kind: 'action', label: 'Déco.', icon: <LogOut size={ICON_SIZE} />, action: logout },
  ];

  const barHeight = Platform.OS === 'ios' ? 74 : 60;
  const pbottom   = Platform.OS === 'ios' ? 14 : 0;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: barHeight,
        paddingBottom: pbottom,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'stretch',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      {tabs.map((tab, i) => {
        // ── Centre FAB ──────────────────────────────────────────────────────
        if (tab.kind === 'new') {
          return (
            <View key="new" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity
                onPress={() => router.push('/(app)/sites/new' as any)}
                activeOpacity={0.85}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: Colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  // Lift above the bar
                  marginTop: -(Platform.OS === 'ios' ? 22 : 18),
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.45,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Plus size={ICON_SIZE_NEW} color={Colors.white} strokeWidth={2.5} />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color: Colors.primary,
                  marginTop: 2,
                }}
              >
                Nouveau
              </Text>
            </View>
          );
        }

        // ── Regular nav / action ─────────────────────────────────────────
        const active =
          tab.kind === 'nav' ? isActive(tab.href) : false;
        const color = active ? Colors.primary : Colors.textTertiary;

        return (
          <TouchableOpacity
            key={i}
            onPress={() =>
              tab.kind === 'nav'
                ? router.push(tab.href as any)
                : tab.action()
            }
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 3,
              paddingTop: 8,
            }}
            activeOpacity={0.7}
          >
            {/* Active indicator bar */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: '15%',
                right: '15%',
                height: 2.5,
                backgroundColor: active ? Colors.primary : 'transparent',
                borderRadius: 2,
              }}
            />
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? Colors.primaryUltraLight : 'transparent',
              }}
            >
              {React.cloneElement(tab.icon as React.ReactElement, { color, strokeWidth: active ? 2.5 : 1.8 })}
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: active ? '700' : '400',
                color,
                letterSpacing: 0.2,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
