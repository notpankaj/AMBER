import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
// STORE
export const toLocalStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // saving error
    return e;
  }
};

// GET
export const fromLocalStorage = async (key) => {
  try {
    const res = await AsyncStorage.getItem(key);
    return JSON.parse(res);
  } catch (e) {
    return e;
  }
};
// REMOVE
export const deleteFromLocalStorage = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    return e;
  }
};

// -------------------
export const generateNameAvatar = (name = "--") => {
  const firstWord = name[0];
  const lastWord = name[name.length - 1];
  let fullWord = `${firstWord}${lastWord}`;
  fullWord = fullWord.toUpperCase();
  return fullWord;
};

export const getAgeByDob = (dob) => {
  const year = new Date().getFullYear() - new Date(dob).getFullYear();
  return year;
};

export const convertHMS = (value) => {
  const sec = parseInt(value, 10); // convert value to number if it's string
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
  let seconds = sec - hours * 3600 - minutes * 60; //  get seconds
  // add 0 if value < 10; Example: 2 => 02
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds; // Return is HH : MM : SS
};

export const bodFormat = (dob, seprator = "/") => {
  if (!dob) return null;
  const date = new Date(dob);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${year}${seprator}${String(month)?.padStart(2, 0)}${seprator}${String(
    day
  )?.padStart(2, 0)}`;
};

export const formatAMPM = (date) => {
  if (!date) return "";
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
};

export function isToday(givenDate) {
  const currentDate = new Date();
  const given = new Date(givenDate);

  const cY = currentDate.getFullYear();
  const cM = currentDate.getMonth() + 1;
  const cD = currentDate.getDate();

  const gY = given.getFullYear();
  const gM = given.getMonth() + 1;
  const gD = given.getDate();

  let cFinal = `${cY}-${cM}-${cD}`;
  let gFinal = `${gY}-${gM}-${gD}`;

  console.log({ cFinal, gFinal });
  if (cFinal === gFinal) {
    return true;
  } else {
    return false;
  }
}

export function fromNowFormat(givenDate) {
  const res = moment(new Date(givenDate)).fromNow();
  return res;
}

export const willAddDateMarker = (prex, curx) => {
  if (prex && curx) {
    const pre = new Date(prex);
    const cur = new Date(curx);

    const pY = pre.getFullYear();
    const pM = pre.getMonth() + 1;
    const pD = pre.getDate();

    const cY = cur.getFullYear();
    const cM = cur.getMonth() + 1;
    const cD = cur.getDate();

    let pFinal = `${pY}-${pM}-${pD}`;
    let cFinal = `${cY}-${cM}-${cD}`;

    if (pFinal !== cFinal) {
      return cFinal;
    } else {
      return "";
    }
  } else {
    return "";
  }
};

export const formNowDateMarker = (someDate) => {
  const data = moment(someDate, "YYYYMMDD")?.calendar()?.split(" ")[0];
  if (data === "Yesterday") {
    return "Yesterday";
  }
  if (data === "Today") {
    return "Today";
  }
  return someDate;
};
