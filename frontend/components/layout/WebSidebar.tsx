import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/colors';
import { Home, BarChart3, Map, Plus, LogOut } from 'lucide-react-native';

type NavItem = { label: string; icon: React.ReactNode; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',          icon: <Home      size={17} />, href: '/' },
  { label: 'Comparer les sites', icon: <BarChart3 size={17} />, href: '/compare' },
  { label: 'Carte des sites',    icon: <Map       size={17} />, href: '/map' },
];

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primaryUltraLight,
        borderWidth: 2,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primary }}>{initials}</Text>
    </View>
  );
}

export function WebSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '';
    return pathname.startsWith(href);
  };

  return (
    <View
      style={{
        width: 240,
        backgroundColor: Colors.sidebarBg,
        borderRightWidth: 1,
        borderRightColor: Colors.border,
        flexDirection: 'column',
      }}
    >
      {/* Logo */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}
      >
        <Image
          source={require('@/assets/Capgemini_Logo_Nom.png')}
          style={{ width: 150, height: 38, resizeMode: 'contain', marginBottom: 6 }}
        />
        <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.5 }}>
          Carbon Calculator
        </Text>
      </View>

      {/* Navigation */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
        {/* New site CTA */}
        <TouchableOpacity
          onPress={() => router.push('/(app)/sites/new' as any)}
          style={{
            backgroundColor: Colors.primary,
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Plus size={16} color={Colors.white} strokeWidth={2.5} />
          <Text style={{ color: Colors.white, fontSize: 14, fontWeight: '600' }}>Nouveau site</Text>
        </TouchableOpacity>

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <TouchableOpacity
              key={item.href}
              onPress={() => router.push(item.href as any)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 8,
                marginBottom: 2,
                backgroundColor: active ? Colors.primaryUltraLight : 'transparent',
                borderLeftWidth: 3,
                borderLeftColor: active ? Colors.primary : 'transparent',
              }}
            >
              {React.cloneElement(item.icon as React.ReactElement, {
            color: active ? Colors.primary : Colors.textSecondary,
            strokeWidth: active ? 2.5 : 1.8,
          })}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: active ? '700' : '500',
                  color: active ? Colors.primary : Colors.textSecondary,
                  flex: 1,
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* User info + logout */}
      <View
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          gap: 12,
        }}
      >
        {user && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <UserAvatar name={`${user.firstName} ${user.lastName}`} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary }} numberOfLines={1}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 1 }} numberOfLines={1}>
                {user.organizationName ?? 'Super Admin'}
              </Text>
            </View>
          </View>
        )}
        <TouchableOpacity
          onPress={logout}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: Colors.border,
            alignItems: 'center',
            backgroundColor: Colors.white,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <LogOut size={14} color={Colors.textSecondary} strokeWidth={1.8} />
            <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '500' }}>Déconnexion</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
