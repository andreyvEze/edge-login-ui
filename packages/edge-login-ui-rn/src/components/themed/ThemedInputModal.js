// @flow

import * as React from 'react'
import { type AirshipBridge } from 'react-native-airship'

import { type ThemeProps, withTheme } from '../services/ThemeContext.js'
import { EdgeTextField } from './EdgeTextField.js'
import { ModalCloseArrow, ModalMessage, ModalTitle } from './ModalParts.js'
import { PrimaryButton } from './ThemedButtons.js'
import { ThemedModal } from './ThemedModal.js'

type OwnProps<T> = {
  bridge: AirshipBridge<T | void>,
  buttonLabel: string,
  inputLabel: string,
  message: string,
  isInputPassword?: boolean,
  onSubmit(inputText: string): Promise<T>,
  title: string
}

type State = {
  input: string,
  error?: string,
  spinning: boolean
}

type Props<T> = OwnProps<T> & ThemeProps

class ThemedInputModalComponent<T> extends React.PureComponent<
  Props<T>,
  State
> {
  constructor(props: Props<T>) {
    super(props)
    this.state = {
      input: '',
      spinning: false
    }
  }

  handleInputChange = (input: string) => {
    this.setState({ input })
  }

  handleSubmit = () => {
    const { onSubmit, bridge } = this.props
    this.setState({ error: undefined, spinning: true })

    onSubmit(this.state.input)
      .then(bridge.resolve)
      .catch(error => {
        this.setState({ error: error.message, spinning: false })
      })
  }

  render() {
    const {
      bridge,
      buttonLabel,
      inputLabel,
      message,
      isInputPassword,
      title
    } = this.props
    const { error, input, spinning } = this.state
    const close = () => bridge.resolve()
    return (
      <ThemedModal bridge={bridge} onCancel={close}>
        <ModalTitle>{title}</ModalTitle>
        <ModalMessage>{message.trim()}</ModalMessage>
        <EdgeTextField
          autoFocus
          error={error}
          label={inputLabel}
          marginRem={0.5}
          onChangeText={this.handleInputChange}
          onSubmitEditing={this.handleSubmit}
          value={input}
          returnKeyType="go"
          secureTextEntry={isInputPassword}
        />
        {spinning ? (
          <PrimaryButton spinning />
        ) : (
          <PrimaryButton
            label={buttonLabel}
            onPress={this.handleSubmit}
            marginRem={0.5}
          />
        )}
        <ModalCloseArrow />
      </ThemedModal>
    )
  }
}

export const ThemedInputModal = withTheme(ThemedInputModalComponent)
