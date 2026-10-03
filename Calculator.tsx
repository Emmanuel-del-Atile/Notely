import {Text,
   View,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
    SafeAreaView
    } from "react-native";
import * as ScreenOrientation from 'expo-screen-orientation';
import { useState } from "react";
import { useDeviceOrientation } from "@react-native-community/hooks";

import { NativeStackScreenProps } from "@react-navigation/native-stack"; 
type Props = NativeStackScreenProps<any>;

function keyPads({navigation}:Props) {

  const { width, height } = useWindowDimensions();

const isLandscape = width > height;

const horizontalPadding = 40;
const buttonMargin = 4;
const numberOfButtons = 4;
const numberOfRows = 5;

// Width available for buttons in landscape
const availableWidth = width - (horizontalPadding * 2);

// Width available for each button after margins
const widthLimit =
  (availableWidth - (buttonMargin * 2 * numberOfButtons))
  / numberOfButtons;

// Height available for buttons
// We reserve some space for the monitor and spacing.
const monitorSpace = height * 0.12 + 20;

const availableHeight =
  height - monitorSpace;

// Height available for each button after margins
const heightLimit =
  (availableHeight - (buttonMargin * 2 * numberOfRows))
  / numberOfRows;

// The smaller limit wins
const buttonSize =
  Math.min(widthLimit, heightLimit)* 0.75;

    const handleDecimal = () => {
  // Split the display by any operator to find the current "in-progress" number
  const parts = display.split(/[+−×÷]/);
  const currentNumber = parts[parts.length - 1]; // the last chunk being typed

  // Only add a dot if this specific number doesn't already have one
  if (!currentNumber.includes(".")) {
    setDisplay(display + ".");
  }
} 
 
  const handlePress =() =>{

    // =========================
    // 1. PARSER
    // =========================

    const numbers = [];
    const operators = [];
    let tempStore = "";

    for (let i = 0; i < display.length; i++) {

        if (
            display[i] === "+" ||
            display[i] === "−" ||
            display[i] === "×" ||
            display[i] === "÷"
        ) {
            numbers.push(tempStore);
            operators.push(display[i]);
            tempStore = "";

        } else {
            tempStore += display[i];
        }
    }

    // Add the final number
    numbers.push(tempStore);


    // =========================
    // 2. FIRST PASS
    //    × and ÷
    // =========================

    let i = 0;

    while (i < operators.length) {

        let result;

        if (
            operators[i] === "×" ||
            operators[i] === "÷"
        ) {

            if (operators[i] === "×") {

                result =
                    Number(numbers[i]) *
                    Number(numbers[i + 1]);

            } else {

                result =
                    Number(numbers[i]) /
                    Number(numbers[i + 1]);
            }

            // Replace the two numbers
            // with the result
            numbers.splice(i, 2, result.toString());

            // Remove the handled operator
            operators.splice(i, 1);

            // DON'T increase i
            // The next operator has moved into i

        } else {

            // Skip + and − for now
            i++;
        }
    }

   i = 0;

    while (i < operators.length) {

        let result;

        if (operators[i] === "+") {

            result =
                Number(numbers[i]) +
                Number(numbers[i + 1]);

        } else {

            result =
                Number(numbers[i]) -
                Number(numbers[i + 1]);
        }

        numbers.splice(i, 2, result.toString());
        operators.splice(i, 1);
    }

    // 4. FINAL ANSWER
    setDisplay(String(numbers[0]));
    
  };


const [display, setDisplay] = useState("");


  // Action that changes orientation when the button is tapped
  const handleRotate = async () => {
    const currentOrientation = await ScreenOrientation.getOrientationAsync();
    const isCurrentlyPortrait =
      currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
      currentOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN;

    if (isCurrentlyPortrait) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  };

  return(
      <SafeAreaView style ={[styles.keypadContainer, isLandscape && { paddingVertical: 4, paddingHorizontal: 40 }]}>

       <Monitor display={display}/>

        <View style = {[styles.row, isLandscape && { marginBottom: 0 }]}>
          <TouchableOpacity style ={[styles.clear,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay("")}>
            <Text style ={styles.clearText}>Clr</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.operator,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "%")}>
            <Text style ={styles.operatorText}>%</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.clear,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display.slice(0,-1))}
          onLongPress={() =>setDisplay("")}
          delayLongPress={800}>
            <Text style ={styles.clearText}>⌫</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.operator,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "÷")}>
            <Text style ={styles.operatorText}>÷</Text>
          </TouchableOpacity>
        </View>
        

        <View style = {[styles.row, isLandscape && { marginBottom: 0 }]}>
          <TouchableOpacity style ={[styles.num,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "1")}>
            <Text style ={styles.text}>1</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.num,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "2")}>
            <Text style ={styles.text}>2</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.num,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "3")}>
            <Text style ={styles.text}>3</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.operator,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "×")}>
            <Text style ={styles.operatorText}>×</Text>
          </TouchableOpacity>
        </View>
        

        <View style = {[styles.row, isLandscape && { marginBottom: 0 }]}>
          <TouchableOpacity style ={[styles.num,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "4")}>
            <Text style ={styles.text}>4</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.num,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "5")}>
            <Text  style ={styles.text}>5</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.num,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "6")}>
            <Text style ={styles.text}>6</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.operator,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display +"−")}>
            <Text style ={styles.operatorText}>−</Text>
          </TouchableOpacity>
        </View>

        <View style = {[styles.row, isLandscape && { marginBottom: 0 }]}>
          <TouchableOpacity style ={[styles.num,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "7")}>
            <Text style ={styles.text}>7</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.num,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "8")}>
            <Text style ={styles.text}>8</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.num,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "9")}>
            <Text style ={styles.text}>9</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.operator,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display +"+")}>
            <Text style ={styles.operatorText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style = {[styles.row, isLandscape && { marginBottom: 0 }]}>
          <TouchableOpacity style ={[styles.operator,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={handleRotate}
         >
            <Text style ={styles.operatorText}>↻</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.num,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={() => setDisplay(display + "0")}>
            <Text style ={styles.text}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.operator,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
          onPress ={handleDecimal}
          >
            <Text style ={styles.operatorText}>•</Text>
          </TouchableOpacity>

          <TouchableOpacity style ={[styles.operator,
              isLandscape && {
               flex: 0,
               aspectRatio: undefined,
                width: buttonSize,
               height: buttonSize,
       }
          ]}
            onPress={handlePress}>
            <Text style ={styles.operatorText}>=</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
  )

}

function Monitor({display}:{display:string | number}) {

  const {width, height} = useWindowDimensions();
  const isLandscape = width > height;
  const monitorHeight = height * 0.12;
  return(
    <View style ={[styles.monitor, {minHeight: monitorHeight }]}>
      <Text style ={styles.displayText}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={1}
      >{display}</Text>
    </View>
  )
}


export default keyPads


const styles = StyleSheet.create({
  keypadContainer:{
    flex: 1,
    width: "100%",
    justifyContent:"flex-end",
    paddingHorizontal: 12,
    paddingVertical: 20,
    margin:4,

  },
  row:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems:"center",

  },
  num:{
    flex: 1,
    aspectRatio: 1,
    backgroundColor:"#aba8a8",
    margin:4,
    borderRadius:999,
    justifyContent:"center",
    alignItems:"center"
  },
  text:{
    fontSize: 22,
    fontFamily:"arial",
    fontWeight: "600",
    color: "#000",
    textAlign:"center"
  },
  monitor:{
    width: "100%",
    backgroundColor:"#aba8a8",
    marginBottom: 20,
    borderRadius:8,
    justifyContent:"center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  displayText:{
    width: "100%",
    fontSize: 40,
    fontFamily:"arial",
    fontWeight: "600",
    color: "#000",
    textAlign:"right",
  },
  operator:{
    flex: 1,
    aspectRatio: 1,
    margin:4,
    borderRadius:999,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#aba8a8",
  },
  operatorText:{
    color:"#0b03f8",
    fontWeight: "800",
    fontSize: 25,
    textAlign:"center"

  },
  clear:{
    flex: 1,
    aspectRatio: 1,
    margin:4,
    borderRadius:999,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#aba8a8",
  },
    clearText:{
    borderRadius:999,
    justifyContent:"center",
    alignItems:"center",
    color:"#f80303",
    fontWeight: "600",
    fontSize: 25,
  },
})