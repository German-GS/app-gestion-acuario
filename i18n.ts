// i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Intento simple de detectar idioma (opcional)
let deviceLanguage: "es" | "en" = "es"; // por defecto español
try {
  const locale =
    (Intl as any)?.DateTimeFormat?.().resolvedOptions().locale ?? "en";
  deviceLanguage = locale.startsWith("es") ? "es" : "en";
} catch {
  deviceLanguage = "es";
}

const resources = {
  es: {
    translation: {
      // ----- Perfil -----
      profile: {
        title: "Mi Perfil",
        username: "Nombre de usuario",
        email: "Correo electrónico",
        save: "Guardar Cambios",
        logout: "Cerrar sesión",
        language: "Idioma de la aplicación",
        spanish: "Español",
        english: "Inglés",
        updated: "¡Éxito! Tu nombre ha sido actualizado.",
        updateError: "No se pudo actualizar tu nombre.",
        logoutError: "No se pudo cerrar la sesión.",
      },

      "recommendations": {
        "kh": {
          "high": "Reduce la dosificación de KH. Un KH muy alto puede causar quemaduras en las puntas de los corales, especialmente SPS. Ajusta lentamente y revisa el consumo diario.",
          "low": "Añade un buffer de KH para elevar la alcalinidad de forma gradual. Evita subidas mayores a 1 dKH por día."
        },
        "ca": {
          "high": "Reduce la dosificación de calcio. Niveles muy altos pueden provocar precipitación de carbonatos y desbalance con el magnesio.",
          "low": "Añade suplemento de calcio y verifica que el KH y el magnesio estén dentro del rango correcto para evitar desbalances."
        },
        "mg": {
          "high": "Suspende temporalmente los suplementos de magnesio y realiza cambios parciales de agua para estabilizar el nivel.",
          "low": "Añade suplemento de magnesio. Un nivel adecuado de Mg ayuda a mantener estable el KH y el calcio."
        },
        "no3": {
          "high": "Realiza cambios de agua, reduce la alimentación, limpia el skimmer y considera el uso de resinas o reactores anti-nitratos. Revisa también la carga biológica.",
          "low": "Niveles de NO₃ extremadamente bajos pueden favorecer dinoflagelados y pérdida de color en corales. Aumenta ligeramente la alimentación o dosifica nitratos de forma controlada."
        },
        "po4": {
          "high": "Reduce la comida, sifonea el sustrato, realiza cambios de agua y utiliza resinas o reactores específicos para fosfatos. Verifica que el agua RODI esté en 0 TDS.",
          "low": "Mantener los fosfatos en cero absoluto puede generar problemas en corales y favorecer dinoflagelados. Intenta mantener un nivel mínimo detectable (por ejemplo 0.01–0.05 ppm)."
        },
        "ph": {
          "high": "Un pH demasiado alto suele estar relacionado con exceso de aireación o dosificación de productos como Kalkwasser. Reduce dosis y monitorea el valor durante el día.",
          "low": "Mejora la ventilación del ambiente, aumenta el movimiento de superficie y considera el uso de línea de aire exterior para el skimmer o un scrubber de CO₂."
        },
        "salinity": {
          "high": "Reduce la salinidad retirando agua del acuario y reemplazando con agua RODI. Hazlo de forma gradual (no más de 1 ppt por día).",
          "low": "Aumenta la salinidad añadiendo agua salada preparada. Verifica que tu sistema de auto rellenado no esté agregando demasiada agua dulce."
        },
        "temp": {
          "high": "Temperaturas altas reducen el oxígeno disponible y estresan peces e invertebrados. Usa enfriadores, ventiladores, evita fuentes de calor externas y revisa la iluminación.",
          "low": "Aumenta la temperatura de forma gradual con un calentador confiable. Evita cambios bruscos que puedan estresar a los habitantes."
        },
        "ammonia": {
          "high": "El amonio es altamente tóxico. Realiza cambios de agua de emergencia, aumenta la oxigenación, añade bacterias beneficiosas y suspende la alimentación hasta estabilizar.",
          "low": "El amonio debe mantenerse siempre en 0 en un sistema estable. Si se detecta, revisa filtración biológica y carga de peces."
        },
        "nitrite": {
          "high": "Los nitritos son muy tóxicos para los peces. Realiza cambios de agua inmediatos, añade bacterias y reduce la alimentación. Evita introducir nuevos peces mientras haya nitritos.",
          "low": "En sistemas maduros, los nitritos deben permanecer en 0. Si se detectan, indica problemas en el ciclo del nitrógeno."
        },
        "k": {
          "high": "Reduce o suspende la dosificación de potasio. Niveles muy altos pueden causar estrés y quemaduras en tejidos de corales.",
          "low": "Añade potasio de forma controlada. Un buen nivel de K favorece la coloración y salud de muchos corales, especialmente SPS."
        },
        "strontium": {
          "high": "Suspende la dosificación de estroncio y realiza cambios parciales de agua. Niveles excesivos pueden afectar negativamente a corales e invertebrados.",
          "low": "Añade estroncio siguiendo las recomendaciones del fabricante. Es importante para el crecimiento de corales duros y esqueletos calcáreos."
        },
        "iodine": {
          "high": "Detén la dosificación de yodo. Un exceso puede ser tóxico para invertebrados y corales blandos.",
          "low": "Añade yodo con mucha precaución y en dosis pequeñas. Es importante para mudas de crustáceos y salud de corales blandos."
        },
        "oxygen": {
          "high": "Un nivel alto de oxígeno suele ser positivo, pero revisa que no haya exceso de microburbujas dañinas para los tejidos.",
          "low": "Mejora la aireación y el movimiento en superficie. Revisa temperatura, densidad de peces y funcionamiento del skimmer o filtros."
        },

        /* Agua dulce */

        "gh": {
          "high": "Un GH alto puede afectar a peces sensibles como discos o tetras. Mezcla agua de osmosis inversa con el agua del grifo para reducir la dureza general.",
          "low": "Añade sales minerales específicas para acuarios de agua dulce hasta alcanzar el rango ideal para tus peces y plantas."
        },
        "freshwater_kh": {
          "high": "Un KH alto eleva el pH y casi siempre lo vuelve muy estable. Si necesitas bajarlo, reduce elementos calcáreos y mezcla con agua de osmosis.",
          "low": "Añade un buffer de KH para evitar caídas bruscas de pH. Un KH estable da seguridad a peces y bacterias.",
        },
        "freshwater_ph": {
          "high": "Evita piedras y decoraciones calcáreas, aumenta el uso de troncos y hojas secas (como almendro indio) para ayudar a bajar el pH de forma natural.",
          "low": "Incrementa ligeramente el KH y mejora la aireación. Evita exceso de materia orgánica en descomposición que pueda acidificar demasiado el agua."
        },
        "nitrite_fw": {
          "high": "Los nitritos son muy tóxicos. Realiza cambios de agua grandes, añade bacterias beneficiosas y reduce drásticamente la alimentación.",
          "low": "En un acuario maduro, el nitrito debe permanecer en 0. Cualquier lectura indica problemas con el ciclo del nitrógeno."
        },
        "nitrate_fw": {
          "high": "Los nitratos altos favorecen algas y estrés en peces. Realiza cambios de agua, reduce la alimentación y considera incorporar más plantas naturales.",
          "low": "Niveles muy bajos de nitrato pueden significar falta de nutrientes para las plantas. Ajusta la fertilización si tienes acuario plantado."
        },
        "phosphate_fw": {
          "high": "Fosfatos elevados promueven un crecimiento excesivo de algas. Reduce la comida, sifonea el sustrato y utiliza resinas anti-fosfatos si es necesario.",
          "low": "Un fosfato demasiado bajo puede limitar el crecimiento de plantas en acuarios muy plantados. Ajusta la fertilización en función de las necesidades."
        },
        "co2": {
          "high": "Un CO₂ muy alto puede ser letal para los peces. Apaga el sistema de CO₂, aumenta la aireación y verifica el drop checker.",
          "low": "CO₂ bajo limita el crecimiento de plantas. Mejora la difusión de CO₂, revisa el flujo y ajusta el número de burbujas."
        },
        "iron": {
          "high": "Un exceso de hierro puede favorecer algas no deseadas. Reduce la dosis de fertilizante líquido y monitorea los valores.",
          "low": "Añade suplemento de hierro para mejorar el color y crecimiento de plantas rojas y de alto requerimiento."
        },
        "potassium_fw": {
          "high": "Demasiado potasio puede causar agujeros o necrosis en hojas. Reduce la fertilización de potasio hasta estabilizar.",
          "low": "Añade potasio, uno de los macronutrientes básicos para el correcto crecimiento de las plantas acuáticas."
        },
        "ammonia_fw": {
          "high": "El amonio es extremadamente tóxico. Realiza cambios de agua urgentes, añade bacterias, revisa filtración y reduce la alimentación.",
          "low": "En condiciones normales, el amonio debe ser 0. Si sube, revisa sobrepoblación y mantenimiento del filtro."
        },
        "tds": {
          "high": "Un TDS alto indica muchas sales disueltas. Usa agua de osmosis y realiza cambios de agua para ajustar al rango adecuado para tus peces.",
          "low": "Un TDS demasiado bajo puede afectar la estabilidad osmótica. Añade minerales de forma controlada hasta alcanzar el rango objetivo.",
        },
        "dissolved_oxygen": {
          "high": "Un buen nivel de oxígeno es positivo para peces y bacterias. Solo revisa que no haya exceso de corrientes que estresen a los peces.",
          "low": "Mejora la aireación, aumenta el movimiento de superficie y revisa la temperatura, ya que el agua caliente disuelve menos oxígeno."
        },
        "temp_fw": {
          "high": "La temperatura alta acelera el metabolismo y reduce el oxígeno. Refresca el agua gradualmente y evita cambios bruscos.",
          "low": "Incrementa la temperatura con un calentador fiable. Ajusta poco a poco hasta llegar al rango recomendado para tu especie."
        }
      },


      // ----- Tabs -----
      tabs: {
        myAquariums: "Mis Acuarios",
        explore: "Explorar",
      },

      // ----- Home / Mis Acuarios -----
      home: {
        emptyTitle: "Bienvenido a AquaMind",
        emptySubtitle:
          'Toca el botón "+" para añadir tu primer acuario y empezar a monitorear la salud de tu ecosistema acuático.',
        dashboardTitle: "Mis Acuarios",
        totalVolume: "Volumen total",
        marineCount: "Marinos",
        freshwaterCount: "Agua dulce",
        status: {
          noParams: "Registra un parámetro para ver el estado",
          undefinedRanges: "Rangos no definidos para este tipo de acuario",
          low: "bajo",
          high: "alto",
          stable: "Parámetros estables",
          alertPrefix: "Alerta: Alerta",
        },
        deleteConfirmTitle: "Confirmar Borrado",
        deleteConfirmMessage:
          '¿Estás seguro de que quieres eliminar "{{name}}"?',
        deleteErrorTitle: "Error",
        deleteErrorMessage: "No se pudo eliminar el acuario.",
      },

      // ----- Explore -----
      explore: {
        title: "Explorar Guías",
        loading: "Cargando artículos...",
      },

      // ----- Textos comunes -----
      common: {
      cancel: "Cancelar",
      delete: "Eliminar",
      success: "¡Éxito!",
      error: "Error",
      save: "Guardar",
    },

      // ----- Errores genéricos -----
      errors: {
        databaseConnection:
          "Ocurrió un problema al conectar con la base de datos.",
        uploadImage: "No se pudo subir la imagen.",
      },

      // ----- Auth -----
      auth: {
        invalidSession: "Sesión no válida. Intenta iniciar sesión de nuevo.",
      },

      // ----- Unidades -----
      units: {
        liters: "litros",
        gallons: "galones",
      },

      //------ Modals parametros, recordatorio y notas----

      maintenanceModal: {
        title: "Registrar Mantenimiento",
        eventTypeLabel: "Tipo de Evento",
        waterChangeVolumeLabel: "Volumen del Cambio",
        volumePlaceholder: "Ej: 20",
        waterChangeNotesLabel: "Notas Adicionales (Opcional)",
        notesLabel: "Notas / Descripción",
        notesPlaceholder: "Describe el evento...",
        requiredValueTitle: "Valor Requerido",
        requiredValueMessage: "Por favor, introduce un volumen válido.",
        requiredNotesTitle: "Notas Requeridas",
        requiredNotesMessage:
          "Por favor, introduce una nota o descripción.",
      },

      parameterModal: {
        title: "Añadir Nueva Lectura",
        parameterLabel: "Parámetro",
        valueLabel: "Valor",
        valuePlaceholder: "Introduce el valor medido",
        errorInvalidNumber: "Introduce un valor numérico válido.",
      },
      

      // ----- Pantalla de Acuario / Parámetros / Mantenimiento -----
      aquarium: {
        details: "Detalles",

        paramNames: {
          kh: "Alkalinity (KH)",
          ca: "Calcium (Ca)",
          mg: "Magnesium (Mg)",
          no3: "Nitrate (NO₃)",
          po4: "Phosphate (PO₄)",
          salinity: "Salinity",
          temp: "Temperature",
          ph: "pH",
          gh: "General Hardness (GH)",
          ammonia: "Ammonia",
          nitrite: "Nitrite",
          nitrate: "Nitrate",
          iron: "Iron (Fe)",
          co2: "CO₂",
          tds: "TDS",
        },

        range: {
          "7d": "7d",
          "1m": "1m",
          "4m": "4m",
          "6m": "6m",
          "1y": "1a",
          all: "Todo",
        },

        photo: {
          addPhoto: "Añadir Foto",
          permissionTitle: "Permiso requerido",
          permissionMessage:
            "Necesitas dar permiso para acceder a tus fotos.",
          uploadSuccess: "La foto del acuario ha sido actualizada.",
        },

        parameters: {
          title: "Parámetros",
          noData: "No hay datos registrados. Añade una lectura.",
          recentReadings: "Lecturas recientes",

          saveErrorSession:
            "No se pudo guardar el dato. Por favor, reinicia la sesión.",
          saveSuccess: "El parámetro {{name}} ha sido guardado.",

          deleteReadingTitle: "Eliminar lectura",
          deleteReadingMessage:
            "¿Deseas eliminar la lectura de {{date}}?",
          deleteError: "No se pudo eliminar la lectura.",
        },

        //------Recordatorios--------
        notifications: {
          permissionDeniedTitle: "Permiso denegado",
          permissionDeniedMessage:
            "No se pueden recibir notificaciones sin permiso.",
          physicalDeviceTitle: "Dispositivo requerido",
          physicalDeviceMessage:
            "Debes usar un dispositivo físico para las notificaciones.",
        },

        maintenance: {
          logTitle: "Bitácora de Mantenimiento",
          saveErrorSession:
            "No se pudo guardar el registro. Por favor, reinicia la sesión.",
          saveSuccess: "El registro ha sido guardado.",

          waterChange: "Cambio de Agua: {{volume}} {{units}}",
          notesLabel: "Notas:",
          noLogs: "No hay registros de mantenimiento.",

          smartNoteNitrate: "Puede reducir NO₃ en ~{{value}} ppm.",
          smartNotePhosphate: "Puede reducir PO₄ en ~{{value}} ppm.",
          rodiNote: "Recuerda usar agua de RODI a 0 TDS.",
          types: {
            water_change: "Cambio de Agua",
            dosing: "Dosificación",
            cleaning: "Limpieza",
            equipment: "Mantenimiento Equipo",
            observation: "Observación",
          },
        },

        "reminders": {
          "types": {
            "dosing": "Dosificación"
          },
          "doseNameLabel": "Producto / Suplemento",
          "doseNamePlaceholder": "Ej: Hierro, All for Reef",
          "doseAmountLabel": "Cantidad",
          "doseAmountPlaceholder": "Ej: 2, 20",
          "doseUnitLabel": "Unidad",
          "doseUnits": {
            "ml": "ml",
            "drops": "Gotas",
            "spoon": "Cucharadita"
          },
          "doseNameRequiredTitle": "Nombre requerido",
          "doseNameRequiredMessage": "Por favor, indica el suplemento o producto a dosificar.",
          "doseAmountRequiredTitle": "Cantidad inválida",
          "doseAmountRequiredMessage": "Introduce una cantidad numérica válida para la dosificación.",
          "frequency": {
            "once": "Nunca",
            "daily": "Diariamente",
            "weekly": "Semanalmente",
            "monthly": "Mensualmente"
          }
        },
      },
    },
  },

  en: {
    translation: {
      // ----- Profile -----
      profile: {
        title: "My Profile",
        username: "Username",
        email: "Email",
        save: "Save Changes",
        logout: "Log out",
        language: "App language",
        spanish: "Spanish",
        english: "English",
        updated: "Success! Your name has been updated.",
        updateError: "Could not update your name.",
        logoutError: "Could not log out.",
      },

      "recommendations": {
        "kh": {
          "high": "Reduce KH dosing. Very high alkalinity can burn coral tips, especially SPS. Adjust slowly and track daily consumption.",
          "low": "Add a KH buffer to increase alkalinity gradually. Avoid raising more than 1 dKH per day."
        },
        "ca": {
          "high": "Reduce calcium dosing. Very high levels can cause carbonate precipitation and imbalance with magnesium.",
          "low": "Add a calcium supplement and check that KH and magnesium are within the correct range to avoid imbalances."
        },
        "mg": {
          "high": "Temporarily stop magnesium supplements and perform partial water changes to stabilize the level.",
          "low": "Add a magnesium supplement. Proper Mg levels help keep KH and calcium stable."
        },
        "no3": {
          "high": "Do water changes, reduce feeding, clean the skimmer and consider using nitrate-removal media or reactors. Also review stocking levels.",
          "low": "Extremely low NO₃ can favor dinoflagellates and cause poor coral coloration. Slightly increase feeding or dose nitrates in a controlled way."
        },
        "po4": {
          "high": "Reduce feeding, siphon the substrate, perform water changes and use phosphate-removal resins or reactors. Make sure your RODI water reads 0 TDS.",
          "low": "Keeping phosphate at absolute zero can harm corals and favor dinoflagellates. Aim for a small but detectable level (e.g. 0.01–0.05 ppm)."
        },
        "ph": {
          "high": "Very high pH is often related to strong aeration or dosing products such as Kalkwasser. Reduce dosing and monitor the value throughout the day.",
          "low": "Improve room ventilation, increase surface agitation and consider using an outside air line for the skimmer or a CO₂ scrubber."
        },
        "salinity": {
          "high": "Lower salinity by removing tank water and replacing it with RODI water. Do it gradually (no more than 1 ppt per day).",
          "low": "Increase salinity by adding prepared saltwater. Check that your auto top-off is not adding too much freshwater."
        },
        "temp": {
          "high": "High temperature reduces oxygen and stresses fish and invertebrates. Use chillers or fans, avoid external heat sources and review lighting.",
          "low": "Increase temperature gradually with a reliable heater. Avoid sudden swings that can stress the livestock."
        },
        "ammonia": {
          "high": "Ammonia is highly toxic. Perform emergency water changes, increase aeration, add beneficial bacteria and stop feeding until levels stabilize.",
          "low": "Ammonia should remain at 0 in a stable system. If detected, check biological filtration and fish load."
        },
        "nitrite": {
          "high": "Nitrite is very toxic to fish. Perform immediate water changes, add beneficial bacteria and reduce feeding. Avoid adding new fish while nitrite is present.",
          "low": "In mature systems, nitrite should be 0. Any reading indicates a problem in the nitrogen cycle."
        },
        "k": {
          "high": "Reduce or stop potassium dosing. Very high levels can stress corals and burn tissues.",
          "low": "Add potassium carefully. Proper K levels support coloration and health in many corals, especially SPS."
        },
        "strontium": {
          "high": "Stop strontium dosing and perform partial water changes. Excess Sr can negatively affect corals and invertebrates.",
          "low": "Add strontium following the manufacturer's instructions. It is important for growth of hard corals and calcareous skeletons."
        },
        "iodine": {
          "high": "Stop iodine dosing. Excess iodine can be toxic for invertebrates and soft corals.",
          "low": "Add iodine very carefully in small doses. It is important for shrimp molting and soft coral health."
        },
        "oxygen": {
          "high": "High oxygen levels are usually positive but check that there are no harmful microbubbles irritating coral tissue.",
          "low": "Improve aeration and surface agitation. Check temperature, fish stocking and skimmer or filter performance."
        },

        /* Freshwater */

        "gh": {
          "high": "High GH can be stressful for sensitive species like discus or small tetras. Mix tap water with RO water to reduce general hardness.",
          "low": "Add freshwater mineral salts until you reach the ideal range for your fish and plants."
        },
        "freshwater_kh": {
          "high": "High KH raises pH and makes it very stable. If you need to lower it, reduce calcareous decorations and mix with RO water.",
          "low": "Add a KH buffer to avoid sudden pH drops. A stable KH is very important for fish and bacteria.",
        },
        "freshwater_ph": {
          "high": "Avoid calcareous rocks and decorations, increase the use of driftwood and botanicals (like Indian almond leaves) to naturally lower pH.",
          "low": "Slightly increase KH and improve aeration. Avoid excess decaying organic matter that can push pH too low."
        },
        "nitrite_fw": {
          "high": "Nitrite is highly toxic. Perform large water changes, add beneficial bacteria and drastically reduce feeding.",
          "low": "In a mature aquarium nitrite should stay at 0. Any reading points to issues with the nitrogen cycle."
        },
        "nitrate_fw": {
          "high": "High nitrate promotes algae and stresses fish. Do water changes, reduce feeding and consider adding more live plants.",
          "low": "Very low nitrate can mean lack of nutrients for plants. Adjust fertilization if you keep a planted tank."
        },
        "phosphate_fw": {
          "high": "Elevated phosphate leads to algae blooms. Reduce food, siphon the substrate and use phosphate-removal resins if needed.",
          "low": "Extremely low phosphate can limit plant growth in heavily planted aquariums. Adjust fertilization accordingly."
        },
        "co2": {
          "high": "Very high CO₂ can be lethal to fish. Turn off the CO₂ system, increase aeration and check your drop checker.",
          "low": "Low CO₂ limits plant growth. Improve CO₂ diffusion, review flow and adjust bubble rate."
        },
        "iron": {
          "high": "Excess iron can fuel unwanted algae. Reduce liquid fertilizer dosage and monitor levels.",
          "low": "Add an iron supplement to improve color and growth in red and high-demand plants."
        },
        "potassium_fw": {
          "high": "Too much potassium can cause holes or necrosis in leaves. Reduce potassium fertilization until things stabilize.",
          "low": "Add potassium, one of the primary macronutrients needed for healthy aquatic plant growth."
        },
        "ammonia_fw": {
          "high": "Ammonia is extremely toxic. Perform emergency water changes, add bacteria, check filtration and reduce feeding.",
          "low": "Under normal conditions ammonia should be 0. If it rises, review stocking levels and filter maintenance."
        },
        "tds": {
          "high": "High TDS indicates many dissolved solids. Use RO water and perform water changes to reach the appropriate range for your species.",
          "low": "Very low TDS can affect osmotic stability. Add minerals carefully until you reach your target range.",
        },
        "dissolved_oxygen": {
          "high": "Good oxygen levels are beneficial for fish and bacteria. Just make sure currents are not too strong for your fish.",
          "low": "Increase aeration, boost surface agitation and check temperature, since warm water holds less oxygen."
        },
        "temp_fw": {
          "high": "High temperature speeds metabolism and reduces oxygen. Cool the water gradually and avoid sudden temperature shocks.",
          "low": "Increase temperature with a reliable heater. Adjust slowly until you reach the recommended range for your species."
        }
      },


      // ----- Tabs -----
      tabs: {
        myAquariums: "My Aquariums",
        explore: "Explore",
      },

      // ----- Home / My Aquariums -----
      home: {
        emptyTitle: "Welcome to AquaMind",
        emptySubtitle:
          'Tap the "+" button to add your first aquarium and start monitoring your aquatic ecosystem.',
        dashboardTitle: "My Aquariums",
        totalVolume: "Total volume",
        marineCount: "Marine",
        freshwaterCount: "Freshwater",
        status: {
          noParams: "Log a parameter to see the status",
          undefinedRanges: "Ranges not defined for this aquarium type",
          low: "low",
          high: "high",
          stable: "Stable parameters",
          alertPrefix: "Alert: Alert",
        },
        deleteConfirmTitle: "Confirm Deletion",
        deleteConfirmMessage:
          'Are you sure you want to delete "{{name}}"?',
        deleteErrorTitle: "Error",
        deleteErrorMessage: "Could not delete the aquarium.",
      },

      // ----- Explore -----
      explore: {
        title: "Explore Guides",
        loading: "Loading articles...",
      },

      // ----- Common texts -----
      common: {
        cancel: "Cancel",
        delete: "Delete",
        success: "Success",
        error: "Error",
        save: "Save",
      },

      //-----Modals---------

      maintenanceModal: {
        title: "Log maintenance",
        eventTypeLabel: "Event type",
        waterChangeVolumeLabel: "Water change volume",
        volumePlaceholder: "e.g. 20",
        waterChangeNotesLabel: "Additional notes (optional)",
        notesLabel: "Notes / Description",
        notesPlaceholder: "Describe the event...",
        requiredValueTitle: "Value required",
        requiredValueMessage: "Please enter a valid volume.",
        requiredNotesTitle: "Notes required",
        requiredNotesMessage:
          "Please enter a note or description.",
      },

      parameterModal: {
        title: "Add new reading",
        parameterLabel: "Parameter",
        valueLabel: "Value",
        valuePlaceholder: "Enter the measured value",
        errorInvalidNumber: "Please enter a valid numeric value.",
      },

      // ----- Generic errors -----
      errors: {
        databaseConnection:
          "There was a problem connecting to the database.",
        uploadImage: "The image could not be uploaded.",
      },

      // ----- Auth -----
      auth: {
        invalidSession: "Invalid session. Please log in again.",
      },

      // ----- Units -----
      units: {
        liters: "liters",
        gallons: "gallons",
      },

      // ----- Aquarium / Parameters / Maintenance screen -----
      aquarium: {
        details: "Details",

        paramNames: {
          kh: "Alcalinidad (KH)",
          ca: "Calcio (Ca)",
          mg: "Magnesio (Mg)",
          no3: "Nitrato (NO₃)",
          po4: "Fosfato (PO₄)",
          salinity: "Salinidad",
          temp: "Temperatura",
          ph: "pH",
          gh: "Dureza General (GH)",
          ammonia: "Amonio",
          nitrite: "Nitrito",
          nitrate: "Nitrato",
          iron: "Hierro (Fe)",
          co2: "CO₂",
          tds: "TDS",
        },

        range: {
          "7d": "7d",
          "1m": "1m",
          "4m": "4m",
          "6m": "6m",
          "1y": "1y",
          all: "All",
        },

        photo: {
          addPhoto: "Add Photo",
          permissionTitle: "Permission required",
          permissionMessage:
            "You need to grant permission to access your photos.",
          uploadSuccess: "The aquarium photo has been updated.",
        },

        parameters: {
          title: "Parameters",
          noData: "No data recorded yet. Add a reading.",
          recentReadings: "Recent readings",

          saveErrorSession:
            "The value could not be saved. Please restart your session.",
          saveSuccess: "The {{name}} parameter has been saved.",

          deleteReadingTitle: "Delete reading",
          deleteReadingMessage:
            "Do you want to delete the reading from {{date}}?",
          deleteError: "The reading could not be deleted.",
        },
        //---------Notifications--------
        notifications: {
          permissionDeniedTitle: "Permission denied",
          permissionDeniedMessage:
            "Notifications cannot be received without permission.",
          physicalDeviceTitle: "Device required",
          physicalDeviceMessage:
            "You must use a physical device to receive notifications.",
        },

        maintenance: {
          logTitle: "Maintenance Log",
          saveErrorSession:
            "The entry could not be saved. Please restart your session.",
          saveSuccess: "The entry has been saved.",

          waterChange: "Water Change: {{volume}} {{units}}",
          notesLabel: "Notes:",
          noLogs: "There are no maintenance records.",

          smartNoteNitrate: "It can reduce NO₃ by ~{{value}} ppm.",
          smartNotePhosphate: "It can reduce PO₄ by ~{{value}} ppm.",
          rodiNote: "Remember to use RODI water at 0 TDS.",

          types: {
            water_change: "Water change",
            dosing: "Dosing",
            cleaning: "Cleaning",
            equipment: "Equipment maintenance",
            observation: "Observation",
          },
        },

        reminders: {
          manageButton: "Manage Reminders",
          modalTitle: "New Reminder",
          taskLabel: "Task",
          dateTimeLabel: "Date & Time",
          repeatLabel: "Repeat",
          invalidDateTitle: "Invalid date",
          invalidDateMessage:
            "You can't schedule a reminder in the past.",
          headerTitle: "Reminders for {{name}}",
          nextLabel: "Next:",
          emptyText: "No reminders yet. Add the first one!",
          unnamedAquarium: "your aquarium",
          notificationTitle: "Reminder for {{name}}",
        
          types: {
            water_change: "Water change",
            cleaning: "General cleaning",
            parameter_test: "Parameter test",
            icp_test: "Send ICP test",
            other: "Other task",
          },
          frequency: {
            once: "Never",
            daily: "Daily",
            weekly: "Weekly",
            monthly: "Monthly",
          },
        },
      },
    },
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage, // idioma inicial (luego el usuario lo cambia en Perfil)
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
