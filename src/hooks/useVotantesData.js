import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { observeAuthState } from '../authService';

export const useVotantesData = () => {
  const [votantes, setVotantes] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    const unsubV = onValue(ref(database, 'votantes'), snap => {
      const d = snap.val();
      setVotantes(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []);
    });
    const unsubL = onValue(ref(database, 'lideres'), snap => {
      const d = snap.val();
      setLideres(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []);
    });
    return () => { unsubV(); unsubL(); };
  }, []);

  useEffect(() => {
    const unsubAuth = observeAuthState((user) => {
      setFirebaseUser(user);
    });
    return () => unsubAuth();
  }, []);

  return { votantes, lideres, firebaseUser };
};
