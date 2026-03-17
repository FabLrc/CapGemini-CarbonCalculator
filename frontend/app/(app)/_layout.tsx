import { Stack } from 'expo-router';
import { Platform, View, useWindowDimensions } from 'react-native';
import { WebSidebar } from '@/components/layout/WebSidebar';
import { Colors } from '@/constants/colors';

export default function AppLayout() {
  const { width } = useWindowDimensions();
  const showSidebar = Platform.OS === 'web' && width >= 768;

  if (showSidebar) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Colors.background }}>
        <WebSidebar />
        <View style={{ flex: 1, overflow: 'hidden' as any }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
