import { TextStyle } from 'react-native';
import { colors } from './colors';

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const type = {
  h1: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    lineHeight: 36,
    color: colors.text,
  } as TextStyle,
  h2: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
  } as TextStyle,
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.text,
  } as TextStyle,
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  } as TextStyle,
  bodyMedium: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  } as TextStyle,
  caption: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  } as TextStyle,
  captionMedium: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  } as TextStyle,
  micro: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textMuted,
  } as TextStyle,
  bigStat: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 40,
    color: colors.text,
  } as TextStyle,
  phaseLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.text,
  } as TextStyle,
} as const;
