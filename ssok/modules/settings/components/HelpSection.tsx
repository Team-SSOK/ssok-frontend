import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

// FAQ 항목 타입 정의
export type FAQItemTypes = {
  question: string;
  answer: string;
  isExpanded: boolean;
};

// FAQ 항목 컴포넌트
type FAQItemProps = {
  item: FAQItemTypes;
  onToggle: () => void;
};

export const FAQItem: React.FC<FAQItemProps> = ({ item, onToggle }) => {
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqQuestion} onPress={onToggle}>
        <Text style={styles.faqQuestionText}>{item.question}</Text>
        <Ionicons
          name={item.isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.grey}
        />
      </TouchableOpacity>
      {item.isExpanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
};

// 도움말 기능 항목 컴포넌트
type HelpItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress?: () => void;
};

export const HelpItem: React.FC<HelpItemProps> = ({
  icon,
  title,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.helpItem} onPress={onPress}>
      <View style={styles.helpItemLeft}>
        <Ionicons name={icon} size={24} color={colors.primary} />
        <View style={styles.helpItemTextContainer}>
          <Text style={styles.helpItemTitle}>{title}</Text>
          <Text style={styles.helpItemDescription}>{description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.grey} />
    </TouchableOpacity>
  );
};

// 정보 안내 박스 컴포넌트
type InfoBoxProps = {
  children: React.ReactNode;
};

export const InfoBox: React.FC<InfoBoxProps> = ({ children }) => {
  return <View style={styles.infoBox}>{children}</View>;
};

const styles = StyleSheet.create({
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  faqQuestionText: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  faqAnswer: {
    paddingBottom: 15,
  },
  faqAnswerText: {
    fontSize: 14,
    color: colors.grey,
    lineHeight: 20,
  },
  helpItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  helpItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helpItemTextContainer: {
    marginLeft: 15,
  },
  helpItemTitle: {
    fontSize: 16,
    color: colors.black,
  },
  helpItemDescription: {
    fontSize: 14,
    color: colors.grey,
    marginTop: 3,
  },
  infoBox: {
    backgroundColor: colors.silver,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
});
