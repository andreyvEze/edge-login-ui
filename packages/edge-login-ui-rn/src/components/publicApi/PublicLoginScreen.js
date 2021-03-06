// @flow

import { type EdgeAccountOptions, type EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { initializeLogin } from '../../actions/LoginInitActions.js'
import { updateFontStyles } from '../../constants/Fonts.js'
import { type OnLogin } from '../../types/ReduxTypes.js'
import { Router } from '../navigation/Router.js'
import { Airship, showError } from '../services/AirshipInstance.js'
import { ReduxStore } from '../services/ReduxStore.js'
import { changeFont } from '../services/ThemeContext.js'

type Props = {
  context: EdgeContext,

  // Branding stuff:
  appId?: string,
  appName?: string,
  backgroundImage?: any,
  fontDescription?: { regularFontFamily: string },
  landingScreenText?: string,
  parentButton?: Object,
  primaryLogo?: any,
  primaryLogoCallback?: () => void,

  // Options passed to the core login methods:
  accountOptions: EdgeAccountOptions,

  // Called when the login completes:
  onLogin: OnLogin,

  // The recoveryKey from the user's email, to trigger recovery login:
  recoveryLogin?: string,

  // Do not show the security alerts screen during login,
  // since the app plans to show the `SecurityAlertsScreen` itself
  // based on `hasSecurityAlerts` and `watchSecurityAlerts`:
  skipSecurityAlerts?: boolean,

  // The username to select, if present on the device:
  username?: string
}

export class LoginScreen extends React.Component<Props> {
  cleanups: Array<() => mixed>

  constructor(props: Props) {
    super(props)

    const { fontDescription = {} } = this.props
    const { regularFontFamily } = fontDescription
    changeFont(regularFontFamily)
    updateFontStyles(regularFontFamily)

    this.cleanups = []
  }

  componentDidMount() {
    // Completed Edge login:
    this.cleanups = [
      this.props.context.on('login', account => {
        Airship.clear()
        this.props.onLogin(account)
      }),
      this.props.context.on('loginStart', ({ username }) => {
        // Show spinner for Edge login starting
      }),
      this.props.context.on('loginError', ({ error }) => showError(error))
    ]
  }

  componentWillUnmount() {
    for (const cleanup of this.cleanups) cleanup()
  }

  render() {
    return (
      <ReduxStore
        imports={{
          accountOptions: this.props.accountOptions,
          context: this.props.context,
          onComplete: () => {},
          onLogin: this.props.onLogin,
          recoveryKey: this.props.recoveryLogin,
          skipSecurityAlerts: this.props.skipSecurityAlerts,
          username: this.props.username
        }}
        initialAction={initializeLogin()}
      >
        <Router
          branding={{
            appId: this.props.appId,
            appName: this.props.appName,
            backgroundImage: this.props.backgroundImage,
            landingScreenText: this.props.landingScreenText,
            parentButton: this.props.parentButton,
            primaryLogo: this.props.primaryLogo,
            primaryLogoCallback: this.props.primaryLogoCallback
          }}
          showHeader
        />
      </ReduxStore>
    )
  }
}
