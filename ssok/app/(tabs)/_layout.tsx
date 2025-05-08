import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'rgba(100, 100, 100, 0.5)',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: typography.body1.fontFamily,
          fontSize: 12,
          marginTop: -5,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom > 0 ? 25 : 15,
          left: 15,
          right: 15,
          height: 65,
          borderRadius: 25,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          overflow: 'hidden',
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          paddingHorizontal: 10,
        },
        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={80}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarItemStyle: {
          marginVertical: 5,
        },
      }}
      tabBar={(props) => (
        <View style={styles.wrapper}>
          <BlurView
            tint="light"
            intensity={80}
            style={[
              styles.blur,
              {
                bottom: insets.bottom > 0 ? 25 : 15,
              },
            ]}
          >
            <View style={styles.tabBar}>
              {props.state.routes.map((route, index) => {
                const { options } = props.descriptors[route.key];
                const label = options.title || route.name;
                const isFocused = props.state.index === index;

                let iconName = 'home-outline';
                if (route.name === 'bluetooth') {
                  iconName = isFocused ? 'bluetooth' : 'bluetooth-outline';
                } else if (route.name === 'settings') {
                  iconName = isFocused ? 'settings' : 'settings-outline';
                } else if (route.name === 'index') {
                  iconName = isFocused ? 'home' : 'home-outline';
                }

                const onPress = () => {
                  const event = props.navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    props.navigation.navigate(route.name);
                  }
                };

                return (
                  <TouchableOpacity
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    onPress={onPress}
                    style={styles.tabItem}
                  >
                    <View
                      style={[
                        styles.tabItemContainer,
                        {
                          opacity: isFocused ? 1 : 0.7,
                          transform: [{ scale: isFocused ? 1.1 : 0.95 }],
                        },
                      ]}
                    >
                      <Ionicons
                        name={iconName as any}
                        size={24}
                        color={
                          isFocused
                            ? colors.primary
                            : 'rgba(100, 100, 100, 0.8)'
                        }
                      />
                      <Text
                        style={[
                          styles.label,
                          {
                            color: isFocused
                              ? colors.primary
                              : 'rgba(100, 100, 100, 0.8)',
                            fontFamily: isFocused
                              ? typography.captionBold.fontFamily
                              : typography.caption.fontFamily,
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </BlurView>
        </View>
      )}
    >
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="bluetooth" options={{ title: '블루투스 송금' }} />
      <Tabs.Screen name="settings" options={{ title: '설정' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blur: {
    position: 'absolute',
    left: 15,
    right: 15,
    height: 65,
    borderRadius: 25,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    height: 65,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
});
