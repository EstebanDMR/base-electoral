import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyACbhnT4AmukbRlRopBylUtDrNwGFivdCY",
  authDomain: "db-elecciones.firebaseapp.com",
  databaseURL: "https://db-elecciones-default-rtdb.firebaseio.com",
  projectId: "db-elecciones",
  storageBucket: "db-elecciones.firebasestorage.app",
  messagingSenderId: "290500592153",
  appId: "1:290500592153:web:c0382f5a920fdda0b9a088"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { app, database, auth };
