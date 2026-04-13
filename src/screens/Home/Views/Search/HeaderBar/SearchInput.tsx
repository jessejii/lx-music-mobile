import { useCallback, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { Keyboard, TouchableOpacity, View } from 'react-native'
import Input, { type InputType, type InputProps } from '@/components/common/Input'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'

export interface SearchInputProps {
  onChangeText: (text: string) => void
  onSubmit: (text: string) => void
  onBlur: () => void
  onTouchStart: () => void
  onToggleKeyboard?: () => void
  showKeyboard?: boolean
}

export interface SearchInputType {
  setText: (text: string) => void
  // getText: () => string
  focus: () => void
  blur: () => void
}

export default forwardRef<SearchInputType, SearchInputProps>(({ onChangeText, onSubmit, onBlur, onTouchStart, onToggleKeyboard, showKeyboard }, ref) => {
  const theme = useTheme()
  const [text, setText] = useState('')
  const inputRef = useRef<InputType>(null)

  useImperativeHandle(ref, () => ({
    // getText() {
    //   return text.trim()
    // },
    setText(text) {
      setText(text)
    },
    focus() {
      inputRef.current?.focus()
    },
    blur() {
      inputRef.current?.blur()
    },
  }))

  const handleChangeText = (text: string) => {
    setText(text)
    onChangeText(text.trim())
  }

  const handleClearText = useCallback(() => {
    setText('')
    onChangeText('')
    onSubmit('')
  }, [onChangeText, onSubmit])

  const handleSubmit = useCallback<NonNullable<InputProps['onSubmitEditing']>>(({ nativeEvent: { text } }) => {
    onSubmit(text)
  }, [onSubmit])

  const handleFocus = useCallback(() => {
    if (showKeyboard) {
      Keyboard.dismiss()
    }
  }, [showKeyboard])

  return (
    <View style={{ flexDirection: 'row', flexGrow: 1, flexShrink: 1, alignItems: 'center' }}>
      <Input
        ref={inputRef}
        placeholder="Search for something..."
        value={text}
        onChangeText={handleChangeText}
        // style={{ ...styles.input, backgroundColor: theme['c-primary-input-background'] }}
        onBlur={onBlur}
        onSubmitEditing={handleSubmit}
        onClearText={handleClearText}
        onTouchStart={onTouchStart}
        onFocus={handleFocus}
        showSoftInputOnFocus={!showKeyboard}
        clearBtn
      />
      {onToggleKeyboard ? (
        <TouchableOpacity
          style={{
            paddingLeft: 5,
            paddingRight: 5,
            justifyContent: 'center',
            height: 32,
            borderRadius: 4,
            backgroundColor: showKeyboard ? theme['c-primary-background-active'] : theme['c-primary-input-background'],
          }}
          onPress={onToggleKeyboard}
        >
          <Text size={11} color={showKeyboard ? theme['c-primary-font-active'] : theme['c-primary-dark-100-alpha-500']}>⌨</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
})
