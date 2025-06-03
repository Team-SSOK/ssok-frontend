import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';

// 개인정보처리방침 섹션 컴포넌트
type PrivacySectionProps = {
  title: string;
  children: ReactNode;
};

export const PrivacySection: React.FC<PrivacySectionProps> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
};

// 단락 텍스트 컴포넌트
type ParagraphProps = {
  children: string;
};

export const Paragraph: React.FC<ParagraphProps> = ({ children }) => {
  return <Text style={styles.paragraph}>{children}</Text>;
};

// 글머리 기호 항목 컴포넌트
type BulletItemProps = {
  children: ReactNode;
};

export const BulletItem: React.FC<BulletItemProps> = ({ children }) => {
  return (
    <View style={styles.bulletPoint}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
};

// 강조 텍스트 컴포넌트
type BoldTextProps = {
  children: string;
};

export const BoldText: React.FC<BoldTextProps> = ({ children }) => {
  return <Text style={styles.bold}>{children}</Text>;
};

// 정보 항목 컴포넌트
type InfoItemProps = {
  label: string;
  value: string;
};

export const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.black,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.black,
    marginBottom: 10,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 15,
    marginRight: 8,
    color: colors.black,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.black,
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 15,
    width: 70,
    fontWeight: 'bold',
    color: colors.black,
  },
  infoValue: {
    fontSize: 15,
    color: colors.black,
  },
});
