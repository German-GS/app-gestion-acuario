// hooks/useAuth.js
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // <-- AÑADIMOS ESTADO DE CARGA

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false); // <-- DEJA DE CARGAR CUANDO TENEMOS UNA RESPUESTA
    });

    return () => unsubscribe();
  }, []);

  return { user, isLoading }; // <-- DEVOLVEMOS EL ESTADO DE CARGA
}