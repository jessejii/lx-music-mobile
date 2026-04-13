import { useCallback, memo, useState } from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'

interface SoftKeyboardProps {
  onKeyPress: (key: string) => void
  onBackspace: () => void
  onSpace: () => void
  onSubmit: () => void
  visible: boolean
  onClose?: () => void
}

const ALPHA_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]

const NUM_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['-', '/', ':', ';', '(', ')', '&', '@', '"'],
  ['.', ',', '?', '!', "'"],
]

const KeyButton = memo(({ label, onPress, style, flex }: {
  label: string
  onPress: () => void
  style?: any
  flex?: number
}) => {
  const theme = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.key,
        { backgroundColor: pressed ? theme['c-primary-background-active'] : theme['c-primary-input-background'] },
        style,
        flex ? { flex } : undefined,
      ]}
    >
      <Text style={styles.keyText} size={label.length > 1 ? 11 : 16}>{label}</Text>
    </Pressable>
  )
})

export default ({ onKeyPress, onBackspace, onSpace, onSubmit, visible, onClose }: SoftKeyboardProps) => {
  const theme = useTheme()
  const [isNumMode, setIsNumMode] = useState(false)

  const handleKeyPress = useCallback((key: string) => {
    onKeyPress(key)
  }, [onKeyPress])

  const handleBackspace = useCallback(() => {
    onBackspace()
  }, [onBackspace])

  const handleSpace = useCallback(() => {
    onSpace()
  }, [onSpace])

  const handleSubmit = useCallback(() => {
    onSubmit()
  }, [onSubmit])

  const toggleNumMode = useCallback(() => {
    setIsNumMode((prev: boolean) => !prev)
  }, [])

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  if (!visible) return null

  const rows = isNumMode ? NUM_ROWS : ALPHA_ROWS

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 20, elevation: 20 }]}>
      <Pressable style={styles.overlay} onPress={handleClose} />
      <View style={[styles.container, { backgroundColor: theme['c-primary-light-1000'] }]}>
      {rows.map((row, rowIndex) => (
        <View key={isNumMode ? `num-${rowIndex}` : `alpha-${rowIndex}`} style={styles.row}>
          {rowIndex === 2 && (
            <KeyButton
              label={isNumMode ? 'ABC' : '⇧'}
              onPress={isNumMode ? toggleNumMode : () => {}}
              style={styles.specialKey}
            />
          )}
          {row.map(key => (
            <KeyButton
              key={key}
              label={key}
              onPress={() => handleKeyPress(key)}
            />
          ))}
          {rowIndex === 2 && (
            <KeyButton
              label="⌫"
              onPress={handleBackspace}
              style={styles.specialKey}
            />
          )}
        </View>
      ))}
      <View style={styles.row}>
        <KeyButton
          label={isNumMode ? 'ABC' : '123'}
          onPress={toggleNumMode}
          style={styles.specialKey}
        />
        <KeyButton
          label="Space"
          onPress={handleSpace}
          style={styles.spaceKey}
          flex={5}
        />
        <KeyButton
          label="↵"
          onPress={handleSubmit}
          style={styles.submitKey}
        />
      </View>
      </View>
    </View>
  )
}

const styles = createStyle({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 2,
    paddingBottom: 4,
    paddingHorizontal: 4,
    zIndex: 20,
    elevation: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  key: {
    height: 36,
    marginHorizontal: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  keyText: {
    fontWeight: '500' as any,
  },
  specialKey: {
    flex: 1.3,
  },
  spaceKey: {
    flex: 5,
  },
  submitKey: {
    flex: 1.5,
  },
})
