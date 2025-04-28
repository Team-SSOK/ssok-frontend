import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { colors } from '@/constants/colors';

interface OnboardingCardProps {
  title: string;
  description: string;
  onPress: () => void;
  buttonText: string;
  containerStyle?: ViewStyle;
  active?: boolean;
}

const windowWidth = Dimensions.get('window').width;

const OnboardingCard: React.FC<OnboardingCardProps> = ({
  title,
  description,
  onPress,
  buttonText,
  containerStyle,
  active = false,
}) => {
  return (
    <View
      style={[
        styles.container,
        active ? styles.activeContainer : {},
        containerStyle,
      ]}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, active ? styles.activeButton : {}]}
        onPress={onPress}
      >
        <Text
          style={[styles.buttonText, active ? styles.activeButtonText : {}]}
        >
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: windowWidth - 48,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 10,
  },
  activeContainer: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  contentContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.black,
  },
  description: {
    fontSize: 14,
    color: colors.grey,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.silver,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontWeight: '600',
    color: colors.mGrey,
  },
  activeButtonText: {
    color: colors.white,
  },
});

export default OnboardingCard;
