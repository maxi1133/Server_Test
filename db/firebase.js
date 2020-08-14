const firebaseConfig = {
  apiKey: "AIzaSyAU1_zDLux1jFyXaiq1K-Iiska6JjwFEZI",
  authDomain: "testdack-2a4db.firebaseapp.com",
  databaseURL: "https://testdack-2a4db.firebaseio.com",
  projectId: "testdack-2a4db",
  storageBucket: "testdack-2a4db.appspot.com",
  messagingSenderId: "174069519637",
  appId: "1:174069519637:web:a08fa0d17b73f47270451c",
  measurementId: "G-HJ13F3QESP"
};



const firebase = require('firebase')
firebase.initializeApp(firebaseConfig)
 



// firebase Admin
const fbAdmin = require("firebase-admin");
var serviceAccount = require("./serviceAccount.json");

fbAdmin.initializeApp({
  credential: fbAdmin.credential.cert(serviceAccount),
  databaseURL: "https://testdack-2a4db.firebaseio.com",
  storageBucket:firebaseConfig.storageBucket
});







module.exports = {
    fbAdmin : fbAdmin,
    firebase : firebase
};
