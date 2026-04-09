// Marcos fisiopatológicos con 10 patologías cada uno
// Cada patología incluye variables que la IA puede modificar para crear casos únicos

export const PATHOLOGY_FRAMEWORKS = {
  "dolor_hombro": {
    name: "Dolor de Hombro",
    pathologies: [
      {
        name: "Tendinopatía del supraespinoso",
        ageRange: [30, 60],
        genderDistribution: { masculino: 55, femenino: 45 },
        occupations: ["trabajador de almacén", "pintor", "deportista", "mecánico", "profesor"],
        chiefComplaints: [
          "Dolor en el hombro al levantar el brazo",
          "Dolor nocturno en el hombro que no me deja dormir",
          "Dolor agudo al alcanzar objetos en altura",
          "Dolor en el hombro al vestirme o peinarme"
        ],
        onsetTypes: ["gradual tras sobrecarga", "agudo tras esfuerzo", "insidioso sin causa clara"],
        chronology: [2, 12], // semanas
        aggravatingFactors: ["abducción 60-120°", "elevación anterior", "actividades overhead", "apoyo nocturno"],
        relievingFactors: ["reposo", "brazo en cabestrillo", "calor local", "AINES"],
        physicalFindings: {
          palpation: "dolor en troquíter",
          rom: "limitación dolorosa abducción 60-120°",
          strength: "debilidad abducción y rotación externa",
          specialTests: "Jobe positivo, Hawkins-Kennedy positivo"
        }
      },
      {
        name: "Síndrome de pinzamiento subacromial",
        ageRange: [35, 65],
        genderDistribution: { masculino: 60, femenino: 40 },
        occupations: ["nadador", "pintor", "electricista", "trabajador overhead", "tenista"],
        chiefComplaints: [
          "Dolor en el hombro al levantar el brazo lateralmente",
          "Sensación de pellizco en el hombro con ciertos movimientos",
          "Dolor que aumenta progresivamente al trabajar con el brazo elevado",
          "Chasquido doloroso en el hombro"
        ],
        onsetTypes: ["gradual por movimientos repetitivos", "empeoramiento progresivo"],
        chronology: [4, 24],
        aggravatingFactors: ["abducción activa", "elevación anterior", "rotación interna", "movimientos overhead"],
        relievingFactors: ["reposo", "evitar elevación", "antiinflamatorios"],
        physicalFindings: {
          palpation: "dolor en espacio subacromial",
          rom: "arco doloroso 60-120° abducción",
          strength: "debilidad variable",
          specialTests: "Neer positivo, Hawkins-Kennedy positivo, arco doloroso"
        }
      },
      {
        name: "Capsulitis adhesiva (hombro congelado)",
        ageRange: [40, 65],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["diabético", "trabajador sedentario", "post-traumático", "enfermera"],
        chiefComplaints: [
          "No puedo mover el hombro, está rígido",
          "Dolor intenso y limitación severa del hombro",
          "Dolor nocturno insoportable en el hombro",
          "Pérdida progresiva de movilidad del hombro"
        ],
        onsetTypes: ["gradual sin causa aparente", "post-inmovilización", "asociado a diabetes"],
        chronology: [4, 52],
        aggravatingFactors: ["todos los movimientos", "especialmente rotación externa", "movilidad pasiva forzada"],
        relievingFactors: ["calor", "medicación", "evitar movimientos extremos"],
        physicalFindings: {
          palpation: "dolor difuso hombro",
          rom: "limitación severa activa y pasiva todas direcciones",
          strength: "difícil evaluar por dolor y rigidez",
          specialTests: "patrón capsular, rotación externa <10°"
        }
      },
      {
        name: "Tendinopatía del bíceps",
        ageRange: [25, 55],
        genderDistribution: { masculino: 70, femenino: 30 },
        occupations: ["levantador de pesas", "trabajador manual", "escalador", "crossfitter"],
        chiefComplaints: [
          "Dolor en la parte anterior del hombro",
          "Dolor al doblar el codo contra resistencia",
          "Sensación de chasquido en el hombro al moverlo",
          "Dolor en el hombro al cargar peso"
        ],
        onsetTypes: ["agudo tras esfuerzo intenso", "gradual por sobrecarga"],
        chronology: [1, 8],
        aggravatingFactors: ["flexión de codo contra resistencia", "supinación", "elevación anterior", "levantar peso"],
        relievingFactors: ["reposo", "hielo", "evitar flexión de codo"],
        physicalFindings: {
          palpation: "dolor corredera bicipital",
          rom: "normal o ligeramente doloroso",
          strength: "débil flexión codo y supinación",
          specialTests: "Speed test positivo, Yergason positivo"
        }
      },
      {
        name: "Rotura del manguito rotador",
        ageRange: [50, 75],
        genderDistribution: { masculino: 65, femenino: 35 },
        occupations: ["trabajador manual", "jubilado", "agricultor", "carpintero"],
        chiefComplaints: [
          "No puedo levantar el brazo, se me cae",
          "Escuché un chasquido y ahora no tengo fuerza en el hombro",
          "Dolor intenso y debilidad severa del hombro",
          "Imposibilidad para elevar el brazo lateralmente"
        ],
        onsetTypes: ["agudo traumático", "degenerativo progresivo"],
        chronology: [1, 104],
        aggravatingFactors: ["abducción", "rotación externa", "intentar elevar brazo"],
        relievingFactors: ["reposo absoluto", "brazo pegado al cuerpo"],
        physicalFindings: {
          palpation: "dolor difuso, posible deformidad",
          rom: "incapacidad abducción activa, pasiva preservada",
          strength: "debilidad severa o imposibilidad abducción",
          specialTests: "drop arm positivo, lag signs positivos, atrofia fosa infraespinosa"
        }
      },
      {
        name: "Inestabilidad glenohumeral anterior",
        ageRange: [18, 40],
        genderDistribution: { masculino: 75, femenino: 25 },
        occupations: ["deportista de contacto", "nadador", "jugador de balonmano", "voleibolista"],
        chiefComplaints: [
          "Siento que el hombro se me sale de sitio",
          "Sensación de inestabilidad al lanzar",
          "Miedo a ciertos movimientos del hombro",
          "El hombro se me ha salido varias veces"
        ],
        onsetTypes: ["post-luxación traumática", "microtraumatismos repetidos"],
        chronology: [4, 208],
        aggravatingFactors: ["abducción + rotación externa", "lanzamiento", "apoyo brazo extendido"],
        relievingFactors: ["evitar posiciones de riesgo", "fortalecimiento"],
        physicalFindings: {
          palpation: "normal o hipersensibilidad anterior",
          rom: "completo con aprensión",
          strength: "normal o ligeramente débil",
          specialTests: "apprehension test positivo, relocation test positivo, sulcus sign"
        }
      },
      {
        name: "Bursitis subacromial",
        ageRange: [30, 60],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["trabajador repetitivo overhead", "limpiador", "pintor", "deportista"],
        chiefComplaints: [
          "Dolor e hinchazón en la parte lateral del hombro",
          "Dolor punzante al levantar el brazo",
          "Dolor agudo que apareció tras movimientos repetitivos",
          "Sensibilidad intensa en el hombro"
        ],
        onsetTypes: ["agudo tras sobrecarga", "asociado a otras patologías"],
        chronology: [1, 6],
        aggravatingFactors: ["abducción media", "presión directa", "decúbito lateral sobre hombro"],
        relievingFactors: ["reposo", "hielo", "AINES"],
        physicalFindings: {
          palpation: "dolor intenso espacio subacromial, calor local",
          rom: "arco doloroso muy marcado",
          strength: "normal pero doloroso",
          specialTests: "arco doloroso positivo, Neer positivo"
        }
      },
      {
        name: "Lesión SLAP (labrum superior)",
        ageRange: [20, 45],
        genderDistribution: { masculino: 80, femenino: 20 },
        occupations: ["lanzador", "nadador", "trabajador overhead", "voleibolista"],
        chiefComplaints: [
          "Chasquido doloroso profundo en el hombro",
          "Sensación de enganche en el hombro al moverlo",
          "Dolor profundo difícil de localizar",
          "Sensación de hombro 'muerto' al lanzar"
        ],
        onsetTypes: ["traumático por caída sobre brazo extendido", "microtraumatismo repetido lanzamiento"],
        chronology: [2, 52],
        aggravatingFactors: ["elevación máxima", "lanzamiento", "llevar peso", "movimientos overhead"],
        relievingFactors: ["reposo", "evitar lanzamientos"],
        physicalFindings: {
          palpation: "dolor profundo difuso",
          rom: "posible chasquido al mover",
          strength: "variable",
          specialTests: "O'Brien test positivo, crank test positivo, Speed test posible positivo"
        }
      },
      {
        name: "Tendinopatía calcificante",
        ageRange: [30, 50],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["administrativo", "trabajador sedentario", "diabético", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor muy intenso de aparición súbita en el hombro",
          "Dolor insoportable que no responde a analgésicos",
          "Hombro extremadamente doloroso, no puedo ni tocarlo",
          "Dolor que me despertó de noche bruscamente"
        ],
        onsetTypes: ["agudo súbito (fase reabsortiva)", "crónico insidioso"],
        chronology: [1, 104],
        aggravatingFactors: ["todos los movimientos en fase aguda", "abducción", "presión directa"],
        relievingFactors: ["reposo absoluto", "hielo", "analgésicos potentes"],
        physicalFindings: {
          palpation: "dolor exquisito localizado",
          rom: "muy limitado por dolor en fase aguda",
          strength: "imposible evaluar por dolor",
          specialTests: "todos dolorosos en fase aguda"
        }
      },
      {
        name: "Síndrome del manguito posterior",
        ageRange: [25, 50],
        genderDistribution: { masculino: 60, femenino: 40 },
        occupations: ["deportista de raqueta", "nadador", "trabajador computadora", "lanzador"],
        chiefComplaints: [
          "Dolor en la parte posterior del hombro",
          "Debilidad al rotar el brazo hacia afuera",
          "Dolor al lanzar o en gestos de rotación",
          "Fatiga del hombro tras actividad repetitiva"
        ],
        onsetTypes: ["gradual por desequilibrio muscular", "sobrecarga repetitiva"],
        chronology: [4, 24],
        aggravatingFactors: ["rotación externa contra resistencia", "actividades repetitivas", "lanzamiento"],
        relievingFactors: ["reposo", "fortalecimiento", "corrección postural"],
        physicalFindings: {
          palpation: "dolor fosa infraespinosa y redondo menor",
          rom: "posible limitación rotación externa",
          strength: "debilidad rotación externa",
          specialTests: "test rotadores externos débil, posible winging escapular"
        }
      }
    ]
  },

  "dolor_lumbar": {
    name: "Dolor Lumbar",
    pathologies: [
      {
        name: "Lumbalgia mecánica inespecífica",
        ageRange: [25, 60],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["oficinista", "conductor", "trabajador sedentario", "teletrabajador"],
        chiefComplaints: [
          "Dolor en la parte baja de la espalda al estar sentado",
          "Rigidez lumbar que empeora con la inactividad",
          "Dolor difuso en la zona lumbar",
          "Molestia lumbar constante que aumenta al final del día"
        ],
        onsetTypes: ["gradual insidioso", "tras cambio de actividad laboral"],
        chronology: [4, 52],
        aggravatingFactors: ["sedestación prolongada", "bipedestación estática", "flexión anterior", "rotaciones"],
        relievingFactors: ["cambios posturales", "deambulación", "calor local", "estiramientos"],
        physicalFindings: {
          palpation: "tensión muscular paravertebral bilateral",
          rom: "limitación leve-moderada flexión lumbar",
          strength: "normal",
          specialTests: "Lasègue negativo, test neurológico normal"
        }
      },
      {
        name: "Hernia discal L5-S1",
        ageRange: [30, 55],
        genderDistribution: { masculino: 60, femenino: 40 },
        occupations: ["trabajador manual", "conductor profesional", "deportista", "cargador"],
        chiefComplaints: [
          "Dolor que baja por la pierna hasta el pie",
          "Ciática intensa con hormigueo en el pie",
          "Dolor lumbar que irradia por la parte posterior de la pierna",
          "Sensación de quemazón que baja por la pierna"
        ],
        onsetTypes: ["agudo tras esfuerzo", "gradual con empeoramiento progresivo"],
        chronology: [1, 24],
        aggravatingFactors: ["flexión anterior", "tos/estornudo", "Valsalva", "sedestación", "flexión lumbar"],
        relievingFactors: ["decúbito", "extensión lumbar", "deambulación pausada"],
        physicalFindings: {
          palpation: "contractura paravertebral",
          rom: "limitación severa flexión",
          strength: "debilidad flexión plantar y/o flexión dedo gordo",
          specialTests: "Lasègue positivo <45°, alteración reflejo aquíleo, hipoestesia L5-S1"
        }
      },
      {
        name: "Estenosis de canal lumbar",
        ageRange: [55, 80],
        genderDistribution: { masculino: 45, femenino: 55 },
        occupations: ["jubilado", "cualquier ocupación", "antecedente trabajos físicos"],
        chiefComplaints: [
          "Dolor en las piernas al caminar que mejora al sentarme",
          "No puedo caminar distancias largas sin parar",
          "Dolor y pesadez en ambas piernas al andar",
          "Necesito inclinarme hacia adelante o sentarme para aliviar el dolor"
        ],
        onsetTypes: ["gradual progresivo años"],
        chronology: [52, 520],
        aggravatingFactors: ["deambulación", "extensión lumbar", "bipedestación prolongada"],
        relievingFactors: ["sedestación", "flexión lumbar", "reposo", "inclinarse hacia adelante"],
        physicalFindings: {
          palpation: "tensión lumbar",
          rom: "limitación extensión lumbar",
          strength: "puede ser normal o debilidad bilateral leve",
          specialTests: "claudicación neurógena, test de la bicicleta positivo"
        }
      },
      {
        name: "Espondilolistesis degenerativa",
        ageRange: [45, 70],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["trabajador físico", "deportista antiguo", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor lumbar con irradiación a glúteos y piernas",
          "Sensación de inestabilidad en la espalda baja",
          "Dolor que aumenta con la extensión y al estar de pie",
          "Rigidez y dolor lumbar difuso"
        ],
        onsetTypes: ["gradual progresivo"],
        chronology: [24, 520],
        aggravatingFactors: ["extensión lumbar", "bipedestación", "deambulación prolongada"],
        relievingFactors: ["flexión lumbar", "sedestación", "reposo"],
        physicalFindings: {
          palpation: "escalón palpable entre vértebras",
          rom: "limitación extensión, flexión relativamente preservada",
          strength: "variable según compresión nerviosa",
          specialTests: "test de extensión positivo, posible déficit neurológico"
        }
      },
      {
        name: "Síndrome facetario lumbar",
        ageRange: [40, 70],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["trabajador físico", "deportista", "cualquier ocupación con flexo-extensión repetitiva"],
        chiefComplaints: [
          "Dolor lumbar que empeora con la extensión",
          "Dolor al levantarse de la silla o al estar de pie",
          "Dolor lumbar unilateral o bilateral paravertebral",
          "Rigidez matutina lumbar importante"
        ],
        onsetTypes: ["gradual", "tras sobrecarga mecánica"],
        chronology: [4, 104],
        aggravatingFactors: ["extensión lumbar", "rotación", "bipedestación prolongada", "levantarse"],
        relievingFactors: ["flexión lumbar leve", "sedestación", "reposo"],
        physicalFindings: {
          palpation: "dolor articulaciones facetarias",
          rom: "limitación extensión y rotación",
          strength: "normal",
          specialTests: "extensión + rotación reproduce dolor, Lasègue negativo"
        }
      },
      {
        name: "Espondilitis anquilosante (fase inicial)",
        ageRange: [20, 40],
        genderDistribution: { masculino: 75, femenino: 25 },
        occupations: ["cualquier ocupación", "inicio temprano vida laboral"],
        chiefComplaints: [
          "Dolor lumbar y rigidez que mejora con el ejercicio",
          "Rigidez matutina severa que dura más de 30 minutos",
          "Dolor nocturno que me despierta y mejora al levantarme",
          "Dolor lumbar inflamatorio que mejora con actividad"
        ],
        onsetTypes: ["gradual insidioso", "inicio antes 40 años"],
        chronology: [12, 520],
        aggravatingFactors: ["reposo prolongado", "inactividad", "noche"],
        relievingFactors: ["ejercicio", "movimiento", "AINES"],
        physicalFindings: {
          palpation: "dolor sacroilíacas bilateral",
          rom: "limitación global columna, especialmente extensión",
          strength: "normal",
          specialTests: "Schober disminuido, test sacroilíacas positivo, expansión torácica disminuida"
        }
      },
      {
        name: "Fractura vertebral por compresión",
        ageRange: [60, 85],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["osteoporosis", "jubilado", "caída previa", "corticoterapia prolongada"],
        chiefComplaints: [
          "Dolor lumbar muy intenso de aparición súbita",
          "No puedo levantarme del dolor después de una caída",
          "Dolor insoportable en la espalda tras levantar algo",
          "Dolor agudo localizado en la columna"
        ],
        onsetTypes: ["agudo traumático o espontáneo"],
        chronology: [0.1, 4],
        aggravatingFactors: ["cualquier movimiento", "tos", "presión directa", "incorporarse"],
        relievingFactors: ["reposo absoluto en decúbito", "analgésicos"],
        physicalFindings: {
          palpation: "dolor exquisito apófisis espinosa específica",
          rom: "imposible por dolor",
          strength: "imposible evaluar",
          specialTests: "red flags presentes, posible deformidad cifótica"
        }
      },
      {
        name: "Síndrome piramidal (pseudociática)",
        ageRange: [30, 60],
        genderDistribution: { masculino: 20, femenino: 80 },
        occupations: ["corredor", "ciclista", "oficinista", "conductor"],
        chiefComplaints: [
          "Dolor en el glúteo que baja por la parte posterior del muslo",
          "Dolor al estar sentado que irradia a la pierna",
          "Sensación de ciática pero localizada en el glúteo",
          "Dolor que empeora al cruzar las piernas o estar sentado"
        ],
        onsetTypes: ["gradual por sobrecarga", "tras actividad deportiva intensa"],
        chronology: [2, 24],
        aggravatingFactors: ["sedestación prolongada", "cruzar piernas", "flexión cadera + aducción", "subir escaleras"],
        relievingFactors: ["estiramientos", "cambios posturales", "deambulación"],
        physicalFindings: {
          palpation: "dolor profundo glúteo medio",
          rom: "dolor con rotación interna cadera + aducción",
          strength: "normal",
          specialTests: "Freiberg positivo, FAIR test positivo, Lasègue negativo"
        }
      },
      {
        name: "Disfunción sacroilíaca",
        ageRange: [25, 55],
        genderDistribution: { masculino: 40, femenino: 60 },
        occupations: ["embarazo reciente", "deportista", "trabajador físico", "traumatismo previo"],
        chiefComplaints: [
          "Dolor en la zona baja de la espalda, más hacia un lado",
          "Dolor al subir escaleras o caminar",
          "Dolor en el glúteo y región sacra",
          "Sensación de bloqueo o inestabilidad lumbar baja"
        ],
        onsetTypes: ["agudo tras movimiento brusco", "gradual post-embarazo", "post-traumático"],
        chronology: [1, 24],
        aggravatingFactors: ["apoyo unipodal", "subir escaleras", "pasar de sedente a bípedo", "rotaciones"],
        relievingFactors: ["reposo", "movilizaciones específicas", "faja"],
        physicalFindings: {
          palpation: "dolor articulación sacroilíaca unilateral",
          rom: "asimetría movilidad pélvica",
          strength: "normal",
          specialTests: "Gaenslen positivo, FABER positivo, test distracción/compresión positivo"
        }
      },
      {
        name: "Contractura aguda muscular lumbar",
        ageRange: [20, 60],
        genderDistribution: { masculino: 60, femenino: 40 },
        occupations: ["trabajador manual", "deportista", "mudanza", "jardinería"],
        chiefComplaints: [
          "Me quedé bloqueado al agacharme",
          "Dolor muy intenso y espasmo muscular en la espalda",
          "No puedo enderezarme del dolor",
          "Dolor agudo tras levantar peso"
        ],
        onsetTypes: ["agudo súbito tras esfuerzo"],
        chronology: [0.1, 2],
        aggravatingFactors: ["cualquier movimiento", "flexión", "rotación", "tos"],
        relievingFactors: ["reposo absoluto", "postura antiálgica", "calor", "relajantes musculares"],
        physicalFindings: {
          palpation: "contractura severa paravertebral, cordones musculares",
          rom: "limitación severa todos movimientos",
          strength: "imposible evaluar por dolor",
          specialTests: "Lasègue negativo, test neurológico normal"
        }
      }
    ]
  },

  "dolor_cervical": {
    name: "Dolor Cervical",
    pathologies: [
      {
        name: "Cervicalgia mecánica por tensión muscular",
        ageRange: [25, 55],
        genderDistribution: { masculino: 40, femenino: 60 },
        occupations: ["oficinista", "programador", "estudiante", "teleoperador"],
        chiefComplaints: [
          "Dolor y tensión en la nuca",
          "Rigidez cervical tras horas frente al ordenador",
          "Dolor en el cuello que sube hasta la cabeza",
          "Contractura cervical constante"
        ],
        onsetTypes: ["gradual por mala postura", "asociado a estrés"],
        chronology: [2, 52],
        aggravatingFactors: ["trabajo con ordenador", "estrés", "mantener postura fija", "lectura prolongada"],
        relievingFactors: ["calor local", "masaje", "cambios posturales", "estiramientos"],
        physicalFindings: {
          palpation: "puntos gatillo trapecio y cervicales",
          rom: "limitación leve rotación y extensión",
          strength: "normal",
          specialTests: "test neurológico normal, postura anteriorizada cabeza"
        }
      },
      {
        name: "Latigazo cervical (whiplash)",
        ageRange: [20, 60],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["accidente de tráfico", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor cervical tras un accidente de coche",
          "Dolor y mareo después de un golpe en el cuello",
          "Rigidez severa del cuello tras un frenazo brusco",
          "Dolor cervical con cefalea y náuseas tras accidente"
        ],
        onsetTypes: ["agudo post-traumático"],
        chronology: [0.1, 12],
        aggravatingFactors: ["todos los movimientos cervicales", "estrés", "concentración"],
        relievingFactors: ["reposo inicial", "analgésicos", "collar cervical blando temporal"],
        physicalFindings: {
          palpation: "dolor difuso cervical",
          rom: "limitación global por dolor y espasmo",
          strength: "normal",
          specialTests: "test neurológico normal, posible mareo con movimientos"
        }
      },
      {
        name: "Radiculopatía cervical C6-C7",
        ageRange: [40, 65],
        genderDistribution: { masculino: 60, femenino: 40 },
        occupations: ["trabajador manual", "deportista", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor que baja del cuello al brazo y mano",
          "Hormigueo y dolor en el brazo hasta los dedos",
          "Dolor cervical con quemazón en el brazo",
          "Debilidad y dolor irradiado al brazo"
        ],
        onsetTypes: ["agudo o gradual", "puede ser nocturno"],
        chronology: [1, 24],
        aggravatingFactors: ["extensión cervical", "rotación hacia lado afecto", "Valsalva", "tos"],
        relievingFactors: ["brazo sobre cabeza", "flexión cervical contralateral", "reposo"],
        physicalFindings: {
          palpation: "dolor cervical bajo unilateral",
          rom: "limitación extensión y rotación ipsilateral",
          strength: "debilidad extensión muñeca y codo (C6-C7)",
          specialTests: "Spurling positivo, distracción cervical alivia, alteración reflejo tricipital"
        }
      },
      {
        name: "Cervicoartrosis (espondilosis cervical)",
        ageRange: [50, 80],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["cualquier ocupación", "degenerativo"],
        chiefComplaints: [
          "Rigidez cervical matutina importante",
          "Dolor y crujidos al mover el cuello",
          "Dolor cervical crónico con limitación de movimiento",
          "Dolor que empeora con actividad y mejora con reposo"
        ],
        onsetTypes: ["gradual progresivo años"],
        chronology: [52, 520],
        aggravatingFactors: ["movimientos cervicales", "frío", "humedad", "mantener posición"],
        relievingFactors: ["calor", "reposo", "antiinflamatorios"],
        physicalFindings: {
          palpation: "crepitación a la movilización",
          rom: "limitación global progresiva",
          strength: "normal o ligeramente débil",
          specialTests: "crepitación, posible compresión radicular asociada"
        }
      },
      {
        name: "Cefalea cervicogénica",
        ageRange: [30, 60],
        genderDistribution: { masculino: 25, femenino: 75 },
        occupations: ["oficinista", "trabajador con ordenador", "estrés laboral"],
        chiefComplaints: [
          "Dolor de cabeza que empieza en el cuello",
          "Cefalea que mejora al mover el cuello",
          "Dolor que sube del cuello a la cabeza",
          "Dolor de cabeza unilateral asociado a tensión cervical"
        ],
        onsetTypes: ["gradual", "asociado a postura"],
        chronology: [4, 104],
        aggravatingFactors: ["postura mantenida", "estrés", "trabajo con ordenador"],
        relievingFactors: ["movilizaciones cervicales", "masaje", "cambios posturales"],
        physicalFindings: {
          palpation: "puntos gatillo cervicales altos y suboccipitales",
          rom: "limitación leve-moderada",
          strength: "normal",
          specialTests: "reproducción cefalea con presión C1-C3"
        }
      },
      {
        name: "Tortícolis aguda",
        ageRange: [15, 50],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["cualquier ocupación", "tras dormir en mala postura"],
        chiefComplaints: [
          "Me levanté con el cuello bloqueado",
          "No puedo girar la cabeza, me duele muchísimo",
          "Tengo la cabeza girada y no puedo enderezarla",
          "Dolor agudo al intentar mover el cuello"
        ],
        onsetTypes: ["agudo súbito, frecuentemente nocturno"],
        chronology: [0.1, 1],
        aggravatingFactors: ["intentar mover cuello", "rotación", "flexión lateral"],
        relievingFactors: ["postura antiálgica", "calor", "relajantes musculares"],
        physicalFindings: {
          palpation: "contractura severa unilateral",
          rom: "limitación severa especialmente rotación",
          strength: "imposible evaluar",
          specialTests: "postura antiálgica evidente"
        }
      },
      {
        name: "Síndrome del desfiladero torácico",
        ageRange: [20, 50],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["músico", "trabajador overhead", "nadador", "cajero"],
        chiefComplaints: [
          "Dolor y hormigueo en brazo y mano",
          "Sensación de mano hinchada y pesada",
          "Dolor cervical con parestesias en los dedos",
          "Debilidad y frialdad en la mano"
        ],
        onsetTypes: ["gradual", "asociado a actividades específicas"],
        chronology: [4, 52],
        aggravatingFactors: ["elevación brazo", "actividades overhead", "cargar peso", "postura"],
        relievingFactors: ["bajar brazo", "cambios posturales", "estiramientos"],
        physicalFindings: {
          palpation: "dolor supraclavicular y escalenos",
          rom: "puede ser normal",
          strength: "posible debilidad intrínseca mano",
          specialTests: "Adson positivo, Roos test positivo, Wright test positivo"
        }
      },
      {
        name: "Esguince cervical grado II",
        ageRange: [20, 60],
        genderDistribution: { masculino: 55, femenino: 45 },
        occupations: ["deportista", "accidente", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor cervical intenso tras un golpe o caída",
          "No puedo mover el cuello tras el traumatismo",
          "Dolor y espasmo severo del cuello",
          "Rigidez importante del cuello tras lesión"
        ],
        onsetTypes: ["agudo traumático"],
        chronology: [0.1, 8],
        aggravatingFactors: ["movimientos cervicales", "tos", "esfuerzo"],
        relievingFactors: ["reposo", "inmovilización temporal", "analgésicos"],
        physicalFindings: {
          palpation: "dolor y espasmo muscular marcado",
          rom: "limitación severa por dolor",
          strength: "normal",
          specialTests: "test neurológico normal, sin signos de fractura"
        }
      },
      {
        name: "Mielopatía cervical espondilótica",
        ageRange: [55, 80],
        genderDistribution: { masculino: 60, femenino: 40 },
        occupations: ["cualquier ocupación", "degenerativo"],
        chiefComplaints: [
          "Torpeza en las manos y dificultad para caminar",
          "Pérdida de destreza manual progresiva",
          "Sensación de inestabilidad al caminar",
          "Debilidad en brazos y piernas"
        ],
        onsetTypes: ["gradual progresivo"],
        chronology: [24, 520],
        aggravatingFactors: ["progresión natural", "extensión cervical"],
        relievingFactors: ["limitado, progresivo"],
        physicalFindings: {
          palpation: "posible dolor cervical",
          rom: "limitación variable",
          strength: "debilidad difusa, especialmente MMSS",
          specialTests: "Hoffman positivo, hiperreflexia, clonus, Babinski positivo, ataxia"
        }
      },
      {
        name: "Síndrome facetario cervical",
        ageRange: [40, 70],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["trabajador manual", "deportista", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor cervical que empeora al mirar hacia arriba",
          "Dolor al extender o rotar el cuello",
          "Rigidez cervical especialmente por la mañana",
          "Dolor localizado en la nuca"
        ],
        onsetTypes: ["gradual", "degenerativo"],
        chronology: [8, 104],
        aggravatingFactors: ["extensión cervical", "rotación", "mantener postura"],
        relievingFactors: ["flexión leve", "reposo", "calor"],
        physicalFindings: {
          palpation: "dolor articulaciones facetarias",
          rom: "limitación extensión y rotación",
          strength: "normal",
          specialTests: "extensión + rotación reproduce dolor"
        }
      }
    ]
  },

  "lesiones_rodilla": {
    name: "Lesiones de Rodilla",
    pathologies: [
      {
        name: "Síndrome patelofemoral",
        ageRange: [15, 40],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["corredor", "ciclista", "estudiante", "trabajador escaleras"],
        chiefComplaints: [
          "Dolor en la parte anterior de la rodilla al subir escaleras",
          "Dolor detrás de la rótula al estar sentado mucho tiempo",
          "Crepitación y dolor en la rodilla al agacharme",
          "Dolor al bajar escaleras o cuestas"
        ],
        onsetTypes: ["gradual por sobrecarga", "asociado a actividad deportiva"],
        chronology: [4, 52],
        aggravatingFactors: ["subir/bajar escaleras", "sedestación prolongada", "sentadillas", "correr"],
        relievingFactors: ["reposo", "modificación actividad", "fortalecimiento cuádriceps"],
        physicalFindings: {
          palpation: "dolor bordes rotulianos",
          rom: "crepitación patelofemoral",
          strength: "cuádriceps débil, especialmente VMO",
          specialTests: "test compresión rotuliana positivo, signo del cine positivo, Clarke positivo"
        }
      },
      {
        name: "Rotura de menisco medial",
        ageRange: [25, 65],
        genderDistribution: { masculino: 70, femenino: 30 },
        occupations: ["futbolista", "trabajador con giros", "deportista", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor en la parte interna de la rodilla con bloqueos",
          "Sensación de enganche en la rodilla al flexionarla",
          "Dolor e hinchazón tras un giro brusco de la rodilla",
          "La rodilla se me bloquea y no puedo extenderla"
        ],
        onsetTypes: ["agudo traumático con giro", "degenerativo gradual"],
        chronology: [0.1, 104],
        aggravatingFactors: ["giros con pie fijo", "flexión completa", "ponerse en cuclillas"],
        relievingFactors: ["extensión", "reposo", "evitar giros"],
        physicalFindings: {
          palpation: "dolor línea articular medial",
          rom: "posible bloqueo extensión, clic palpable",
          strength: "normal o inhibición por dolor",
          specialTests: "McMurray positivo, Apley positivo, Thessaly positivo"
        }
      },
      {
        name: "Rotura de ligamento cruzado anterior (LCA)",
        ageRange: [18, 40],
        genderDistribution: { masculino: 60, femenino: 40 },
        occupations: ["futbolista", "esquiador", "basquetbolista", "deportista"],
        chiefComplaints: [
          "Sentí un chasquido en la rodilla y se me hinchó inmediatamente",
          "Sensación de inestabilidad, la rodilla se me va",
          "No puedo cambiar de dirección, la rodilla cede",
          "Tras el traumatismo la rodilla está muy hinchada"
        ],
        onsetTypes: ["agudo traumático sin contacto"],
        chronology: [0.1, 52],
        aggravatingFactors: ["cambios de dirección", "giros", "aterrizajes", "deceleración"],
        relievingFactors: ["uso de rodillera", "evitar pivotes", "fortalecimiento"],
        physicalFindings: {
          palpation: "derrame articular importante",
          rom: "normal o limitado por derrame",
          strength: "inhibición cuádriceps",
          specialTests: "Lachman positivo, cajón anterior positivo, pivot shift positivo"
        }
      },
      {
        name: "Tendinopatía rotuliana (rodilla del saltador)",
        ageRange: [18, 35],
        genderDistribution: { masculino: 75, femenino: 25 },
        occupations: ["voleibolista", "basquetbolista", "saltador", "atleta"],
        chiefComplaints: [
          "Dolor en la parte inferior de la rótula al saltar",
          "Dolor que empeora con saltos y carreras",
          "Dolor localizado bajo la rótula",
          "Rigidez y dolor tras entrenar"
        ],
        onsetTypes: ["gradual por sobrecarga de saltos"],
        chronology: [4, 52],
        aggravatingFactors: ["saltos", "sentadillas", "subir escaleras", "correr"],
        relievingFactors: ["reposo", "hielo", "reducción carga"],
        physicalFindings: {
          palpation: "dolor polo inferior rótula",
          rom: "normal",
          strength: "normal pero doloroso",
          specialTests: "dolor a la palpación polo inferior rotuliano, dolor con contracción isométrica"
        }
      },
      {
        name: "Artrosis de rodilla (gonartrosis)",
        ageRange: [50, 80],
        genderDistribution: { masculino: 40, femenino: 60 },
        occupations: ["cualquier ocupación", "sobrepeso", "deportista veterano"],
        chiefComplaints: [
          "Dolor y rigidez en la rodilla que empeora con actividad",
          "Rigidez matutina de la rodilla",
          "Crujidos y dolor al caminar",
          "Hinchazón de la rodilla tras actividad"
        ],
        onsetTypes: ["gradual progresivo años"],
        chronology: [52, 520],
        aggravatingFactors: ["caminar", "escaleras", "bipedestación prolongada", "frío"],
        relievingFactors: ["reposo", "calor", "antiinflamatorios", "pérdida peso"],
        physicalFindings: {
          palpation: "crepitación, derrame variable",
          rom: "limitación flexo-extensión",
          strength: "atrofia cuádriceps",
          specialTests: "crepitación, posible deformidad varo/valgo, dolor en compartimentos"
        }
      },
      {
        name: "Bursitis anserina",
        ageRange: [40, 65],
        genderDistribution: { masculino: 20, femenino: 80 },
        occupations: ["corredor", "sobrepeso", "artrosis", "trabajador escaleras"],
        chiefComplaints: [
          "Dolor en la cara interna de la rodilla al subir escaleras",
          "Dolor e hinchazón en la parte interna de la rodilla",
          "Dolor que empeora al levantarme de la silla",
          "Sensibilidad en la zona interna de la rodilla"
        ],
        onsetTypes: ["gradual", "asociado a sobrecarga o artrosis"],
        chronology: [2, 24],
        aggravatingFactors: ["subir escaleras", "ponerse en cuclillas", "presión directa"],
        relievingFactors: ["reposo", "hielo", "evitar presión directa"],
        physicalFindings: {
          palpation: "dolor exquisito cara anteromedial tibia proximal",
          rom: "normal",
          strength: "normal",
          specialTests: "dolor localizado pata de ganso, especialmente a 30° flexión"
        }
      },
      {
        name: "Condromalacia rotuliana",
        ageRange: [15, 35],
        genderDistribution: { masculino: 40, femenino: 60 },
        occupations: ["deportista joven", "corredor", "estudiante"],
        chiefComplaints: [
          "Crepitación constante en la rodilla",
          "Dolor retro rotuliano difuso",
          "Sensación de arenilla al mover la rodilla",
          "Dolor al estar sentado con rodillas flexionadas"
        ],
        onsetTypes: ["gradual", "asociado a crecimiento o sobrecarga"],
        chronology: [8, 104],
        aggravatingFactors: ["sedestación prolongada", "escaleras", "sentadillas", "correr"],
        relievingFactors: ["modificar actividad", "fortalecimiento", "evitar flexión mantenida"],
        physicalFindings: {
          palpation: "crepitación rotuliana",
          rom: "crepitación fina difusa",
          strength: "VMO débil",
          specialTests: "Clarke positivo, grinding test positivo"
        }
      },
      {
        name: "Lesión de ligamento colateral medial (LCM)",
        ageRange: [20, 45],
        genderDistribution: { masculino: 70, femenino: 30 },
        occupations: ["futbolista", "esquiador", "deportista de contacto"],
        chiefComplaints: [
          "Dolor en la parte interna de la rodilla tras un golpe",
          "Sensación de inestabilidad en valgo",
          "Dolor al torcer la rodilla hacia afuera",
          "Hinchazón en la cara interna de la rodilla"
        ],
        onsetTypes: ["agudo traumático por valgo forzado"],
        chronology: [0.1, 12],
        aggravatingFactors: ["estrés en valgo", "giros", "caminar en terreno irregular"],
        relievingFactors: ["rodillera", "reposo", "evitar estrés lateral"],
        physicalFindings: {
          palpation: "dolor trayecto LCM",
          rom: "normal o ligeramente limitado",
          strength: "normal",
          specialTests: "estrés en valgo 0° y 30° positivo según grado lesión"
        }
      },
      {
        name: "Quiste de Baker (quiste poplíteo)",
        ageRange: [35, 70],
        genderDistribution: { masculino: 45, femenino: 55 },
        occupations: ["cualquier ocupación", "asociado a patología articular"],
        chiefComplaints: [
          "Sensación de masa detrás de la rodilla",
          "Hinchazón y tensión en la parte posterior de la rodilla",
          "Molestia al flexionar completamente la rodilla",
          "Sensación de plenitud en el hueco poplíteo"
        ],
        onsetTypes: ["gradual", "asociado a derrame articular"],
        chronology: [4, 104],
        aggravatingFactors: ["flexión completa", "actividad prolongada", "bipedestación"],
        relievingFactors: ["extensión", "elevación", "reposo"],
        physicalFindings: {
          palpation: "masa fluctuante hueco poplíteo",
          rom: "posible limitación flexión completa",
          strength: "normal",
          specialTests: "transiluminación positiva, mejor palpable en extensión"
        }
      },
      {
        name: "Síndrome de la plica sinovial",
        ageRange: [15, 40],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["deportista", "corredor", "ciclista"],
        chiefComplaints: [
          "Chasquido doloroso en la rodilla al flexionarla",
          "Sensación de enganche o pellizco en la rodilla",
          "Dolor difuso en la rodilla al correr",
          "Hinchazón intermitente de la rodilla"
        ],
        onsetTypes: ["gradual por sobrecarga", "post-traumático"],
        chronology: [4, 52],
        aggravatingFactors: ["flexo-extensión repetida", "correr", "subir escaleras"],
        relievingFactors: ["reposo", "hielo", "evitar flexión repetida"],
        physicalFindings: {
          palpation: "banda palpable dolorosa borde medial rótula",
          rom: "clic o chasquido a 30-45° flexión",
          strength: "normal",
          specialTests: "test de la plica positivo, dolor con presión plica + flexo-extensión"
        }
      }
    ]
  },

  "lesiones_tobillo_pie": {
    name: "Lesiones de Tobillo y Pie",
    pathologies: [
      {
        name: "Esguince lateral de tobillo grado II",
        ageRange: [15, 45],
        genderDistribution: { masculino: 55, femenino: 45 },
        occupations: ["deportista", "cualquier ocupación"],
        chiefComplaints: [
          "Torcedura de tobillo con hinchazón y dolor intenso",
          "No puedo apoyar bien el pie tras doblarme el tobillo",
          "Tobillo hinchado y morado tras torcedura",
          "Dolor al caminar después de torcerme el tobillo"
        ],
        onsetTypes: ["agudo traumático por inversión"],
        chronology: [0.1, 8],
        aggravatingFactors: ["apoyo", "inversión", "caminar terreno irregular"],
        relievingFactors: ["reposo", "elevación", "hielo", "vendaje compresivo"],
        physicalFindings: {
          palpation: "dolor LPAA y LPC",
          rom: "limitado por dolor e hinchazón",
          strength: "débil eversores",
          specialTests: "cajón anterior positivo, bostezo lateral leve, equimosis"
        }
      },
      {
        name: "Fascitis plantar",
        ageRange: [35, 65],
        genderDistribution: { masculino: 40, femenino: 60 },
        occupations: ["enfermero", "profesor", "corredor", "trabajador de pie"],
        chiefComplaints: [
          "Dolor agudo en el talón con los primeros pasos de la mañana",
          "Dolor punzante en la planta del pie al levantarme",
          "Dolor en el talón que empeora al estar de pie",
          "Dolor intenso en la zona del arco plantar"
        ],
        onsetTypes: ["gradual", "asociado a sobrecarga o calzado inadecuado"],
        chronology: [4, 52],
        aggravatingFactors: ["primeros pasos matutinos", "bipedestación prolongada", "caminar descalzo", "puntillas"],
        relievingFactors: ["reposo", "calzado adecuado", "estiramientos", "talonera"],
        physicalFindings: {
          palpation: "dolor exquisito inserción fascia en calcáneo",
          rom: "limitación dorsiflexión tobillo",
          strength: "normal",
          specialTests: "dolor a la palpación medial calcáneo, Windlass test positivo"
        }
      },
      {
        name: "Tendinopatía aquílea",
        ageRange: [30, 55],
        genderDistribution: { masculino: 70, femenino: 30 },
        occupations: ["corredor", "saltador", "deportista veterano", "sedentario que inicia deporte"],
        chiefComplaints: [
          "Dolor en el tendón de Aquiles al correr",
          "Rigidez matutina en el talón posterior",
          "Dolor que empeora al subir escaleras o correr",
          "Hinchazón en la parte posterior del tobillo"
        ],
        onsetTypes: ["gradual por sobrecarga", "cambio brusco actividad"],
        chronology: [2, 52],
        aggravatingFactors: ["correr", "saltos", "subir escaleras", "flexión plantar contra resistencia"],
        relievingFactors: ["reposo", "hielo", "talonera", "estiramientos suaves"],
        physicalFindings: {
          palpation: "dolor y engrosamiento tendón Aquiles 2-6cm sobre inserción",
          rom: "dolor dorsiflexión pasiva",
          strength: "débil y doloroso flexión plantar",
          specialTests: "Royal London Hospital test positivo, painful arc sign"
        }
      },
      {
        name: "Fractura de estrés del metatarsiano",
        ageRange: [20, 45],
        genderDistribution: { masculino: 40, femenino: 60 },
        occupations: ["corredor de larga distancia", "militar", "bailarín", "triatleta"],
        chiefComplaints: [
          "Dolor progresivo en el antepié al correr",
          "Dolor que aumenta con actividad y mejora con reposo",
          "Hinchazón en el dorso del pie",
          "Dolor intenso localizado en el pie que no mejora"
        ],
        onsetTypes: ["gradual por sobrecarga repetitiva"],
        chronology: [2, 12],
        aggravatingFactors: ["apoyo", "correr", "saltos", "actividad de impacto"],
        relievingFactors: ["reposo absoluto", "descarga"],
        physicalFindings: {
          palpation: "dolor muy localizado eje metatarsiano",
          rom: "normal",
          strength: "doloroso",
          specialTests: "hop test imposible, edema localizado, diapason positivo"
        }
      },
      {
        name: "Esguince sindesmosis (lesión alto tobillo)",
        ageRange: [18, 40],
        genderDistribution: { masculino: 75, femenino: 25 },
        occupations: ["futbolista", "rugby", "esquiador", "deportista"],
        chiefComplaints: [
          "Dolor en la parte anterior del tobillo tras torsión",
          "Dolor que no mejora como un esguince normal",
          "Dolor al empujar o cambiar de dirección",
          "Dolor entre los dos huesos de la pierna"
        ],
        onsetTypes: ["agudo por rotación externa forzada"],
        chronology: [1, 16],
        aggravatingFactors: ["rotación externa", "dorsiflexión forzada", "empuje push-off"],
        relievingFactors: ["reposo estricto", "bota walker", "evitar rotación"],
        physicalFindings: {
          palpation: "dolor sindesmosis anterolateral",
          rom: "limitación dorsiflexión",
          strength: "débil",
          specialTests: "squeeze test positivo, external rotation test positivo"
        }
      },
      {
        name: "Neuroma de Morton",
        ageRange: [40, 65],
        genderDistribution: { masculino: 20, femenino: 80 },
        occupations: ["uso de tacones", "deportista", "bailarín", "trabajador de pie"],
        chiefComplaints: [
          "Sensación de piedrecita o bulto en el pie",
          "Quemazón entre los dedos del pie",
          "Dolor tipo calambre en el antepié",
          "Hormigueo y ardor entre 3º y 4º dedo"
        ],
        onsetTypes: ["gradual", "asociado a calzado estrecho o tacones"],
        chronology: [8, 104],
        aggravatingFactors: ["calzado estrecho", "tacones", "bipedestación", "caminar"],
        relievingFactors: ["quitarse zapatos", "masajear pie", "calzado ancho"],
        physicalFindings: {
          palpation: "dolor plantar 3º-4º espacio metatarsiano",
          rom: "normal",
          strength: "normal",
          specialTests: "Mulder's click positivo, dolor con compresión transversa metatarsal"
        }
      },
      {
        name: "Tendinitis de los peroneos",
        ageRange: [25, 50],
        genderDistribution: { masculino: 55, femenino: 45 },
        occupations: ["corredor", "bailarín", "trabajador terreno irregular", "tras esguince"],
        chiefComplaints: [
          "Dolor en la parte externa del tobillo",
          "Dolor al caminar por terreno irregular",
          "Sensación de inestabilidad del tobillo",
          "Dolor lateral del tobillo que empeora con actividad"
        ],
        onsetTypes: ["gradual por sobrecarga", "post-esguince"],
        chronology: [2, 24],
        aggravatingFactors: ["eversión contra resistencia", "terreno irregular", "correr"],
        relievingFactors: ["reposo", "hielo", "evitar eversión"],
        physicalFindings: {
          palpation: "dolor trayecto peroneos retromaléolo lateral",
          rom: "dolor eversión activa",
          strength: "débil y doloroso eversión",
          specialTests: "dolor con eversión contra resistencia"
        }
      },
      {
        name: "Hallux rigidus (artrosis 1ª MTF)",
        ageRange: [45, 75],
        genderDistribution: { masculino: 60, femenino: 40 },
        occupations: ["deportista veterano", "cualquier ocupación", "degenerativo"],
        chiefComplaints: [
          "Dolor y rigidez en el dedo gordo del pie",
          "No puedo doblar bien el dedo gordo",
          "Dolor en la base del dedo gordo al caminar",
          "Rigidez y dolor al empujar con el pie"
        ],
        onsetTypes: ["gradual progresivo años"],
        chronology: [52, 520],
        aggravatingFactors: ["dorsiflexión primer dedo", "empuje en marcha", "calzado rígido"],
        relievingFactors: ["calzado con suela rígida", "reposo", "evitar flexión"],
        physicalFindings: {
          palpation: "dolor y osteofitos dorsal 1ª MTF",
          rom: "limitación severa dorsiflexión <20°",
          strength: "normal",
          specialTests: "crepitación, osteofitos palpables"
        }
      },
      {
        name: "Bursitis retrocalcánea",
        ageRange: [30, 55],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["corredor", "bailarín", "calzado rígido", "deportista"],
        chiefComplaints: [
          "Dolor e hinchazón detrás del talón",
          "Dolor que empeora con el calzado",
          "Bulto doloroso en la parte posterior del talón",
          "Dolor al presionar el talón con el zapato"
        ],
        onsetTypes: ["gradual por fricción calzado", "sobrecarga"],
        chronology: [2, 24],
        aggravatingFactors: ["calzado rígido", "presión directa", "flexión plantar máxima"],
        relievingFactors: ["calzado abierto", "talonera", "hielo"],
        physicalFindings: {
          palpation: "dolor bilateral talón posterior, hinchazón local",
          rom: "dolor flexión plantar máxima",
          strength: "normal",
          specialTests: "signo Haglund, dolor con presión retrocalcánea"
        }
      },
      {
        name: "Inestabilidad crónica de tobillo",
        ageRange: [18, 45],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["deportista", "múltiples esguinces previos", "cualquier ocupación"],
        chiefComplaints: [
          "El tobillo se me tuerce constantemente",
          "Sensación de tobillo inestable",
          "Miedo a apoyar en terreno irregular",
          "Episodios repetidos de torceduras"
        ],
        onsetTypes: ["tras esguinces mal recuperados"],
        chronology: [12, 520],
        aggravatingFactors: ["terreno irregular", "deporte", "cambios de dirección"],
        relievingFactors: ["tobillera", "fortalecimiento", "propiocepción"],
        physicalFindings: {
          palpation: "puede ser normal o dolor ligamentos",
          rom: "normal o hipermóvil",
          strength: "peroneos débiles",
          specialTests: "cajón anterior positivo, test bostezo positivo, equilibrio unipodal deficiente"
        }
      }
    ]
  },

  "sindrome_tunel_carpiano_muneca": {
    name: "Síndrome del Túnel Carpiano y Muñeca",
    pathologies: [
      {
        name: "Síndrome del túnel carpiano",
        ageRange: [35, 65],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["trabajador informático", "cajero", "embarazada", "diabético", "trabajador manual repetitivo"],
        chiefComplaints: [
          "Hormigueo en la mano que me despierta por la noche",
          "Adormecimiento de los dedos pulgar, índice y medio",
          "Dolor y hormigueo en la mano al conducir",
          "Pérdida de fuerza para abrir botes o sujetar objetos"
        ],
        onsetTypes: ["gradual progresivo", "asociado a embarazo o actividad repetitiva"],
        chronology: [8, 104],
        aggravatingFactors: ["flexión muñeca mantenida", "actividades manuales repetitivas", "noche"],
        relievingFactors: ["sacudir mano", "férula nocturna", "evitar flexión muñeca"],
        physicalFindings: {
          palpation: "puede ser normal",
          rom: "normal",
          strength: "debilidad oponente pulgar, atrofia tenar en casos avanzados",
          specialTests: "Phalen positivo, Tinel positivo, Durkan positivo"
        }
      },
      {
        name: "Tendinitis de De Quervain",
        ageRange: [30, 55],
        genderDistribution: { masculino: 15, femenino: 85 },
        occupations: ["madre reciente", "trabajador informático", "jardinero", "masajista"],
        chiefComplaints: [
          "Dolor en la base del pulgar al agarrar objetos",
          "Dolor en el lateral del pulgar que sube hacia el antebrazo",
          "Dolor al levantar a mi bebé",
          "Dolor intenso con movimientos del pulgar"
        ],
        onsetTypes: ["gradual por movimientos repetitivos", "post-parto"],
        chronology: [2, 24],
        aggravatingFactors: ["prensión", "desviación cubital", "movimientos pulgar", "levantar peso"],
        relievingFactors: ["férula de pulgar", "reposo", "hielo"],
        physicalFindings: {
          palpation: "dolor e hinchazón estiloides radial",
          rom: "dolor movimientos pulgar",
          strength: "débil y doloroso",
          specialTests: "Finkelstein positivo, Eichoff positivo"
        }
      },
      {
        name: "Fractura de Colles",
        ageRange: [50, 80],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["osteoporosis", "caída", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor intenso en la muñeca tras una caída",
          "Deformidad visible de la muñeca tras caída con mano extendida",
          "No puedo mover la muñeca del dolor",
          "Muñeca muy hinchada y dolorosa tras traumatismo"
        ],
        onsetTypes: ["agudo traumático por caída sobre mano extendida"],
        chronology: [0.1, 12],
        aggravatingFactors: ["cualquier movimiento", "apoyo"],
        relievingFactors: ["inmovilización", "analgésicos", "elevación"],
        physicalFindings: {
          palpation: "dolor exquisito, deformidad en dorso de tenedor",
          rom: "imposible por dolor",
          strength: "imposible evaluar",
          specialTests: "deformidad evidente, crepitación ósea, edema severo"
        }
      },
      {
        name: "Tendinitis de los flexores de dedos (dedo en gatillo)",
        ageRange: [40, 65],
        genderDistribution: { masculino: 40, femenino: 60 },
        occupations: ["diabético", "trabajador manual repetitivo", "músico", "artesano"],
        chiefComplaints: [
          "El dedo se me queda enganchado al flexionarlo",
          "Chasquido doloroso al doblar el dedo",
          "Tengo que ayudarme con la otra mano para estirar el dedo",
          "Rigidez matutina del dedo con enganche"
        ],
        onsetTypes: ["gradual", "asociado a movimientos repetitivos o diabetes"],
        chronology: [4, 52],
        aggravatingFactors: ["flexión dedos", "actividades manuales", "mañanas"],
        relievingFactors: ["reposo", "férula", "estiramientos suaves"],
        physicalFindings: {
          palpation: "nódulo palpable palma mano",
          rom: "chasquido con flexo-extensión dedo",
          strength: "normal",
          specialTests: "clic palpable en polea A1, posible bloqueo dedo en flexión"
        }
      },
      {
        name: "Artrosis de articulación trapecio-metacarpiana (rizartrosis)",
        ageRange: [50, 80],
        genderDistribution: { masculino: 20, femenino: 80 },
        occupations: ["cualquier ocupación", "trabajos manuales previos", "degenerativo"],
        chiefComplaints: [
          "Dolor en la base del pulgar al agarrar objetos",
          "Pérdida de fuerza en la mano",
          "Dolor al girar llaves o abrir botes",
          "Deformidad progresiva en la base del pulgar"
        ],
        onsetTypes: ["gradual progresivo años"],
        chronology: [52, 520],
        aggravatingFactors: ["prensión", "pellizco", "giros con fuerza", "oposición pulgar"],
        relievingFactors: ["reposo", "férula", "antiinflamatorios"],
        physicalFindings: {
          palpation: "dolor base pulgar, subluxación TMC",
          rom: "limitación oposición pulgar",
          strength: "débil prensión lateral",
          specialTests: "grind test positivo, subluxación TMC, deformidad en Z"
        }
      },
      {
        name: "Esguince de muñeca (ligamento escafo-lunar)",
        ageRange: [20, 50],
        genderDistribution: { masculino: 65, femenino: 35 },
        occupations: ["deportista", "trabajador manual", "caída"],
        chiefComplaints: [
          "Dolor en la muñeca tras caída sobre la mano",
          "Dolor al apoyar la mano o hacer fuerza",
          "Sensación de chasquido en la muñeca",
          "Hinchazón y dolor difuso en la muñeca"
        ],
        onsetTypes: ["agudo traumático por hiperextensión"],
        chronology: [0.1, 12],
        aggravatingFactors: ["extensión muñeca", "prensión", "apoyo", "desviación cubital"],
        relievingFactors: ["reposo", "inmovilización", "hielo"],
        physicalFindings: {
          palpation: "dolor entre lunatum y escafoides dorsal",
          rom: "limitación extensión",
          strength: "débil por dolor",
          specialTests: "Watson test positivo, dolor fosa tabaquera anatómica"
        }
      },
      {
        name: "Tendinitis de los extensores de muñeca",
        ageRange: [25, 50],
        genderDistribution: { masculino: 60, femenino: 40 },
        occupations: ["trabajador informático", "músico", "deportista raqueta", "mecánico"],
        chiefComplaints: [
          "Dolor en el dorso de la muñeca al extenderla",
          "Dolor al teclear o usar el ratón",
          "Dolor que empeora con actividades repetitivas",
          "Dolor en la parte posterior del antebrazo y muñeca"
        ],
        onsetTypes: ["gradual por sobrecarga repetitiva"],
        chronology: [2, 24],
        aggravatingFactors: ["extensión muñeca", "uso ratón", "teclear", "actividades manuales"],
        relievingFactors: ["reposo", "férula", "modificar ergonomía"],
        physicalFindings: {
          palpation: "dolor dorsal muñeca y distal antebrazo",
          rom: "dolor extensión activa",
          strength: "débil y doloroso extensión muñeca",
          specialTests: "dolor con resistencia extensión muñeca y dedos"
        }
      },
      {
        name: "Quiste sinovial de muñeca (ganglion)",
        ageRange: [20, 50],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["cualquier ocupación", "asociado a sobrecarga articular"],
        chiefComplaints: [
          "Bulto visible y palpable en la muñeca",
          "Masa que aparece y desaparece en la muñeca",
          "Molestia o dolor leve en la muñeca",
          "Hinchazón en el dorso o cara palmar de la muñeca"
        ],
        onsetTypes: ["gradual", "puede ser post-traumático"],
        chronology: [4, 104],
        aggravatingFactors: ["movimientos repetitivos", "flexo-extensión forzada"],
        relievingFactors: ["puede ser asintomático", "reposo"],
        physicalFindings: {
          palpation: "masa quística bien definida, transiluminable",
          rom: "normal o ligeramente doloroso",
          strength: "normal",
          specialTests: "transiluminación positiva, masa fluctuante"
        }
      },
      {
        name: "Fractura de escafoides carpiano",
        ageRange: [20, 40],
        genderDistribution: { masculino: 75, femenino: 25 },
        occupations: ["deportista", "accidente", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor en el lateral del pulgar tras caída sobre la mano",
          "Dolor en la fosa tabaquera anatómica",
          "Dolor al hacer pinza con el pulgar",
          "Muñeca dolorosa pero sin deformidad visible"
        ],
        onsetTypes: ["agudo traumático por caída sobre mano extendida"],
        chronology: [0.1, 8],
        aggravatingFactors: ["prensión", "compresión axial pulgar", "desviación radial"],
        relievingFactors: ["inmovilización con férula escapo-polar", "reposo"],
        physicalFindings: {
          palpation: "dolor exquisito fosa tabaquera anatómica",
          rom: "limitación dolorosa extensión y desviación radial",
          strength: "débil por dolor",
          specialTests: "dolor compresión axial pulgar, edema fosa tabaquera"
        }
      },
      {
        name: "Síndrome de intersección (tendinitis de los abductores del pulgar)",
        ageRange: [25, 45],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["remero", "levantador pesas", "jardinero", "esquiador"],
        chiefComplaints: [
          "Dolor en el antebrazo distal, unos 4cm antes de la muñeca",
          "Crepitación audible al mover la muñeca",
          "Dolor al levantar peso o hacer fuerza",
          "Hinchazón en el dorso del antebrazo"
        ],
        onsetTypes: ["agudo o gradual por actividad repetitiva"],
        chronology: [1, 12],
        aggravatingFactors: ["extensión muñeca", "movimientos repetitivos", "levantamiento peso"],
        relievingFactors: ["reposo", "hielo", "férula"],
        physicalFindings: {
          palpation: "dolor, crepitación y edema 4cm proximal muñeca dorsal",
          rom: "crepitación con flexo-extensión",
          strength: "débil y doloroso",
          specialTests: "crepitación palpable, dolor con resistencia extensión muñeca"
        }
      }
    ]
  },

  "tendinopatias": {
    name: "Tendinopatías",
    pathologies: [
      {
        name: "Epicondilitis lateral (codo de tenista)",
        ageRange: [35, 55],
        genderDistribution: { masculino: 55, femenino: 45 },
        occupations: ["tenista", "trabajador manual", "mecánico", "carnicero", "pintor"],
        chiefComplaints: [
          "Dolor en la parte externa del codo al agarrar objetos",
          "Dolor al dar la mano o girar el pomo de la puerta",
          "Dolor en el codo al jugar al tenis o pádel",
          "Dolor que irradia desde el codo hacia el antebrazo"
        ],
        onsetTypes: ["gradual por sobrecarga repetitiva"],
        chronology: [4, 52],
        aggravatingFactors: ["extensión muñeca contra resistencia", "prensión", "supinación", "movimientos repetitivos"],
        relievingFactors: ["reposo", "codera", "hielo", "modificar actividad"],
        physicalFindings: {
          palpation: "dolor epicóndilo lateral",
          rom: "normal muñeca",
          strength: "débil y doloroso extensión muñeca",
          specialTests: "Cozen test positivo, Mill test positivo, Maudsley test positivo"
        }
      },
      {
        name: "Epitrocleítis (codo de golfista)",
        ageRange: [35, 60],
        genderDistribution: { masculino: 60, femenino: 40 },
        occupations: ["golfista", "lanzador", "trabajador manual", "escalador"],
        chiefComplaints: [
          "Dolor en la parte interna del codo",
          "Dolor al flexionar la muñeca o agarrar objetos",
          "Dolor al lanzar o hacer gestos de golf",
          "Dolor que baja por la cara interna del antebrazo"
        ],
        onsetTypes: ["gradual por sobrecarga repetitiva"],
        chronology: [4, 52],
        aggravatingFactors: ["flexión muñeca contra resistencia", "pronación", "prensión"],
        relievingFactors: ["reposo", "codera", "hielo"],
        physicalFindings: {
          palpation: "dolor epicóndilo medial",
          rom: "normal",
          strength: "débil y doloroso flexión muñeca",
          specialTests: "dolor con resistencia flexión muñeca y pronación"
        }
      },
      {
        name: "Tendinopatía del glúteo medio",
        ageRange: [40, 70],
        genderDistribution: { masculino: 20, femenino: 80 },
        occupations: ["corredor", "cualquier ocupación", "sedentario que inicia actividad"],
        chiefComplaints: [
          "Dolor en la cadera lateral que empeora al dormir de lado",
          "Dolor al subir escaleras o levantarse de la silla",
          "Dolor en el glúteo que no me deja dormir",
          "Cojera por dolor lateral de cadera"
        ],
        onsetTypes: ["gradual", "asociado a sobrecarga o cambio actividad"],
        chronology: [4, 52],
        aggravatingFactors: ["decúbito lateral", "subir escaleras", "apoyo unipodal", "abducción contra resistencia"],
        relievingFactors: ["evitar decúbito lateral", "modificar actividad"],
        physicalFindings: {
          palpation: "dolor trocánter mayor",
          rom: "dolor abducción activa",
          strength: "débil abducción cadera, Trendelenburg positivo",
          specialTests: "FABER puede ser positivo, test abducción contra resistencia doloroso"
        }
      },
      {
        name: "Tendinopatía del psoas ilíaco",
        ageRange: [20, 50],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["bailarín", "futbolista", "corredor", "deportista"],
        chiefComplaints: [
          "Dolor en la ingle al levantar la pierna",
          "Dolor anterior de cadera al correr o chutar",
          "Sensación de chasquido en la cadera",
          "Dolor inguinal que empeora con flexión de cadera"
        ],
        onsetTypes: ["gradual por sobrecarga", "asociado a deportes con flexión cadera"],
        chronology: [4, 24],
        aggravatingFactors: ["flexión cadera contra resistencia", "correr", "subir escaleras", "sentadillas"],
        relievingFactors: ["reposo", "estiramientos", "modificar actividad"],
        physicalFindings: {
          palpation: "dolor región inguinal",
          rom: "dolor flexión cadera activa",
          strength: "débil y doloroso flexión cadera",
          specialTests: "Thomas test puede ser positivo, dolor resistencia flexión cadera"
        }
      },
      {
        name: "Tendinopatía isquiotibial (proximal)",
        ageRange: [25, 50],
        genderDistribution: { masculino: 65, femenino: 35 },
        occupations: ["corredor velocista", "futbolista", "atleta", "deportista"],
        chiefComplaints: [
          "Dolor en la parte posterior del muslo alto al correr",
          "Dolor en el glúteo bajo al sentarme",
          "Dolor que empeora con sprint o aceleraciones",
          "Dolor en la tuberosidad isquiática al estirar"
        ],
        onsetTypes: ["gradual por sobrecarga", "asociado a sprint o aceleraciones"],
        chronology: [4, 52],
        aggravatingFactors: ["sprint", "aceleración", "sedestación", "flexión cadera con rodilla extendida"],
        relievingFactors: ["reposo", "modificar entreno", "evitar sedestación prolongada"],
        physicalFindings: {
          palpation: "dolor tuberosidad isquiática",
          rom: "limitación SLR",
          strength: "débil y doloroso flexión rodilla",
          specialTests: "dolor con resistencia flexión rodilla, Puranen-Orava test positivo"
        }
      },
      {
        name: "Tendinopatía del tibial posterior",
        ageRange: [40, 65],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["corredor", "sobrepeso", "pie plano", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor en la cara interna del tobillo",
          "Dolor y caída del arco plantar",
          "Dolor al caminar o estar de pie",
          "Hinchazón en el tobillo interno"
        ],
        onsetTypes: ["gradual progresivo"],
        chronology: [8, 104],
        aggravatingFactors: ["bipedestación", "caminar", "inversión contra resistencia"],
        relievingFactors: ["reposo", "ortesis plantar", "evitar caminar"],
        physicalFindings: {
          palpation: "dolor trayecto tibial posterior retromaleolar",
          rom: "dolor inversión activa",
          strength: "débil inversión, dificultad elevación unipodal en puntillas",
          specialTests: "incapacidad single heel raise, aplanamiento arco longitudinal"
        }
      },
      {
        name: "Tendinopatía del cuádriceps (proximal)",
        ageRange: [30, 55],
        genderDistribution: { masculino: 75, femenino: 25 },
        occupations: ["futbolista", "corredor", "ciclista", "deportista saltos"],
        chiefComplaints: [
          "Dolor en la parte superior de la rótula",
          "Dolor al subir escaleras o ponerse en cuclillas",
          "Dolor en la región anterior del muslo al correr",
          "Rigidez y dolor tras entrenar"
        ],
        onsetTypes: ["gradual por sobrecarga"],
        chronology: [4, 52],
        aggravatingFactors: ["sentadillas", "subir escaleras", "saltos", "correr"],
        relievingFactors: ["reposo", "hielo", "reducir carga"],
        physicalFindings: {
          palpation: "dolor polo superior rótula",
          rom: "normal",
          strength: "débil y doloroso extensión rodilla",
          specialTests: "dolor con contracción isométrica cuádriceps"
        }
      },
      {
        name: "Tendinopatía del aductor",
        ageRange: [25, 45],
        genderDistribution: { masculino: 80, femenino: 20 },
        occupations: ["futbolista", "jugador hockey", "esgrimista", "deportista"],
        chiefComplaints: [
          "Dolor en la ingle al chutar o cambiar de dirección",
          "Dolor en la cara interna del muslo alto",
          "Dolor al abrir las piernas o hacer aducción",
          "Molestia inguinal que aumenta con actividad"
        ],
        onsetTypes: ["gradual por sobrecarga", "agudo por distensión"],
        chronology: [2, 24],
        aggravatingFactors: ["aducción contra resistencia", "chut", "cambios de dirección", "estiramientos"],
        relievingFactors: ["reposo", "hielo", "evitar movimientos laterales"],
        physicalFindings: {
          palpation: "dolor inserción aductores en pubis",
          rom: "dolor abducción pasiva",
          strength: "débil y doloroso aducción cadera",
          specialTests: "squeeze test positivo, dolor con resistencia aducción"
        }
      },
      {
        name: "Tendinopatía del tibial anterior",
        ageRange: [30, 55],
        genderDistribution: { masculino: 60, femenino: 40 },
        occupations: ["corredor", "excursionista", "esquiador", "deportista"],
        chiefComplaints: [
          "Dolor en la parte anterior de la pierna al correr",
          "Dolor al levantar el pie hacia arriba",
          "Dolor e hinchazón en el empeine",
          "Dolor que empeora al caminar cuesta arriba"
        ],
        onsetTypes: ["gradual por sobrecarga"],
        chronology: [2, 24],
        aggravatingFactors: ["dorsiflexión contra resistencia", "correr cuesta arriba", "caminar"],
        relievingFactors: ["reposo", "hielo", "evitar cuestas"],
        physicalFindings: {
          palpation: "dolor trayecto tibial anterior o inserción dorso pie",
          rom: "dolor dorsiflexión activa",
          strength: "débil y doloroso dorsiflexión",
          specialTests: "dolor con resistencia dorsiflexión tobillo"
        }
      },
      {
        name: "Tendinopatía del tríceps",
        ageRange: [25, 50],
        genderDistribution: { masculino: 80, femenino: 20 },
        occupations: ["levantador pesas", "lanzador", "gimnasta", "deportista fuerza"],
        chiefComplaints: [
          "Dolor en la parte posterior del codo al empujar",
          "Dolor al hacer flexiones o press de banca",
          "Dolor en el codo al extender el brazo con fuerza",
          "Hinchazón en la parte posterior del codo"
        ],
        onsetTypes: ["gradual por sobrecarga", "asociado a entrenamientos intensos"],
        chronology: [2, 24],
        aggravatingFactors: ["extensión codo contra resistencia", "empujar", "lanzar"],
        relievingFactors: ["reposo", "hielo", "reducir carga"],
        physicalFindings: {
          palpation: "dolor inserción olécranon",
          rom: "dolor extensión activa codo",
          strength: "débil y doloroso extensión codo",
          specialTests: "dolor con resistencia extensión codo"
        }
      }
    ]
  },

  "alteraciones_posturales": {
    name: "Alteraciones Posturales",
    pathologies: [
      {
        name: "Síndrome cruzado superior",
        ageRange: [25, 55],
        genderDistribution: { masculino: 45, femenino: 55 },
        occupations: ["oficinista", "programador", "estudiante", "trabajador ordenador"],
        chiefComplaints: [
          "Dolor cervical y tensión en hombros constante",
          "Postura encorvada que no puedo corregir",
          "Cefaleas frecuentes y tensión en la nuca",
          "Sensación de pesadez entre los omóplatos"
        ],
        onsetTypes: ["gradual por mala postura prolongada"],
        chronology: [12, 104],
        aggravatingFactors: ["trabajo prolongado con ordenador", "mantener postura", "estrés"],
        relievingFactors: ["cambios posturales", "estiramientos", "ejercicios correctivos"],
        physicalFindings: {
          palpation: "puntos gatillo trapecio y pectorales",
          rom: "limitación extensión cervical y torácica",
          strength: "debilidad escapular y cervical profunda",
          specialTests: "postura cabeza adelantada, hombros protruidos, cifosis torácica aumentada"
        }
      },
      {
        name: "Hipercifosis torácica postural",
        ageRange: [15, 65],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["estudiante", "oficinista", "cualquier ocupación sedentaria"],
        chiefComplaints: [
          "Espalda encorvada y redondeada",
          "Dolor entre los omóplatos",
          "Dificultad para mantener la espalda recta",
          "Fatiga dorsal al estar sentado"
        ],
        onsetTypes: ["gradual durante años", "asociado a hábitos posturales"],
        chronology: [52, 520],
        aggravatingFactors: ["sedestación prolongada", "postura encorvada"],
        relievingFactors: ["ejercicios extensión torácica", "ergonomía mejorada"],
        physicalFindings: {
          palpation: "tensión musculatura dorsal",
          rom: "limitación extensión torácica",
          strength: "debilidad extensores torácicos y escapulares",
          specialTests: "cifosis >40°, test de flexibilidad toracica disminuido"
        }
      },
      {
        name: "Hiperlordosis lumbar",
        ageRange: [20, 60],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["bailarina", "gimnasta", "trabajador bipedestación", "obesidad"],
        chiefComplaints: [
          "Curva lumbar muy pronunciada",
          "Dolor lumbar al estar de pie",
          "Sensación de que la pelvis está muy inclinada",
          "Dolor al extender la espalda hacia atrás"
        ],
        onsetTypes: ["gradual", "asociado a actividad o factores posturales"],
        chronology: [52, 520],
        aggravatingFactors: ["bipedestación prolongada", "extensión lumbar", "tacones"],
        relievingFactors: ["flexión lumbar", "fortalecimiento core"],
        physicalFindings: {
          palpation: "tensión musculatura lumbar",
          rom: "limitación flexión lumbar", 
          strength: "debilidad abdominal",
          specialTests: "lordosis aumentada, test Thomas positivo, abdominales débiles"
        }
      },
      {
        name: "Escoliosis postural funcional",
        ageRange: [10, 25],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["estudiante", "adolescente", "deportista unilateral"],
        chiefComplaints: [
          "Desviación lateral de la columna",
          "Asimetría de hombros y pelvis",
          "Dolor dorsal o lumbar unilateral",
          "Una escápula más prominente que otra"
        ],
        onsetTypes: ["gradual durante crecimiento o por hábitos"],
        chronology: [52, 520],
        aggravatingFactors: ["posturas asimétricas", "carga unilateral"],
        relievingFactors: ["corrección activa", "ejercicios simétricos"],
        physicalFindings: {
          palpation: "asimetría muscular paravertebral",
          rom: "asimetría lateral",
          strength: "desequilibrio lateral",
          specialTests: "test Adams: curva desaparece en flexión (no estructural)"
        }
      },
      {
        name: "Síndrome cruzado inferior",
        ageRange: [30, 65],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["oficinista", "conductor", "trabajador sedentario"],
        chiefComplaints: [
          "Dolor lumbar crónico difuso",
          "Rigidez de cadera al levantarse",
          "Postura con pelvis anteriorizada",
          "Dolor al estar de pie o caminar"
        ],
        onsetTypes: ["gradual por sedentarismo y mala postura"],
        chronology: [24, 104],
        aggravatingFactors: ["sedestación prolongada", "bipedestación", "inactividad"],
        relievingFactors: ["ejercicio correctivo", "estiramientos", "fortalecimiento glúteo"],
        physicalFindings: {
          palpation: "tensión lumbar y flexores cadera",
          rom: "limitación extensión cadera",
          strength: "debilidad glúteos y abdominales",
          specialTests: "Thomas test positivo, glúteos débiles, abdominales inhibidos"
        }
      },
      {
        name: "Postura de cabeza adelantada (forward head posture)",
        ageRange: [20, 60],
        genderDistribution: { masculino: 45, femenino: 55 },
        occupations: ["trabajador ordenador", "uso excesivo móvil", "gamer"],
        chiefComplaints: [
          "Dolor cervical y cefaleas frecuentes",
          "Tensión constante en la nuca y hombros",
          "Rigidez cervical al final del día",
          "Sensación de cabeza pesada"
        ],
        onsetTypes: ["gradual por uso prolongado dispositivos"],
        chronology: [12, 104],
        aggravatingFactors: ["ordenador", "móvil", "lectura", "mantener postura fija"],
        relievingFactors: ["retracción cervical", "pausas posturales", "ergonomía"],
        physicalFindings: {
          palpation: "puntos gatillo cervicales posteriores",
          rom: "limitación extensión cervical",
          strength: "debilidad flexores cervicales profundos",
          specialTests: "ángulo craneovertebral <50°, test flexión craneocervical débil"
        }
      },
      {
        name: "Síndrome del hombro redondeado",
        ageRange: [25, 60],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["oficinista", "ciclista", "nadador", "levantador pesas"],
        chiefComplaints: [
          "Hombros caídos hacia adelante",
          "Dolor entre los omóplatos",
          "Dificultad para juntar los omóplatos",
          "Fatiga en hombros y espalda alta"
        ],
        onsetTypes: ["gradual por postura o desequilibrios musculares"],
        chronology: [24, 104],
        aggravatingFactors: ["trabajo de escritorio", "deportes de flexión hombro"],
        relievingFactors: ["estiramientos pectorales", "fortalecimiento escapular"],
        physicalFindings: {
          palpation: "tensión pectorales y trapecio superior",
          rom: "limitación retracción escapular",
          strength: "debilidad romboides y trapecio medio/inferior",
          specialTests: "protracción escapular >3cm, acortamiento pectorales"
        }
      },
      {
        name: "Rectificación cervical",
        ageRange: [25, 60],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["trabajador ordenador", "whiplash previo", "oficinista"],
        chiefComplaints: [
          "Rigidez cervical constante",
          "Dolor cervical difuso",
          "Limitación movimientos cervicales",
          "Cefaleas occipitales frecuentes"
        ],
        onsetTypes: ["gradual por postura o post-traumático"],
        chronology: [12, 520],
        aggravatingFactors: ["postura mantenida", "trabajo ordenador"],
        relievingFactors: ["movilizaciones", "ejercicios restauración lordosis"],
        physicalFindings: {
          palpation: "tensión musculatura cervical generalizada",
          rom: "limitación extensión cervical",
          strength: "variable",
          specialTests: "pérdida lordosis cervical en Rx, rigidez segmentaria"
        }
      },
      {
        name: "Anteversión pélvica excesiva",
        ageRange: [20, 50],
        genderDistribution: { masculino: 35, femenino: 65 },
        occupations: ["bailarina", "gimnasta", "uso tacones", "embarazo"],
        chiefComplaints: [
          "Dolor lumbar bajo constante",
          "Sensación de glúteos prominentes",
          "Rigidez flexores cadera",
          "Dolor lumbar al estar de pie"
        ],
        onsetTypes: ["gradual", "asociado a actividad o factores biomecánicos"],
        chronology: [12, 104],
        aggravatingFactors: ["bipedestación", "extensión lumbar", "tacones"],
        relievingFactors: ["estirar flexores cadera", "fortalecer glúteos y abdominales"],
        physicalFindings: {
          palpation: "tensión psoas y lumbar",
          rom: "limitación extensión cadera",
          strength: "glúteos y abdominales débiles",
          specialTests: "Thomas test positivo, inclinación pélvica anterior >12°"
        }
      },
      {
        name: "Retroversión pélvica excesiva",
        ageRange: [30, 70],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["ciclista", "remero", "trabajador sedentario prolongado"],
        chiefComplaints: [
          "Dolor lumbar y glúteos",
          "Rigidez isquiotibiales",
          "Postura en flexión lumbar",
          "Dificultad para mantener lordosis lumbar"
        ],
        onsetTypes: ["gradual por postura o actividad específica"],
        chronology: [24, 104],
        aggravatingFactors: ["sedestación prolongada", "ciclismo"],
        relievingFactors: ["estirar isquiotibiales", "movilidad extensión lumbar"],
        physicalFindings: {
          palpation: "tensión glúteos e isquiotibiales",
          rom: "limitación extensión lumbar",
          strength: "extensores lumbares débiles",
          specialTests: "SLR limitado bilateralmente, pérdida lordosis lumbar"
        }
      }
    ]
  },

  "disfunciones_atm": {
    name: "Disfunciones Temporomandibulares (ATM)",
    pathologies: [
      {
        name: "Disfunción de ATM por trastorno muscular",
        ageRange: [20, 50],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["estrés laboral", "bruxismo", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor en la mandíbula al masticar",
          "Dolor facial y de cabeza al despertar",
          "Rigidez mandibular por las mañanas",
          "Dolor en los músculos de la cara"
        ],
        onsetTypes: ["gradual", "asociado a estrés o bruxismo"],
        chronology: [4, 52],
        aggravatingFactors: ["masticación", "estrés", "apertura bucal amplia", "noche"],
        relievingFactors: ["calor local", "relajación", "férula de descarga", "dieta blanda"],
        physicalFindings: {
          palpation: "dolor masetero y temporal",
          rom: "apertura bucal <40mm, desviación posible",
          strength: "normal pero doloroso",
          specialTests: "dolor con resistencia cierre mandibular, puntos gatillo masticatorios"
        }
      },
      {
        name: "Desplazamiento discal ATM con reducción",
        ageRange: [20, 45],
        genderDistribution: { masculino: 25, femenino: 75 },
        occupations: ["cualquier ocupación", "traumatismo previo"],
        chiefComplaints: [
          "Chasquido en la mandíbula al abrir la boca",
          "Ruido al masticar que siento y escucho",
          "Sensación de que la mandíbula se engancha",
          "Click audible al bostezar o comer"
        ],
        onsetTypes: ["gradual o post-traumático"],
        chronology: [12, 104],
        aggravatingFactors: ["apertura amplia", "masticación", "bostezar"],
        relievingFactors: ["limitar apertura", "dieta blanda", "automanejo"],
        physicalFindings: {
          palpation: "posible dolor ATM",
          rom: "click reproducible en apertura/cierre, apertura normal o limitada",
          strength: "normal",
          specialTests: "click audible y palpable, reducción disc displacement"
        }
      },
      {
        name: "Desplazamiento discal ATM sin reducción (bloqueo cerrado)",
        ageRange: [25, 50],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["cualquier ocupación", "historia previa de clicks"],
        chiefComplaints: [
          "De repente no puedo abrir bien la boca",
          "Limitación súbita de apertura mandibular",
          "Sensación de bloqueo al intentar abrir la boca",
          "No puedo abrir la boca más de 2-3cm"
        ],
        onsetTypes: ["agudo súbito", "precedido por clicks crónicos"],
        chronology: [0.1, 12],
        aggravatingFactors: ["intentar forzar apertura", "masticación"],
        relievingFactors: ["reposo mandibular", "dieta líquida/blanda"],
        physicalFindings: {
          palpation: "dolor ATM",
          rom: "limitación severa apertura <30mm, desviación hacia lado afecto",
          strength: "normal",
          specialTests: "bloqueo mecánico, sin click, desviación mandibular"
        }
      },
      {
        name: "Artritis/Artrosis de ATM",
        ageRange: [45, 75],
        genderDistribution: { masculino: 40, femenino: 60 },
        occupations: ["cualquier ocupación", "degenerativo", "artritis reumatoide"],
        chiefComplaints: [
          "Dolor y rigidez en la articulación de la mandíbula",
          "Crepitación al mover la mandíbula",
          "Dolor que empeora con el uso",
          "Rigidez matutina de la mandíbula"
        ],
        onsetTypes: ["gradual progresivo años"],
        chronology: [52, 520],
        aggravatingFactors: ["masticación prolongada", "alimentos duros", "movimientos mandibulares"],
        relievingFactors: ["reposo", "calor", "antiinflamatorios", "dieta blanda"],
        physicalFindings: {
          palpation: "dolor ATM, crepitación palpable",
          rom: "crepitación, posible limitación",
          strength: "normal o débil",
          specialTests: "crepitación fina bilateral, cambios degenerativos"
        }
      },
      {
        name: "Bruxismo (apretamiento/rechinamiento)",
        ageRange: [20, 55],
        genderDistribution: { masculino: 40, femenino: 60 },
        occupations: ["estrés laboral", "ansiedad", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor facial y mandibular al despertar",
          "Desgaste dental y sensibilidad",
          "Cefaleas tensionales frecuentes",
          "Dolor y fatiga muscular facial"
        ],
        onsetTypes: ["gradual", "asociado a estrés"],
        chronology: [12, 104],
        aggravatingFactors: ["estrés", "noche", "ansiedad", "cafeína"],
        relievingFactors: ["férula de descarga", "manejo estrés", "relajación"],
        physicalFindings: {
          palpation: "hipertrofia masetero, dolor músculos masticación",
          rom: "puede ser normal o limitado",
          strength: "músculos masticatorios hipertónicos",
          specialTests: "facetas desgaste dental, línea alba mucosa yugal"
        }
      },
      {
        name: "Luxación de ATM (dislocación aguda)",
        ageRange: [18, 50],
        genderDistribution: { masculino: 45, femenino: 55 },
        occupations: ["cualquier ocupación", "hiperlaxitud"],
        chiefComplaints: [
          "La mandíbula se me quedó trabada abierta",
          "No puedo cerrar la boca tras bostezar",
          "Boca abierta que no puedo cerrar",
          "Dolor intenso con mandíbula bloqueada abierta"
        ],
        onsetTypes: ["agudo súbito tras apertura amplia"],
        chronology: [0.01, 0.5],
        aggravatingFactors: ["apertura amplia", "bostezo", "procedimientos dentales"],
        relievingFactors: ["reducción manual urgente"],
        physicalFindings: {
          palpation: "cóndilos palpables anterior a eminencia",
          rom: "boca bloqueada abierta",
          strength: "no evaluable",
          specialTests: "deformidad evidente, cóndilos luxados anteriormente"
        }
      },
      {
        name: "Capsulitis/Sinovitis de ATM",
        ageRange: [20, 60],
        genderDistribution: { masculino: 35, femenino: 65 },
        occupations: ["post-traumático", "sobrecarga", "infección dental"],
        chiefComplaints: [
          "Dolor constante en la articulación de la mandíbula",
          "Dolor que empeora con cualquier movimiento mandibular",
          "Hinchazón y sensibilidad en la ATM",
          "Dolor intenso incluso en reposo"
        ],
        onsetTypes: ["agudo o subagudo", "post-traumático o infeccioso"],
        chronology: [0.5, 8],
        aggravatingFactors: ["cualquier movimiento mandibular", "masticación", "hablar"],
        relievingFactors: ["reposo absoluto mandibular", "antiinflamatorios", "dieta líquida"],
        physicalFindings: {
          palpation: "dolor exquisito ATM, posible edema",
          rom: "limitación por dolor intenso",
          strength: "difícil evaluar por dolor",
          specialTests: "dolor con carga articular, signo de la cápsula positivo"
        }
      },
      {
        name: "Hipermovilidad de ATM",
        ageRange: [18, 45],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["hiperlaxitud ligamentosa", "Ehlers-Danlos", "cualquier ocupación"],
        chiefComplaints: [
          "La mandíbula se me sale fácilmente",
          "Apertura bucal excesiva con dolor posterior",
          "Subluxaciones frecuentes de la mandíbula",
          "Sensación de inestabilidad mandibular"
        ],
        onsetTypes: ["crónico recurrente"],
        chronology: [52, 520],
        aggravatingFactors: ["apertura amplia", "bostezo", "ciertas posiciones"],
        relievingFactors: ["limitar apertura", "educación", "fortalecimiento"],
        physicalFindings: {
          palpation: "normal o hipersensibilidad",
          rom: "apertura excesiva >55mm, subluxación palpable",
          strength: "normal",
          specialTests: "hipermovilidad, test Beighton positivo, subluxación reproducible"
        }
      },
      {
        name: "Dolor miofascial de músculos masticatorios",
        ageRange: [25, 60],
        genderDistribution: { masculino: 30, femenino: 70 },
        occupations: ["estrés", "postura cervical alterada", "cualquier ocupación"],
        chiefComplaints: [
          "Dolor referido a cabeza, oído y cuello desde mandíbula",
          "Dolor facial difuso y cefaleas",
          "Puntos dolorosos en músculos de la cara",
          "Dolor que se irradia desde la mandíbula"
        ],
        onsetTypes: ["gradual", "asociado a estrés o postura"],
        chronology: [8, 104],
        aggravatingFactors: ["masticación", "estrés", "postura", "actividad muscular"],
        relievingFactors: ["masaje", "liberación puntos gatillo", "calor"],
        physicalFindings: {
          palpation: "múltiples puntos gatillo masetero, temporal, pterigoideo",
          rom: "puede estar limitado por dolor",
          strength: "normal",
          specialTests: "puntos gatillo reproducen dolor referido característico"
        }
      },
      {
        name: "Disfunción ATM postural (asociada a cervical)",
        ageRange: [25, 60],
        genderDistribution: { masculino: 40, femenino: 60 },
        occupations: ["trabajador ordenador", "postura cabeza adelantada", "oficinista"],
        chiefComplaints: [
          "Dolor mandibular asociado a dolor cervical",
          "Tensión facial y cuello simultánea",
          "Dolor ATM que empeora con postura de trabajo",
          "Rigidez cervical y mandibular combinada"
        ],
        onsetTypes: ["gradual por mala postura"],
        chronology: [12, 104],
        aggravatingFactors: ["trabajo ordenador", "postura mantenida", "estrés"],
        relievingFactors: ["corrección postural", "tratamiento cervical y ATM"],
        physicalFindings: {
          palpation: "dolor ATM y musculatura cervical",
          rom: "limitación cervical y mandibular",
          strength: "debilidad cervical asociada",
          specialTests: "postura cabeza adelantada, relación ATM-cervical evidente"
        }
      }
    ]
  },

  "lesiones_deportivas": {
    name: "Lesiones Deportivas",
    pathologies: [
      {
        name: "Rotura fibrilar gemelo (grado II)",
        ageRange: [25, 50],
        genderDistribution: { masculino: 70, femenino: 30 },
        occupations: ["futbolista", "corredor", "tenista", "basquetbolista"],
        chiefComplaints: [
          "Dolor súbito en la pantorrilla como un latigazo",
          "Sentí que me dieron un piedrazo en la pierna",
          "No puedo apoyar el pie, dolor intenso en gemelo",
          "Hinchazón y moratón en la pantorrilla"
        ],
        onsetTypes: ["agudo durante sprint o cambio dirección"],
        chronology: [0.01, 8],
        aggravatingFactors: ["apoyo", "flexión plantar", "estiramiento", "contracción"],
        relievingFactors: ["reposo", "elevación", "hielo", "descarga"],
        physicalFindings: {
          palpation: "dolor intenso, defecto palpable gemelo, hematoma",
          rom: "limitación severa dorsiflexión",
          strength: "imposible o muy débil flexión plantar",
          specialTests: "Thompson test puede ser negativo, equimosis, edema importante"
        }
      },
      {
        name: "Rotura fibrilar isquiotibial (grado II)",
        ageRange: [20, 45],
        genderDistribution: { masculino: 75, femenino: 25 },
        occupations: ["velocista", "futbolista", "jugador fútbol americano", "atleta"],
        chiefComplaints: [
          "Dolor agudo en la parte posterior del muslo al correr",
          "Chasquido doloroso en la pierna al acelerar",
          "No puedo estirar la pierna del dolor",
          "Hematoma visible en el muslo posterior"
        ],
        onsetTypes: ["agudo durante sprint o estiramiento excesivo"],
        chronology: [0.01, 12],
        aggravatingFactors: ["extensión cadera", "flexión rodilla contra resistencia", "estiramiento"],
        relievingFactors: ["reposo", "flexión rodilla", "hielo"],
        physicalFindings: {
          palpation: "dolor intenso, posible defecto, hematoma extenso",
          rom: "limitación severa SLR",
          strength: "debilidad severa flexión rodilla",
          specialTests: "test Askling positivo, equimosis, dolor intenso estiramiento pasivo"
        }
      },
      {
        name: "Esguince de ligamento lateral externo rodilla (grado II)",
        ageRange: [18, 40],
        genderDistribution: { masculino: 70, femenino: 30 },
        occupations: ["futbolista", "esquiador", "jugador rugby", "deportista contacto"],
        chiefComplaints: [
          "Dolor en el lateral externo de la rodilla tras un golpe",
          "Sensación de inestabilidad lateral de la rodilla",
          "Hinchazón y dolor en la parte externa de la rodilla",
          "La rodilla cede hacia afuera al caminar"
        ],
        onsetTypes: ["agudo traumático por estrés en varo"],
        chronology: [0.1, 12],
        aggravatingFactors: ["estrés en varo", "caminar terreno irregular", "giros"],
        relievingFactors: ["rodillera", "reposo", "evitar estrés lateral"],
        physicalFindings: {
          palpation: "dolor trayecto LLE",
          rom: "normal o ligeramente limitado por dolor",
          strength: "normal",
          specialTests: "estrés en varo 30° positivo moderado, edema lateral"
        }
      },
      {
        name: "Periostitis tibial (shin splints)",
        ageRange: [18, 40],
        genderDistribution: { masculino: 50, femenino: 50 },
        occupations: ["corredor", "militar", "bailarín", "deportista de impacto"],
        chiefComplaints: [
          "Dolor en la cara interna de la espinilla al correr",
          "Dolor que empeora durante el ejercicio",
          "Sensibilidad a lo largo del borde de la tibia",
          "Dolor que mejora con reposo pero vuelve al correr"
        ],
        onsetTypes: ["gradual por sobrecarga repetitiva"],
        chronology: [2, 12],
        aggravatingFactors: ["correr", "saltos", "impacto", "actividad repetitiva"],
        relievingFactors: ["reposo", "hielo", "modificar entreno", "calzado adecuado"],
        physicalFindings: {
          palpation: "dolor difuso borde posteromedial tibia distal",
          rom: "normal",
          strength: "normal",
          specialTests: "dolor palpación >5cm borde tibial, no focal"
        }
      },
      {
        name: "Pubalgia del deportista (athletic groin pain)",
        ageRange: [20, 40],
        genderDistribution: { masculino: 90, femenino: 10 },
        occupations: ["futbolista", "jugador hockey", "tenista", "deportes con giros"],
        chiefComplaints: [
          "Dolor en la ingle al chutar o cambiar de dirección",
          "Dolor inguinal que no mejora con reposo",
          "Dolor en la zona púbica que empeora con deporte",
          "Molestia constante en la ingle y pubis"
        ],
        onsetTypes: ["gradual por sobrecarga", "asociado a deporte de alta demanda"],
        chronology: [4, 52],
        aggravatingFactors: ["chut", "sprint", "cambios dirección", "aducción contra resistencia"],
        relievingFactors: ["reposo", "modificar actividad", "fortalecimiento core"],
        physicalFindings: {
          palpation: "dolor pubis, aductores, pared abdominal baja",
          rom: "dolor abducción pasiva cadera",
          strength: "débil aductores, dolor con resistencia",
          specialTests: "squeeze test positivo, dolor aducción y sit-up"
        }
      },
      {
        name: "Condropatía condral rodilla post-traumática",
        ageRange: [20, 45],
        genderDistribution: { masculino: 65, femenino: 35 },
        occupations: ["futbolista", "esquiador", "deportista contacto", "traumatismo previo"],
        chiefComplaints: [
          "Dolor profundo en la rodilla tras una lesión",
          "Hinchazón recurrente de la rodilla",
          "Sensación de enganche o cuerpo extraño",
          "Dolor que no mejora meses después de la lesión"
        ],
        onsetTypes: ["post-traumático, meses después lesión"],
        chronology: [12, 104],
        aggravatingFactors: ["carga", "flexión profunda", "actividad deportiva"],
        relievingFactors: ["descarga parcial", "modificar actividad"],
        physicalFindings: {
          palpation: "derrame variable",
          rom: "puede ser normal o doloroso extremos",
          strength: "inhibición muscular",
          specialTests: "test compresión doloroso, derrame recurrente"
        }
      },
      {
        name: "Rotura del músculo recto anterior del cuádriceps",
        ageRange: [20, 40],
        genderDistribution: { masculino: 85, femenino: 15 },
        ocupations: ["futbolista", "velocista", "saltador", "deportista explosivo"],
        chiefComplaints: [
          "Dolor agudo en el muslo al chutar o esprintar",
          "Sentí un desgarro en la parte anterior del muslo",
          "Hematoma visible en el cuádriceps",
          "Debilidad para extender la rodilla"
        ],
        onsetTypes: ["agudo durante contracción explosiva"],
        chronology: [0.01, 12],
        aggravatingFactors: ["extensión rodilla", "flexión cadera contra resistencia"],
        relievingFactors: ["reposo", "flexión rodilla", "hielo"],
        physicalFindings: {
          palpation: "dolor intenso, posible defecto, hematoma",
          rom: "dolor flexión rodilla pasiva",
          strength: "debilidad severa extensión rodilla",
          specialTests: "defecto palpable, equimosis extensa"
        }
      },
      {
        name: "Rotura del ligamento deltoideo tobillo",
        ageRange: [18, 40],
        genderDistribution: { masculino: 70, femenino: 30 },
        ocupations: ["futbolista", "basquetbolista", "deportista", "traumatismo eversión"],
        chiefComplaints: [
          "Dolor intenso en el tobillo interno tras torcedura",
          "Hinchazón severa del tobillo por dentro",
          "No puedo apoyar el pie tras la lesión",
          "Dolor muy intenso en la parte interna del tobillo"
        ],
        onsetTypes: ["agudo traumático por eversión forzada"],
        chronology: [0.1, 12],
        aggravatingFactors: ["apoyo", "eversión", "caminar"],
        relievingFactors: ["reposo", "elevación", "inmovilización", "hielo"],
        physicalFindings: {
          palpation: "dolor intenso maléolo medial y ligamento deltoideo",
          rom: "limitado por dolor e hinchazón severa",
          strength: "imposible evaluar",
          specialTests: "test eversión muy doloroso, edema masivo medial"
        }
      },
      {
        name: "Luxación de hombro anterior recidivante",
        ageRange: [18, 35],
        genderDistribution: { masculino: 80, femenino: 20 },
        ocupations: ["jugador rugby", "deportista contacto", "nadador", "lanzador"],
        chiefComplaints: [
          "El hombro se me sale con frecuencia",
          "Miedo constante a que se me luxe el hombro",
          "Episodios repetidos de luxación con mínimo trauma",
          "Sensación de inestabilidad al lanzar o nadar"
        ],
        onsetTypes: ["tras luxación traumática inicial"],
        chronology: [12, 520],
        aggravatingFactors: ["abducción + rotación externa", "lanzamiento", "contacto"],
        relievingFactors: ["evitar posiciones de riesgo", "fortalecimiento"],
        physicalFindings: {
          palpation: "normal entre episodios",
          rom: "completo con aprensión marcada",
          strength: "puede ser normal o débil",
          specialTests: "apprehension test muy positivo, relocation test positivo, múltiples episodios"
        }
      },
      {
        name: "Fractura de estrés del 5º metatarsiano (fractura de Jones)",
        ageRange: [20, 40],
        genderDistribution: { masculino: 60, femenino: 40 },
        ocupations: ["basquetbolista", "bailarín", "deportista", "militar"],
        chiefComplaints: [
          "Dolor en el lateral del pie que no mejora",
          "Dolor progresivo en el borde externo del pie",
          "Dolor que empeora con actividad de impacto",
          "Hinchazón persistente en el lateral del pie"
        ],
        onsetTypes: ["gradual por sobrecarga repetitiva"],
        chronology: [4, 24],
        aggravatingFactors: ["apoyo", "correr", "saltos", "inversión"],
        relievingFactors: ["descarga completa", "bota walker"],
        physicalFindings: {
          palpation: "dolor muy localizado base 5º metatarsiano",
          rom: "normal",
          strength: "doloroso",
          specialTests: "hop test imposible, edema localizado, diapasón positivo"
        }
      }
    ]
  }
};

// Función auxiliar para elegir un elemento aleatorio
function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Función auxiliar para generar entero dentro de rango
function randomInt(min: number, max: number): number {
  const safeMin = Math.ceil(min);
  const safeMax = Math.floor(max);
  return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
}

// Convierte semanas decimales en texto temporal más útil
function formatChronology(weeks: number): string {
  if (weeks < 1) {
    const days = Math.max(1, Math.round(weeks * 7));
    return `${days} días`;
  }
  if (weeks < 5) {
    return `${Math.round(weeks)} semanas`;
  }
  const months = Math.max(1, Math.round(weeks / 4));
  if (months < 12) {
    return `${months} meses`;
  }
  const years = Math.max(1, Math.round(months / 12));
  return `${years} años`;
}

// Soporta occupations y también ocupations
function getOccupations(pathology: any): string[] {
  if (Array.isArray(pathology.occupations) && pathology.occupations.length > 0) {
    return pathology.occupations;
  }
  if (Array.isArray(pathology.ocupations) && pathology.ocupations.length > 0) {
    return pathology.ocupations;
  }
  return ['cualquier ocupación'];
}

function inferSeverity(pathologyName: string, onsetType: string): 'leve' | 'moderada' | 'alta' {
  const text = `${pathologyName} ${onsetType}`.toLowerCase();

  if (
    text.includes('fractura') ||
    text.includes('rotura') ||
    text.includes('luxación') ||
    text.includes('luxacion') ||
    text.includes('bloqueo') ||
    text.includes('agudo') ||
    text.includes('latigazo')
  ) {
    return 'alta';
  }

  if (
    text.includes('hernia') ||
    text.includes('radiculopat') ||
    text.includes('capsulitis') ||
    text.includes('artrosis') ||
    text.includes('estenosis') ||
    text.includes('esguince')
  ) {
    return 'moderada';
  }

  return 'leve';
}

function inferIrritability(
  onsetType: string,
  aggravatingFactors: string[]
): 'baja' | 'media' | 'alta' {
  const text = `${onsetType} ${aggravatingFactors.join(' ')}`.toLowerCase();

  if (
    text.includes('agudo') ||
    text.includes('súbito') ||
    text.includes('subito') ||
    text.includes('traumát') ||
    text.includes('traumat') ||
    text.includes('todos los movimientos') ||
    text.includes('cualquier movimiento')
  ) {
    return 'alta';
  }

  if (
    text.includes('sobrecarga') ||
    text.includes('repetitiva') ||
    text.includes('progresivo') ||
    text.includes('gradual')
  ) {
    return 'media';
  }

  return 'baja';
}

function inferPainProfile(pathologyName: string, aggravatingFactors: string[]): string {
  const text = `${pathologyName} ${aggravatingFactors.join(' ')}`.toLowerCase();

  if (
    text.includes('radiculopat') ||
    text.includes('túnel carpiano') ||
    text.includes('tunel carpiano') ||
    text.includes('desfiladero') ||
    text.includes('hormigueo') ||
    text.includes('quemazón') ||
    text.includes('quemazon')
  ) {
    return 'neural';
  }

  if (
    text.includes('artritis') ||
    text.includes('anquilosante') ||
    text.includes('sinovitis') ||
    text.includes('capsulitis')
  ) {
    return 'inflamatorio_mixto';
  }

  return 'mecanico';
}

function buildFunctionalLimitations(
  chiefComplaint: string,
  aggravatingFactors: string[]
): string[] {
  const text = `${chiefComplaint} ${aggravatingFactors.join(' ')}`.toLowerCase();
  const limitations: string[] = [];

  if (text.includes('escaleras')) limitations.push('subir o bajar escaleras');
  if (text.includes('sentado') || text.includes('sedestación') || text.includes('sedestacion')) {
    limitations.push('estar sentado mucho rato');
  }
  if (text.includes('overhead') || text.includes('altura') || text.includes('levantar el brazo')) {
    limitations.push('alcanzar objetos en alto');
  }
  if (text.includes('caminar') || text.includes('apoyo')) limitations.push('caminar con normalidad');
  if (text.includes('correr')) limitations.push('correr o hacer deporte');
  if (text.includes('mastic')) limitations.push('masticar con normalidad');
  if (text.includes('noche') || text.includes('dormir')) limitations.push('dormir cómodo');
  if (
    text.includes('ordenador') ||
    text.includes('móvil') ||
    text.includes('movil') ||
    text.includes('teclear')
  ) {
    limitations.push('trabajar con ordenador o usar la mano repetidamente');
  }

  if (limitations.length === 0) {
    limitations.push('hacer sus actividades diarias con normalidad');
  }

  return [...new Set(limitations)].slice(0, 3);
}

function generatePatientName(gender: string): string {
  const maleNames = [
    'Carlos', 'Javier', 'Miguel', 'Antonio', 'José', 'Francisco', 'Manuel',
    'David', 'Alejandro', 'Pablo', 'Jorge', 'Fernando', 'Luis', 'Pedro', 'Ángel'
  ];

  const femaleNames = [
    'María', 'Carmen', 'Isabel', 'Ana', 'Laura', 'Lucía', 'Marta',
    'Elena', 'Sara', 'Paula', 'Cristina', 'Rosa', 'Pilar', 'Teresa', 'Raquel'
  ];

  const lastNames = [
    'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez',
    'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández',
    'Díaz', 'Moreno', 'Álvarez', 'Romero', 'Torres', 'Ramírez', 'Gil'
  ];

  const firstName =
    gender === 'Masculino' ? pickRandom(maleNames) : pickRandom(femaleNames);

  return `${firstName} ${pickRandom(lastNames)}`;
}

function generateInitialPatientLine(patientName: string, chiefComplaint: string): string {
  const intros = [
    `Hola, soy ${patientName}.`,
    `Buenas, me llamo ${patientName}.`,
    `Hola, soy ${patientName} y vengo porque...`,
  ];

  return `${pickRandom(intros)} ${chiefComplaint}.`;
}

// Función para generar un caso aleatorio basado en una patología
export function generateCaseFromTemplate(frameworkKey: string, pathologyIndex?: number) {
  const framework = PATHOLOGY_FRAMEWORKS[frameworkKey];
  if (!framework) return null;

  const selectedPathology =
    pathologyIndex !== undefined
      ? framework.pathologies[pathologyIndex]
      : pickRandom(framework.pathologies);

  if (!selectedPathology) return null;

  const age = randomInt(
    selectedPathology.ageRange[0],
    selectedPathology.ageRange[1]
  );

  const genderRoll = Math.random() * 100;
  const gender =
    genderRoll < selectedPathology.genderDistribution.femenino
      ? 'Femenino'
      : 'Masculino';

  const patientName = generatePatientName(gender);
  const chiefComplaint = pickRandom(selectedPathology.chiefComplaints);
  const occupations = getOccupations(selectedPathology);
  const occupation = pickRandom(occupations);

  const chronologyWeeksRaw =
    Math.random() *
      (selectedPathology.chronology[1] - selectedPathology.chronology[0]) +
    selectedPathology.chronology[0];

  const chronologyWeeks = Number(chronologyWeeksRaw.toFixed(1));
  const chronologyLabel = formatChronology(chronologyWeeks);

  const onsetType = pickRandom(selectedPathology.onsetTypes);
  const aggravatingFactors = selectedPathology.aggravatingFactors || [];
  const relievingFactors = selectedPathology.relievingFactors || [];
  const physicalFindings = selectedPathology.physicalFindings || {};

  const severity = inferSeverity(selectedPathology.name, onsetType);
  const irritability = inferIrritability(onsetType, aggravatingFactors);
  const painProfile = inferPainProfile(selectedPathology.name, aggravatingFactors);
  const functionalLimitations = buildFunctionalLimitations(
    chiefComplaint,
    aggravatingFactors
  );

  const initialPatientLine = generateInitialPatientLine(patientName, chiefComplaint);

  return {
    id: Date.now().toString(),
    date: new Date().toLocaleDateString('es-ES'),
    patientName,
    age,
    gender,
    occupation,
    chiefComplaint,
    pathology: selectedPathology.name,
    framework: framework.name,

    // mensaje inicial usable directamente si quieres
    initialPatientLine,

    // información clínica interna para motor IA
    clinicalDetails: {
      onsetType,
      chronologyWeeks,
      chronologyLabel,
      aggravatingFactors,
      relievingFactors,
      physicalFindings,
      severity,
      irritability,
      painProfile,
      functionalLimitations,
    }
  };
}

// Función para obtener un caso de un marco específico
export function generateCaseFromFramework(frameworkKey: string) {
  return generateCaseFromTemplate(frameworkKey);
}

// Función para obtener todos los marcos disponibles
export function getAllFrameworks() {
  return Object.keys(PATHOLOGY_FRAMEWORKS).map((key) => ({
    key,
    name: PATHOLOGY_FRAMEWORKS[key].name,
    pathologyCount: PATHOLOGY_FRAMEWORKS[key].pathologies.length
  }));
}
