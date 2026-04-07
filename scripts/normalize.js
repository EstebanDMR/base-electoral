/**
 * Script de Normalización - Base Electoral
 * 
 * Instrucciones:
 * 1. Instalar dependencias: npm install firebase-admin
 * 2. Descargar la clave privada de tu cuenta de servicio de Firebase (serviceAccountKey.json)
 *    y colocarla en la raíz del proyecto.
 * 3. Actualizar FIREBASE_DATABASE_URL con la URL de tu base de datos Realtime.
 * 4. Ejecutar: node scripts/normalize.js
 */

const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json"); // Asegúrate de tener este archivo
const { normalizeText } = require("../src/utils/text.js"); // Suponiendo soporte local o transpilar

// Alternativa de normalizeText si ejecutas en node plano:
const normalize = (text) => text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://TU_DATABASE_URL.firebaseio.com" // <- Reemplazar
});

const db = admin.database();

async function migrate() {
  console.log("Iniciando migración de datos...");
  try {
    const usuariosRef = db.ref('usuarios');
    const snapshot = await usuariosRef.get();
    
    if (!snapshot.exists()) {
      console.log("No hay usuarios en la base de datos.");
      return;
    }

    const tenantData = snapshot.val();
    const actualizaciones = {};
    let contador = 0;

    for (const tenantId in tenantData) {
      if (tenantData[tenantId].votantes) {
        const votantes = tenantData[tenantId].votantes;
        for (const votanteId in votantes) {
          const v = votantes[votanteId];
          if (!v.nombre_normalizado && v.nombreCompleto) {
            actualizaciones[`usuarios/${tenantId}/votantes/${votanteId}/nombre_normalizado`] = normalize(v.nombreCompleto);
            contador++;
          }
        }
      }
    }

    if (Object.keys(actualizaciones).length > 0) {
      console.log(`Normalizando ${contador} registros...`);
      await db.ref().update(actualizaciones);
      console.log("Migración completada con éxito.");
    } else {
      console.log("Todos los registros ya estaban normalizados.");
    }
  } catch (error) {
    console.error("Error en migración:", error);
  } finally {
    process.exit(0);
  }
}

migrate();
