import React from 'react';
import { StyleSheet, Text, View, TextInput, Switch, TouchableOpacity } from 'react-native';
import { Gyroscope, Accelerometer } from 'expo'
import * as firebase from 'firebase'
import '@firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyBJlx15HT6M3PlWv0eQ8dTqR5ZvY5tCbaA",
    authDomain: "tensor-game.firebaseapp.com",
    databaseURL: "https://tensor-game.firebaseio.com",
    projectId: "tensor-game",
    storageBucket: "tensor-game.appspot.com",
    messagingSenderId: "910108549363"
}  // apiKey, authDomain, etc. (see above)





// dbh.collection("characters").doc("mario").set({
//     employment: "plumber",
//     outfitColor: "red",
//     specialAttack: "fireball"
// })

export default class App extends React.Component {

  constructor() {
      super();
    this.state = {
      label: "",
        gyroData: [],
        accData:[],
        useLabel: false,
        recording: false,
        currAcc: null,
        currGyro: null,
        db: null
    }

    firebase.initializeApp(firebaseConfig)

  }



  componentWillMount(){
      Accelerometer.addListener(this.accUpdate.bind(this))
      Gyroscope.addListener(this.gyroUpdate.bind(this))
      Gyroscope.setUpdateInterval(10)
      Accelerometer.setUpdateInterval(10)

      this.setState({db:firebase.firestore()})
  }

    gyroUpdate(data){
        this.setState(state => ({
        currGyro: {
            x: data.x,
            y: data.y,
            z: data.z
        },
        ...(state.recording ?
            {
                gyroData: [...state.gyroData, {
                timestamp: Date.now(),
                data: [data.x, data.y, data.z],
                label: state.useLabel ? state.label : ''}]
            } : {} )}), () => {
                if (this.state.gyroData.length > 1000) {
                    if (this.state.recording){
                    this.state.db.collection("sensors").doc('gyro').update({
                            data: firebase.firestore.FieldValue.arrayUnion(...this.state.gyroData)
                        }
                    )
                    this.setState({gyroData:[]})
                    }
                }
        }
        )
    }

  accUpdate(data){
    this.setState(state => ({
        currAcc: {

        x: data.x,
        y: data.y,
        z: data.z
    },
        ...(state.recording ?
            {
                accData: [...state.accData, {
                    timestamp: Date.now(),
                    data: [data.x, data.y, data.z],
                    label: state.useLabel ? state.label : ''}]
            } : {} )}), () => {
        if (this.state.accData.length > 1000) {
            if (this.state.recording){
                this.state.db.collection("sensors").doc('accelerometer').update({
                    data: firebase.firestore.FieldValue.arrayUnion(...this.state.accData)
                })
                this.setState({accData:[]})
            }
        }
    })
  }

  render() {

    return (
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          <Text style={styles.text}>Gesture Label</Text>
            <TextInput
                style={styles.input}
                onChangeText={(label) => this.setState({label})}
                value={this.state.label}
            />
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.text}>Use Label</Text>
          <Switch value={this.state.useLabel} onValueChange={() => this.setState({useLabel: !this.state.useLabel})}/>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.text}>Record</Text>
          <Switch value={this.state.recording} onValueChange={() => this.setState({recording: !this.state.recording, accData:[], gyroData:[]})}/>
        </View>
        <View style={styles.rowColContainer}>
          <Text style={[styles.text]}>Current Gyro Values {this.state.gyroData.length}</Text>
            {
                this.state.currGyro ? <Text style={styles.values}>{`[${this.state.currGyro.x}, ${this.state.currGyro.y}, ${this.state.currGyro.z}] `}</Text> : null
            }
        </View>
        <View style={styles.rowColContainer}>
          <Text style={[styles.text]}>Current Accelerometer Values  {this.state.accData.length}</Text>
            {
                this.state.currAcc ? <Text style={styles.values}>{`[${this.state.currAcc.x}, ${this.state.currAcc.y}, ${this.state.currAcc.z}] `}</Text> : null
            }

        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
    rowContainer:{
      flexDirection:'row',
        margin:10,
        justifyContent:'space-between'
    },
    rowColContainer: {
        margin:10,
        alignItems:'center'
    },
    text: {
      fontSize: 25,
        margin:10
    },
    values: {
        fontSize: 10,
        color:'red'
    },
    input: {
      flex:1,
        fontSize: 25,
        margin:10
    }
});
