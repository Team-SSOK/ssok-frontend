import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { colors } from '@/constants/colors';
import {
  View,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import LottieView from 'lottie-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Android에서 LayoutAnimation 활성화
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function TabButton({ route, index, state, descriptors, navigation }: any) {
  const isFocused = state.index === index;
  const { options } = descriptors[route.key];
  const label = options.title || route.name;
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (isFocused && lottieRef.current) {
      lottieRef.current.play();
    }
  }, [isFocused]);

  // Lottie 파일 경로 결정
  let lottieSource;
  if (route.name === 'bluetooth') {
    lottieSource = require('@/assets/lottie/bluetooth.json');
  } else if (route.name === 'settings') {
    lottieSource = require('@/assets/lottie/setting.json');
  } else if (route.name === 'index') {
    lottieSource = require('@/assets/lottie/home.json');
  }

  const onPress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <Pressable
      key={route.key}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      onPress={onPress}
      style={styles.tabItem}
    >
      <View style={[styles.lottieContainer, isFocused && styles.activeTab]}>
        <LottieView
          ref={lottieRef}
          source={lottieSource}
          style={styles.lottie}
          autoPlay={isFocused}
          loop={false}
          colorFilters={[
            {
              keypath: '**',
              color: isFocused ? '#ffffff' : '#888888',
            },
          ]}
        />
      </View>
      <Text
        style={[
          styles.label,
          {
            color: isFocused ? colors.primary : '#aaa',
            fontFamily: isFocused
              ? typography.captionBold.fontFamily
              : typography.caption.fontFamily,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#aaa',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 5),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
      tabBar={(props: BottomTabBarProps) => (
        <View
          style={[
            styles.tabBarContainer,
            {
              paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
            },
          ]}
        >
          <View style={styles.tabBar}>
            {props.state.routes.map((route: any, index: number) => (
              <TabButton
                key={route.key}
                route={route}
                index={index}
                state={props.state}
                descriptors={props.descriptors}
                navigation={props.navigation}
              />
            ))}
          </View>
        </View>
      )}
    >
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="bluetooth" options={{ title: ' 송금 ' }} />
      <Tabs.Screen name="settings" options={{ title: ' 설정 ' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    width: '70%',
    height: 65,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    borderRadius: 20,
  },
  lottie: {
    width: 28,
    height: 28,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
});
