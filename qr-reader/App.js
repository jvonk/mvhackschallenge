import React from 'react';
import { Button, Dimensions, Linking, ListView, StatusBar, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { BarCodeScanner, Permissions } from 'expo';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import Swipeout from 'react-native-swipeout';

var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class HomeScreen extends React.Component {
  state = {
    url: 'NONE',
    dataSource: ds,
    hasCamera: null,
    _data: new Array(),
  };
  deleteData = (rowData) => {
    let val = this.state._data.indexOf(rowData);
    if (val<=0)return;
    this.state._data.splice(val-1, 1);
    this.setState({ dataSource: this.state.dataSource.cloneWithRows(this.state._data) });
  }
  
  renderRow = (rowData, rowID) => {
    let swipeBtns = [{
      text: 'Delete',
      backgroundColor: 'red',
      underlayColor: 'rgba(0, 0, 0, 0.6)',
      onPress: this.deleteData.bind(this, rowData)
    }];
    const uri = rowData;
    return (
      <Swipeout
        right={swipeBtns}
        underlayColor='rgba(192,192,192,0.6)'
        autoClose={true}>
        <TouchableHighlight
          key={rowID}
          onPress={() => Linking.openURL(rowData)}
          underlayColor='rgba(192,192,192,0.6)'>
          <View style={styles.rowContainer}>
            <Text style={styles.note}> {rowData} </Text>
          </View>
        </TouchableHighlight>
      </Swipeout>
    )
  }

  componentDidMount() {
    if (this.state.url.data && !this.state._data.includes(this.state.url.data)) {
      this.state._data.push(this.state.url.data);
      this.setState({ dataSource: this.state.dataSource.cloneWithRows(this.state._data) });
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    const { navigation } = this.props;
    this.state.url = navigation.getParam('url', this.state.url);
    if (navigation.getParam('hasCamera', this.state.hasCamera)) {
      this.state.hasCamera= true;
    }
    if (this.state.url.data && !this.state._data.includes(this.state.url.data)) {
      this.state._data.push(this.state.url.data);
      this.setState({ dataSource: this.state.dataSource.cloneWithRows(this.state._data) });
    }
    return (
      <View style={styles.container}>
        <Button
          title="Go to Camera"
          onPress={() => navigate('Camera', {hasCamera: this.state.hasCamera})}
        />
        <ListView
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={this.renderRow}/>
        <StatusBar hidden />
      </View>
    );
  }
}

class CameraScreen extends React.Component {
  state = {
    hasCamera: null,
  };

  componentDidMount() {
    const { navigation } = this.props;
    if (navigation.getParam('hasCamera', this.state.hasCamera)) this.setState({ hasCamera: true });
    else this._requestCamera();
  }

  _requestCamera = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCamera: status === 'granted',
    });
  };

  _handleBarCodeRead = result => {
    const { navigate } = this.props.navigation;
    navigate('Home', { url: result, hasCamera: this.state.hasCamera });
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
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  rowContainer: {
    padding: 10,
  },
  note: {
    flex: 2,
    fontSize: 22,
    padding: 15,
    color: "#000",
  },
});


const MainNavigator = createStackNavigator({
  Home: { screen: HomeScreen },
  Camera: { screen: CameraScreen },
});

const App = createAppContainer(MainNavigator);

export default App;