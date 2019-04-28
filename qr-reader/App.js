import React from 'react';
import { Alert, Dimensions, LayoutAnimation, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarCodeScanner, Permissions } from 'expo';

export default class App extends React.Component {
  state = {
    hasCamera: null,
    lastURL: null,
  };

  componentDidMount() {
    this._requestCamera();
  }

  _requestCamera = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCamera: status === 'granted',
    });
  };

  _handleBarCodeRead = result => {
    if (result.data !== this.state.lastURL) {
      LayoutAnimation.spring();
      this.setState({ lastURL: result.data });
    }
  };

  render() {
    return (
      <View style={styles.container}>

        {this.state.hasCamera === null
          ? <Text>Requesting for camera permission</Text>
          : this.state.hasCamera === false
            ? <Text style={{ color: '#fff' }}>
              Camera permission is not granted
                </Text>
            : <BarCodeScanner
              onBarCodeRead={this._handleBarCodeRead}
              style={{
                height: Dimensions.get('window').height,
                width: Dimensions.get('window').width,
              }}
            />
        }
        {this._maybeRenderUrl()}

        <StatusBar hidden />
      </View>
    );
  }

  _handlePressUrl = () => {
    Alert.alert(
      'Open this URL?',
      this.state.lastURL,
      [
        {
          text: 'Yes',
          onPress: () => Linking.openURL(this.state.lastURL),
        },
        { text: 'No', onPress: () => { } },
      ],
      { cancellable: false }
    );
  };

  _handlePressCancel = () => {
    this.setState({ lastURL: null });
  };

  _maybeRenderUrl = () => {
    if (!this.state.lastURL) {
      return;
    }

    return (
      <View style={styles.bottomBar}>
          <ScrollView
            horizontal={true}
            keyboardShouldPersistTaps='always'>
        <TouchableOpacity activeOpacity={1} style={styles.url} onPress={this._handlePressUrl}>
            <Text numberOfLines={1} style={styles.urlText}>
              {this.state.lastURL}
            </Text>
            </TouchableOpacity>
          </ScrollView>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={this._handlePressCancel}>
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    flexDirection: 'row',
  },
  url: {
    flex: 1,
  },
  urlText: {
    color: '#fff',
    fontSize: 20,
  },
  cancelButton: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
  },
});
