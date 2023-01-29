import { initializeApp } from "firebase/app";
import { firestore } from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBXtNf-rupi7DheKW_s_gqdwAKTQ1ygPLE",
  authDomain: "khq-vue-tutorial.firebaseapp.com",
  projectId: "khq-vue-tutorial",
  storageBucket: "khq-vue-tutorial.appspot.com",
  messagingSenderId: "793965647816",
  appId: "1:793965647816:web:2c9edded419cdb44de12fd"
}

// init firebase
initializeApp(firebaseConfig)

// init firestore service
const storage = firestore()
export default storage