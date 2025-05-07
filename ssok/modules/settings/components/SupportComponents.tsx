import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

// 문의 유형 버튼 컴포넌트
type InquiryTypeButtonProps = {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
};

export const InquiryTypeButton: React.FC<InquiryTypeButtonProps> = ({
  label,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[styles.typeButton, isSelected && styles.selectedType]}
      onPress={onSelect}
    >
      <Text style={[styles.typeText, isSelected && styles.selectedTypeText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// 폼 입력 필드 컴포넌트
type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  isRequired?: boolean;
  isMultiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  isRequired = false,
  isMultiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => {
  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>
        {label}
        {isRequired && <Text style={styles.requiredMark}>*</Text>}
      </Text>
      <TextInput
        style={[styles.textInput, isMultiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.grey}
        multiline={isMultiline}
        numberOfLines={isMultiline ? 8 : 1}
        textAlignVertical={isMultiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
};

// 전화 상담 정보 컴포넌트
type PhoneSupportInfoProps = {
  phoneNumber: string;
  operatingHours: string;
};

export const PhoneSupportInfo: React.FC<PhoneSupportInfoProps> = ({
  phoneNumber,
  operatingHours,
}) => {
  return (
    <View style={styles.phoneSupport}>
      <Ionicons name="call-outline" size={24} color={colors.primary} />
      <View style={styles.phoneSupportTextContainer}>
        <Text style={styles.phoneSupportTitle}>전화 상담</Text>
        <Text style={styles.phoneSupportNumber}>{phoneNumber}</Text>
        <Text style={styles.phoneSupportInfo}>{operatingHours}</Text>
      </View>
    </View>
  );
};

// 제출 버튼 컴포넌트
type SubmitButtonProps = {
  label: string;
  onPress: () => void;
};

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  label,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.submitButton} onPress={onPress}>
      <Text style={styles.submitButtonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.black,
  },
  requiredMark: {
    color: 'red',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.silver,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.black,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.silver,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedType: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    fontSize: 14,
    color: colors.black,
  },
  selectedTypeText: {
    color: colors.white,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneSupport: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: colors.lGrey,
    borderRadius: 8,
    marginBottom: 30,
  },
  phoneSupportTextContainer: {
    marginLeft: 15,
  },
  phoneSupportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  phoneSupportNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginVertical: 5,
  },
  phoneSupportInfo: {
    fontSize: 14,
    color: colors.grey,
  },
});
