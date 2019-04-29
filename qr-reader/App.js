import React from 'react';
import { Alert, Button, Dimensions, LayoutAnimation, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarCodeScanner, Permissions } from 'expo';
import { createStackNavigator, createAppContainer } from 'react-navigation';


class HomeScreen extends React.Component {
  state = {
    url: 'NONE',
  };
  render() {
    const { navigation } = this.props;
    const { navigate } = this.props.navigation;
    this.state.url = navigation.getParam('url', this.state.url);
    return (
      <View style={styles.container}>
        <Button
          title="Go to Camera"
          onPress={() => navigate('Camera')}
        />
        {this.state.url=='NONE'
        ?<View></View>
        :
        <View style={styles.bottomBar}>
          <ScrollView
            horizontal={true}
            keyboardShouldPersistTaps='always'>
            <TouchableOpacity activeOpacity={1} style={styles.url} onPress={this._handlePressUrl}>
              <Text numberOfLines={1} style={styles.urlText}>
                {this.state.url.data}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        }
        <StatusBar hidden />
      </View>
    );
  }

  _handlePressUrl = () => {
    Alert.alert(
      'Open this URL?',
      this.state.url.data,
      [
        {
          text: 'Yes',
          onPress: () => Linking.openURL(this.state.url.data),
        },
        { text: 'No', onPress: () => { } },
      ],
      { cancellable: false }
    );
  };

  _handlePressCancel = () => {
    this.setState({ lastURL: null });
  };
}

class CameraScreen extends React.Component {
  state = {
    hasCamera: null,
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
    const { navigate } = this.props.navigation;
    navigate('Home', { url: result });
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
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
});


const MainNavigator = createStackNavigator({
  Home: { screen: HomeScreen },
  Camera: { screen: CameraScreen },
});

const App = createAppContainer(MainNavigator);

export default App;