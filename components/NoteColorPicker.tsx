
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import type { NoteColor } from "../types/note";

import { typography, spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import type { ThemeColors } from "../theme/colors";

type NoteColorPickerProps = {
  currentColor: NoteColor;
  onSelect: (color: NoteColor) => void;
  onClose: () => void;
};

export default function NoteColorPicker({
  currentColor,
  onSelect,
  onClose,
}: NoteColorPickerProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const colorOptions: {
    value: NoteColor;
    label: string;
    color: string;
  }[] = [
    {
      value: "default",
      label: "Default",
      color: colors.surface,
    },
    {
      value: "yellow",
      label: "Yellow",
      color: "#FFF3A3",
    },
    {
      value: "blue",
      label: "Blue",
      color: "#BDE0FE",
    },
    {
      value: "green",
      label: "Green",
      color: "#C7F9CC",
    },
    {
      value: "pink",
      label: "Pink",
      color: "#FFC8DD",
    },
  ];

  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close color picker"
      />

      <View
        style={styles.picker}
        accessibilityLabel="Choose note color"
      >
        <Text
          style={styles.title}
          accessibilityRole="header"
        >
          Note Color
        </Text>

        <Text style={styles.subtitle}>
          Choose a color for this note
        </Text>

        <View style={styles.options}>
          {colorOptions.map((option) => {
            const isSelected = currentColor === option.value;

            return (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.optionPressed,
                ]}
                onPress={() => onSelect(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${option.label}${isSelected ? ", selected" : ""}`}
              >
                <View
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: option.color,
                    },
                    isSelected && styles.selectedCircle,
                  ]}
                />

                <Text style={styles.label}>
                  {option.label}
                </Text>

                {isSelected && (
                  <Text style={styles.selectedText}>
                    Selected
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={styles.closeButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close color picker without changing color"
        >
          <Text style={styles.closeButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 200,
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.25)",
    },

    picker: {
      position: "absolute",
      left: spacing.lg,
      right: spacing.lg,
      bottom: spacing.xxl,
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 10,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },

    title: {
      fontSize: typography.heading,
      fontWeight: typography.bold,
      color: colors.text,
    },

    subtitle: {
      fontSize: typography.bodySmall,
      color: colors.secondaryText,
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },

    options: {
      gap: spacing.sm,
    },

    option: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: 10,
      minHeight: 48,
    },

    optionPressed: {
      backgroundColor: colors.inputBackground,
    },

    colorCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.md,
    },

    selectedCircle: {
      borderWidth: 3,
      borderColor: colors.primary,
    },

    label: {
      flex: 1,
      fontSize: typography.body,
      color: colors.text,
    },

    selectedText: {
      fontSize: typography.bodySmall,
      color: colors.primary,
      fontWeight: typography.semibold,
    },

    closeButton: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
      padding: spacing.sm,
      marginTop: spacing.md,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },

    closeButtonText: {
      fontSize: typography.body,
      fontWeight: typography.semibold,
      color: colors.text,
    },
  });
}
