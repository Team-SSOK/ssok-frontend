import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';

export default function Index() {
  const handleStart = () => {
    router.push('/');
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>SSOK 쏙</Text>
          <Text style={styles.subtitle}>터치 한 번으로 완성되는</Text>
          <Text style={styles.subtitle}>나만의 간편 송금 앱</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleStart}
          testID="start-button"
        >
          <Text style={styles.buttonText}>SSOK 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: '30%',
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
