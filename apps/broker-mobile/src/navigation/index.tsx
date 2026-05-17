import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Platform,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useConfigStore } from '../store/configStore';
import { colors, radius, shadow } from '../theme';

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const ListingsStack = createStackNavigator();
const BookingsStack = createStackNavigator();
const ChatStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Root = createStackNavigator();

import ServerConfigScreen from '../screens/config/ServerConfigScreen';
import BrokerDashboard from '../screens/dashboard/BrokerDashboard';
import OtpScreen from '../screens/auth/OtpScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MyListingsScreen from '../screens/listings/MyListingsScreen';
import AddPropertyScreen from '../screens/listings/AddPropertyScreen';
import BookingRequestsScreen from '../screens/bookings/BookingRequestsScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import BrokerProfileScreen from '../screens/profile/ProfileScreen';

const TABS: Record<string, { icon: string; label: string }> = {
  dashboard: { icon: '📊', label: 'الرئيسية' },
  listings: { icon: '🏠', label: 'عقاراتي' },
  bookings: { icon: '📅', label: 'الحجوزات' },
  chat: { icon: '💬', label: 'الدردشة' },
  profile: { icon: '👤', label: 'حسابي' },
};

function BrokerTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={tabStyles.wrapper}>
      <View style={tabStyles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const tab = TABS[route.name] ?? { icon: '●', label: route.name };
          return (
            <TouchableOpacity
              key={route.key}
              style={tabStyles.item}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              onLongPress={() =>
                navigation.emit({ type: 'tabLongPress', target: route.key })
              }
              activeOpacity={0.8}
            >
              {/* Active indicator bar above icon */}
              <View style={[tabStyles.activeBar, focused && tabStyles.activeBarVisible]} />

              {/* Icon container */}
              <View
                style={[
                  tabStyles.iconWrap,
                  focused && tabStyles.iconWrapActive,
                ]}
              >
                <Text style={tabStyles.icon}>{tab.icon}</Text>
              </View>

              {/* Label */}
              <Text
                style={[
                  tabStyles.label,
                  focused ? tabStyles.labelActive : tabStyles.labelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function ListingsNavigator() {
  return (
    <ListingsStack.Navigator screenOptions={{ headerShown: false }}>
      <ListingsStack.Screen name="MyListings" component={MyListingsScreen} />
      <ListingsStack.Screen name="AddProperty" component={AddPropertyScreen} />
    </ListingsStack.Navigator>
  );
}

function BookingsNavigator() {
  return (
    <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingsStack.Screen name="BookingRequests" component={BookingRequestsScreen} />
    </BookingsStack.Navigator>
  );
}

function ChatNavigator() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="Chat" component={ChatScreen} />
    </ChatStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={BrokerProfileScreen} />
      <ProfileStack.Screen name="ServerConfig" component={ServerConfigScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <MainTab.Navigator
      tabBar={(props) => <BrokerTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 },
      }}
    >
      <MainTab.Screen name="dashboard" component={BrokerDashboard} />
      <MainTab.Screen name="listings" component={ListingsNavigator} />
      <MainTab.Screen name="bookings" component={BookingsNavigator} />
      <MainTab.Screen name="chat" component={ChatNavigator} />
      <MainTab.Screen name="profile" component={ProfileNavigator} />
    </MainTab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Otp" component={OtpScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export function AppNavigator(): React.ReactElement {
  const { isAuthenticated, isLoading: authLoading, hydrate: hydrateAuth } = useAuthStore();
  const { isConfigured, isLoading: configLoading, hydrate: hydrateConfig } = useConfigStore();

  useEffect(() => {
    hydrateConfig();
    hydrateAuth();
  }, []);

  if (authLoading || configLoading) {
    return (
      <View style={splashStyles.container}>
        <View style={splashStyles.logoWrap}>
          <Text style={splashStyles.logo}>🏢</Text>
        </View>
        <Text style={splashStyles.name}>وكيل عقاري</Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 36 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!isConfigured ? (
          <Root.Screen name="Setup" component={ServerConfigScreen} />
        ) : isAuthenticated ? (
          <Root.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Root.Screen name="Auth" component={AuthNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: { fontSize: 48 },
  name: { fontSize: 24, fontWeight: '800', color: '#fff' },
});

const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.dark,
    borderRadius: radius.xl,
    padding: 6,
    gap: 2,
    ...shadow.lg,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radius.lg,
    gap: 2,
    position: 'relative',
    paddingTop: 12,
  },

  // Blue indicator bar above icon
  activeBar: {
    position: 'absolute',
    top: 2,
    left: '25%',
    right: '25%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  activeBarVisible: {
    backgroundColor: colors.primary,
  },

  // Icon container 36×36 rounded square
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapActive: {
    backgroundColor: colors.primary,
  },

  icon: { fontSize: 18 },

  label: { fontSize: 11, fontWeight: '700' },
  labelActive: { color: colors.primary },
  labelInactive: { color: 'rgba(255,255,255,0.45)' },
});
