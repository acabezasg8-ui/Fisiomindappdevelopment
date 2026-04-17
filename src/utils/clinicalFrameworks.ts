// Frameworks clínicos predefinidos para generar casos variados

export type ClinicalFramework = {
  id: string;
  pathology: string;
  chiefComplaintTemplates: string[];
  ageRange: { min: number; max: number };
  genderOptions: string[];
  occupationOptions: string[];
  onsetTypeOptions: string[];
  chronologyWeeksRange: { min: number; max: number };
  aggravatingFactorsOptions: string[][];
  relievingFactorsOptions: string[][];
  physicalFindings: {
    palpationOptions: string[];
    romOptions: string[];
    strengthOptions: string[];
    specialTestsOptions: string[];
  };
};

export const CLINICAL_FRAMEWORKS: ClinicalFramework[] = [
  // 1. Lumbalgia mecánica
  {
    id: 'lumbar-mechanical',
    pathology: 'Lumbalgia mecánica',
    chiefComplaintTemplates: [
      'tengo un dolor en la espalda baja que no se me quita',
      'me duele mucho la zona lumbar',
      'llevo días con dolor en la parte baja de la espalda',
      'tengo molestias en la zona lumbar que me están limitando'
    ],
    ageRange: { min: 25, max: 55 },
    genderOptions: ['Masculino', 'Femenino'],
    occupationOptions: [
      'Oficinista',
      'Conductor',
      'Enfermero/a',
      'Profesor/a',
      'Administrativo/a',
      'Diseñador/a gráfico',
      'Programador/a',
      'Cajero/a de supermercado'
    ],
    onsetTypeOptions: [
      'gradual tras sobrecarga postural',
      'agudo tras levantar peso de forma incorrecta',
      'gradual tras largas horas sentado/a',
      'tras movimiento brusco de torsión'
    ],
    chronologyWeeksRange: { min: 1, max: 6 },
    aggravatingFactorsOptions: [
      ['sedestación prolongada >30 min', 'flexión de tronco', 'levantarse tras estar sentado', 'por la mañana al despertar'],
      ['estar de pie mucho tiempo', 'flexión anterior', 'toser o estornudar', 'movimientos de rotación'],
      ['permanecer en la misma posición', 'agacharse', 'cargar peso', 'final del día']
    ],
    relievingFactorsOptions: [
      ['reposo en decúbito', 'caminar', 'calor local', 'cambios posturales frecuentes'],
      ['estiramientos suaves', 'aplicación de calor', 'movimiento moderado', 'analgésicos'],
      ['decúbito lateral con cojín entre piernas', 'paseos cortos', 'ejercicios suaves', 'relajación muscular']
    ],
    physicalFindings: {
      palpationOptions: [
        'contractura musculatura paravertebral lumbar bilateral',
        'dolor a palpación de paravertebrales L3-L5',
        'tensión muscular lumbar difusa con puntos gatillo'
      ],
      romOptions: [
        'flexión lumbar limitada por dolor (dedos a 20cm suelo), extensión y rotaciones conservadas',
        'flexión limitada a 50%, extensión dolorosa al final del rango',
        'movimientos completos pero con dolor difuso en flexión'
      ],
      strengthOptions: [
        'fuerza conservada en extremidades inferiores',
        'fuerza muscular 5/5 en ambas extremidades inferiores',
        'sin déficits neurológicos en miembros inferiores'
      ],
      specialTestsOptions: [
        'test elevación pierna recta negativo bilateral, no signos neurológicos',
        'Lasègue negativo, reflejos conservados y simétricos',
        'no datos de compromiso radicular, sensibilidad conservada'
      ]
    }
  },

  // 2. Radiculopatía lumbar leve
  {
    id: 'lumbar-radiculopathy',
    pathology: 'Radiculopatía lumbar leve (L5-S1)',
    chiefComplaintTemplates: [
      'tengo dolor en la espalda que me baja por la pierna',
      'me duele la espalda y noto hormigueo en la pierna',
      'tengo un dolor que empieza en la lumbar y llega hasta el pie',
      'dolor lumbar con molestias que se irradian hacia la pierna'
    ],
    ageRange: { min: 35, max: 60 },
    genderOptions: ['Masculino', 'Femenino'],
    occupationOptions: [
      'Almacenista',
      'Repartidor/a',
      'Jardinero/a',
      'Personal de limpieza',
      'Mecánico/a',
      'Electricista',
      'Peluquero/a'
    ],
    onsetTypeOptions: [
      'agudo tras esfuerzo de carga',
      'gradual tras episodio previo de lumbalgia',
      'agudo tras flexión mantenida',
      'progresivo en últimas semanas'
    ],
    chronologyWeeksRange: { min: 2, max: 8 },
    aggravatingFactorsOptions: [
      ['flexión de tronco', 'toser o estornudar', 'sedestación prolongada', 'Valsalva'],
      ['bipedestación prolongada', 'caminar distancias largas', 'extensión lumbar', 'rotación'],
      ['levantarse de la cama', 'ponerse calcetines', 'estar sentado >30min', 'conducir']
    ],
    relievingFactorsOptions: [
      ['decúbito lateral', 'caminar despacio', 'evitar flexión', 'posición fetal'],
      ['reposo relativo', 'cambios posturales', 'calor local', 'antiinflamatorios'],
      ['estiramientos suaves', 'postura semiflexión', 'analgesia', 'tracción suave']
    ],
    physicalFindings: {
      palpationOptions: [
        'dolor paravertebral L4-L5-S1, sin déficit motor significativo',
        'tensión paravertebral con dolor referido a glúteo',
        'contractura muscular lumbar baja con irradiación'
      ],
      romOptions: [
        'flexión limitada con aumento del dolor irradiado',
        'flexión y extensión dolorosas, lateralización conservada',
        'movimientos lumbares restringidos por dolor'
      ],
      strengthOptions: [
        'fuerza conservada, leve debilidad en flexión dorsal del pie',
        'fuerza 4+/5 en extensión del hallux',
        'fuerza prácticamente normal con molestia al test repetitivo'
      ],
      specialTestsOptions: [
        'Lasègue positivo a 45-50° con dolor irradiado, reflejos aquíleos disminuidos',
        'elevación pierna recta limitada, slump test positivo',
        'test de tensión neural positivo, sensibilidad levemente alterada en L5-S1'
      ]
    }
  },

  // 3. Síndrome subacromial
  {
    id: 'subacromial-syndrome',
    pathology: 'Síndrome subacromial',
    chiefComplaintTemplates: [
      'me duele el hombro y no puedo levantar el brazo bien',
      'tengo dolor en el hombro al intentar alcanzar cosas',
      'dolor en el hombro que me molesta especialmente al dormir',
      'me duele el hombro cuando levanto el brazo hacia el lado'
    ],
    ageRange: { min: 35, max: 60 },
    genderOptions: ['Masculino', 'Femenino'],
    occupationOptions: [
      'Pintor/a',
      'Profesor/a',
      'Peluquero/a',
      'Electricista',
      'Fisioterapeuta',
      'Almacenista',
      'Limpiador/a de cristales'
    ],
    onsetTypeOptions: [
      'agudo tras cargar cajas pesadas por encima de la cabeza',
      'gradual tras actividad repetitiva overhead',
      'tras pintar el techo durante varios días',
      'progresivo por movimientos repetitivos en el trabajo'
    ],
    chronologyWeeksRange: { min: 2, max: 10 },
    aggravatingFactorsOptions: [
      ['elevar brazo lateralmente', 'alcanzar objetos en alto', 'dormir sobre ese hombro', 'movimientos overhead'],
      ['peinarse', 'ponerse la chaqueta', 'alcanzar el cinturón de seguridad', 'trabajos por encima del hombro'],
      ['abducción repetitiva', 'llevar bolsas pesadas', 'empujar puertas', 'actividades overhead']
    ],
    relievingFactorsOptions: [
      ['brazo en reposo pegado al cuerpo', 'hielo local', 'evitar elevación', 'antiinflamatorios'],
      ['reposo relativo', 'aplicación de frío', 'posición neutra del hombro', 'analgesia'],
      ['evitar overhead', 'calor/frío según fase', 'movimientos pendulares suaves', 'modificación actividades']
    ],
    physicalFindings: {
      palpationOptions: [
        'dolor en espacio subacromial y troquíter',
        'punto doloroso en inserción supraespinoso',
        'dolor a palpación de bursa subacromial'
      ],
      romOptions: [
        'arco doloroso 60-120° abducción, abducción pasiva completa pero dolorosa',
        'limitación dolorosa en abducción activa, rotación externa levemente limitada',
        'rango completo pasivo, activo limitado por dolor en arco medio'
      ],
      strengthOptions: [
        'debilidad dolorosa en abducción y rotación externa',
        'fuerza 4/5 en abducción por dolor, rotadores conservados',
        'debilidad relativa en test de Jobe, fuerza aceptable en otros movimientos'
      ],
      specialTestsOptions: [
        'Test de Neer positivo, Hawkins-Kennedy positivo, Jobe doloroso',
        'arco doloroso presente, test de Neer +, palpación subacromial dolorosa',
        'Hawkins-Kennedy +, Yocum +, test compresión subacromial reproduce síntomas'
      ]
    }
  },

  // 4. Tendinopatía rotuliana
  {
    id: 'patellar-tendinopathy',
    pathology: 'Tendinopatía rotuliana',
    chiefComplaintTemplates: [
      'tengo dolor en la parte de abajo de la rótula cuando salto',
      'me duele justo debajo de la rótula al hacer deporte',
      'dolor en el tendón rotuliano que me limita para entrenar',
      'tengo molestias en la rodilla debajo de la rótula'
    ],
    ageRange: { min: 18, max: 40 },
    genderOptions: ['Masculino', 'Femenino'],
    occupationOptions: [
      'Jugador/a de baloncesto',
      'Jugador/a de voleibol',
      'Corredor/a',
      'Estudiante de educación física',
      'Monitor/a deportivo',
      'Deportista amateur',
      'Entrenador/a personal'
    ],
    onsetTypeOptions: [
      'gradual tras aumentar volumen de saltos',
      'progresivo durante pretemporada deportiva',
      'tras incrementar carga de entrenamiento',
      'inicio insidioso durante fase de competición'
    ],
    chronologyWeeksRange: { min: 3, max: 12 },
    aggravatingFactorsOptions: [
      ['saltos', 'bajada de escaleras', 'sentadillas profundas', 'carreras con cambios de dirección'],
      ['aterrizajes', 'deporte con saltos', 'subir/bajar escaleras', 'permanecer sentado largo rato'],
      ['actividades pliométricas', 'aceleraciones bruscas', 'frenadas en carrera', 'posición de cuclillas']
    ],
    relievingFactorsOptions: [
      ['reposo deportivo', 'hielo post-actividad', 'evitar saltos', 'calentamiento progresivo'],
      ['reducción de carga', 'aplicación de frío', 'ejercicios excéntricos graduales', 'vendaje rotuliano'],
      ['modificar actividad', 'crioterapia', 'estiramientos de cuádriceps', 'fortalecimiento controlado']
    ],
    physicalFindings: {
      palpationOptions: [
        'dolor localizado en polo inferior rótula e inserción tendón rotuliano',
        'punto doloroso preciso en tercio proximal tendón rotuliano',
        'engrosamiento palpable del tendón con dolor a presión'
      ],
      romOptions: [
        'rango articular completo, dolor al final de flexión por tensión tendinosa',
        'flexo-extensión completa, molestia en flexión máxima',
        'movilidad conservada con molestia en rangos extremos de flexión'
      ],
      strengthOptions: [
        'fuerza cuádriceps conservada pero dolorosa en tests isométricos',
        'dolor en contracción contra resistencia del cuádriceps',
        'fuerza normal con molestia al test isométrico de extensión'
      ],
      specialTestsOptions: [
        'dolor a palpación polo inferior rótula, test de decline squat positivo',
        'single leg decline squat reproduce dolor, Victorian Institute test positivo',
        'dolor en test de sentadilla monopodal, palpación tendón rotuliano sensible'
      ]
    }
  },

  // 5. Síndrome femoropatelar
  {
    id: 'patellofemoral-syndrome',
    pathology: 'Síndrome femoropatelar',
    chiefComplaintTemplates: [
      'tengo dolor en la rodilla que me está limitando para correr',
      'me duele la parte delantera de la rodilla al bajar escaleras',
      'dolor difuso en la rótula que empeora con actividad',
      'molestias en la rodilla especialmente al estar sentado mucho tiempo'
    ],
    ageRange: { min: 20, max: 45 },
    genderOptions: ['Masculino', 'Femenino'],
    occupationOptions: [
      'Corredor/a amateur',
      'Ciclista',
      'Estudiante universitario',
      'Oficinista que corre',
      'Monitor/a de fitness',
      'Senderista',
      'Deportista recreacional'
    ],
    onsetTypeOptions: [
      'gradual tras aumentar volumen de entrenamiento',
      'tras comenzar programa de carrera',
      'progresivo durante últimas semanas de running',
      'inicio gradual tras cambio de terreno de entrenamiento'
    ],
    chronologyWeeksRange: { min: 3, max: 10 },
    aggravatingFactorsOptions: [
      ['bajar escaleras', 'subir escaleras', 'correr', 'sedestación prolongada (signo del cine)', 'ponerse en cuclillas'],
      ['correr cuesta abajo', 'estar sentado >30min', 'levantarse tras estar sentado', 'arrodillarse'],
      ['actividades con flexión rodilla', 'subir/bajar pendientes', 'permanecer sentado en cine/coche', 'sentadillas']
    ],
    relievingFactorsOptions: [
      ['reposo', 'evitar escaleras', 'mantenerse en movimiento sin impacto', 'estiramientos'],
      ['reducir distancia de carrera', 'aplicar hielo', 'ejercicios de fortalecimiento', 'evitar flexión prolongada'],
      ['modificar entrenamiento', 'vendaje rotuliano', 'fortalecimiento cuádriceps', 'evitar impacto']
    ],
    physicalFindings: {
      palpationOptions: [
        'dolor a compresión patelar, facetas rotulianas sensibles',
        'molestia en cara posterior de rótula con compresión',
        'dolor perirotuliano difuso, especialmente cara medial'
      ],
      romOptions: [
        'rango completo flexo-extensión con crepitación patelofemoral',
        'movilidad completa, crepitación fina durante movimiento',
        'flexo-extensión conservada con molestia difusa en media flexión'
      ],
      strengthOptions: [
        'debilidad en cuádriceps, especialmente vasto medial oblicuo',
        'fuerza cuádriceps disminuida respecto contralateral, VMO hipotrófico',
        'debilidad relativa en cadena extensora, desbalance muscular'
      ],
      specialTestsOptions: [
        'test compresión patelar positivo, Clarke positivo, no inestabilidad ligamentosa',
        'test deslizamiento rotuliano doloroso, J-sign presente',
        'Clarke test reproduce dolor, tracking patelar alterado, test aprensión negativo'
      ]
    }
  },

  // 6. Esguince lateral de tobillo leve
  {
    id: 'ankle-sprain-mild',
    pathology: 'Esguince lateral de tobillo grado I-II',
    chiefComplaintTemplates: [
      'me torcí el tobillo y me duele al caminar',
      'tengo el tobillo hinchado después de una torcedura',
      'dolor en el tobillo tras tropezar hace unos días',
      'me hice un esguince de tobillo y aún me molesta'
    ],
    ageRange: { min: 18, max: 50 },
    genderOptions: ['Masculino', 'Femenino'],
    occupationOptions: [
      'Jugador/a de fútbol',
      'Corredor/a',
      'Bailarín/a',
      'Deportista amateur',
      'Estudiante',
      'Camarero/a',
      'Personal de eventos'
    ],
    onsetTypeOptions: [
      'agudo tras inversión del tobillo jugando al fútbol',
      'tras pisar mal bajando escaleras',
      'torcedura al correr en terreno irregular',
      'trauma en inversión durante actividad deportiva'
    ],
    chronologyWeeksRange: { min: 1, max: 4 },
    aggravatingFactorsOptions: [
      ['caminar', 'apoyo monopodal', 'terrenos irregulares', 'punta de pie'],
      ['caminar rápido', 'subir/bajar escaleras', 'giros sobre el pie', 'correr'],
      ['bipedestación prolongada', 'inversión del pie', 'terreno inestable', 'actividad deportiva']
    ],
    relievingFactorsOptions: [
      ['reposo', 'elevación', 'hielo', 'vendaje compresivo'],
      ['descarga parcial', 'crioterapia', 'compresión', 'elevación del miembro'],
      ['reposo relativo', 'aplicación frío', 'tobillera', 'antiinflamatorios']
    ],
    physicalFindings: {
      palpationOptions: [
        'dolor a palpación de ligamento peroneoastragalino anterior',
        'edema región lateral tobillo, dolor sobre LPAA',
        'sensibilidad en cara lateral con leve tumefacción residual'
      ],
      romOptions: [
        'flexión plantar y dorsal conservadas, inversión dolorosa',
        'rango completo con molestia al final de inversión',
        'movilidad activa completa, pasiva dolorosa en inversión'
      ],
      strengthOptions: [
        'fuerza conservada con molestia en eversión',
        'fuerza peroneos 4/5 por dolor, resto conservado',
        'debilidad leve y dolorosa en eversores laterales'
      ],
      specialTestsOptions: [
        'test cajón anterior leve positivo, sin bostezo significativo, marcha posible',
        'prueba estrés inversión dolorosa, estabilidad conservada',
        'leve laxitud en test cajón anterior, sin inestabilidad franca, pruebas ligamentosas grado I-II'
      ]
    }
  },

  // 7. Cervicalgia mecánica
  {
    id: 'mechanical-neck-pain',
    pathology: 'Cervicalgia mecánica',
    chiefComplaintTemplates: [
      'tengo dolor en el cuello que me está molestando mucho',
      'me duele el cuello y tengo rigidez',
      'dolor cervical que empeora al trabajar con el ordenador',
      'tengo el cuello contracturado y con dolor'
    ],
    ageRange: { min: 25, max: 55 },
    genderOptions: ['Masculino', 'Femenino'],
    occupationOptions: [
      'Programador/a',
      'Diseñador/a gráfico',
      'Administrativo/a',
      'Traductor/a',
      'Estudiante de posgrado',
      'Contable',
      'Teleoperador/a',
      'Arquitecto/a'
    ],
    onsetTypeOptions: [
      'gradual tras largas jornadas frente al ordenador',
      'tras dormir en mala posición',
      'progresivo por sobrecarga postural laboral',
      'inicio gradual relacionado con estrés y tensión'
    ],
    chronologyWeeksRange: { min: 1, max: 6 },
    aggravatingFactorsOptions: [
      ['trabajo con ordenador', 'mirar el móvil', 'mantener cabeza en flexión', 'conducir'],
      ['postura mantenida', 'movimientos de rotación', 'llevar mochila pesada', 'estrés'],
      ['sedestación prolongada', 'leer en la cama', 'teclear', 'hablar por teléfono con cuello flexionado']
    ],
    relievingFactorsOptions: [
      ['calor local', 'estiramientos suaves', 'cambios posturales', 'masaje'],
      ['movimiento suave', 'aplicación de calor', 'ejercicios de movilidad', 'relajación'],
      ['pausas frecuentes', 'termoterapia', 'estiramientos cervicales', 'ergonomía mejorada']
    ],
    physicalFindings: {
      palpationOptions: [
        'contractura bilateral de trapecios superiores y paravertebrales cervicales',
        'puntos gatillo activos en trapecio superior y elevador de escápula',
        'tensión muscular cervical con dolor referido a hombros'
      ],
      romOptions: [
        'rotaciones limitadas bilateralmente, flexión y extensión con molestia',
        'limitación dolorosa en rotación y lateralización, flexión conservada',
        'rango completo con dolor difuso en extremos de movimiento'
      ],
      strengthOptions: [
        'fuerza muscular conservada en extremidades superiores',
        'sin déficits neurológicos, fuerza 5/5 bilateral',
        'fuerza normal en miembros superiores, reflejos conservados'
      ],
      specialTestsOptions: [
        'test de Spurling negativo, no signos radiculares, movilidad escapular alterada',
        'pruebas de compresión foraminal negativas, tensión muscular predominante',
        'no datos de compromiso neurológico, patrón mecánico puro'
      ]
    }
  },

  // 8. Epicondilalgia lateral
  {
    id: 'lateral-epicondylalgia',
    pathology: 'Epicondilalgia lateral (codo de tenista)',
    chiefComplaintTemplates: [
      'me duele el codo en la parte externa al agarrar cosas',
      'tengo dolor en el codo que me impide coger objetos',
      'dolor en la parte de fuera del codo al hacer fuerza',
      'molestias en el codo externo que empeoran con el uso'
    ],
    ageRange: { min: 30, max: 55 },
    genderOptions: ['Masculino', 'Femenino'],
    occupationOptions: [
      'Tenista amateur',
      'Carpintero/a',
      'Oficinista con uso intensivo de ratón',
      'Músico/a',
      'Pintor/a',
      'Mecánico/a',
      'Jardinero/a',
      'Chef'
    ],
    onsetTypeOptions: [
      'gradual tras actividad repetitiva de agarre',
      'tras intensificar práctica de tenis/pádel',
      'progresivo por uso intensivo de herramientas',
      'inicio insidioso relacionado con movimientos de muñeca'
    ],
    chronologyWeeksRange: { min: 2, max: 12 },
    aggravatingFactorsOptions: [
      ['agarrar objetos', 'girar pomos de puertas', 'dar la mano', 'levantar objetos con brazo extendido'],
      ['usar ratón de ordenador', 'teclear', 'exprimir trapos', 'destornillar'],
      ['extensión de muñeca contra resistencia', 'actividades de agarre', 'movimientos repetitivos', 'uso de herramientas']
    ],
    relievingFactorsOptions: [
      ['reposo de la actividad agravante', 'hielo local', 'evitar agarres forzados', 'antiinflamatorios'],
      ['modificar actividad', 'crioterapia', 'uso de ortesis', 'ejercicios excéntricos graduales'],
      ['reducir movimientos repetitivos', 'aplicación de frío', 'ergonomía en puesto trabajo', 'reposo relativo']
    ],
    physicalFindings: {
      palpationOptions: [
        'dolor exquisito a palpación de epicóndilo lateral',
        'punto doloroso preciso en inserción extensores en epicóndilo',
        'sensibilidad marcada en origen extensor común'
      ],
      romOptions: [
        'rango articular completo de codo, dolor en extensión de muñeca contra resistencia',
        'flexo-extensión de codo conservada, pronosupinación dolorosa en extremos',
        'movilidad de codo normal, limitación funcional por dolor en muñeca'
      ],
      strengthOptions: [
        'debilidad dolorosa en extensión de muñeca y dedos',
        'fuerza reducida 3+/5 en extensores de muñeca por dolor',
        'debilidad significativa y dolorosa en test de agarre'
      ],
      specialTestsOptions: [
        'test de Cozen positivo, test de Mill positivo, dolor en extensión resistida de muñeca',
        'test de la silla positivo (incapacidad de levantar silla con brazo extendido)',
        'test de Maudsley positivo, dolor en extensión resistida de dedo medio'
      ]
    }
  }
];

// Función para generar un caso clínico aleatorio basado en un framework
export function generateRandomCase(): any {
  // Seleccionar framework aleatorio
  const framework = CLINICAL_FRAMEWORKS[Math.floor(Math.random() * CLINICAL_FRAMEWORKS.length)];
  
  // Generar datos aleatorios dentro de los rangos del framework
  const age = Math.floor(Math.random() * (framework.ageRange.max - framework.ageRange.min + 1)) + framework.ageRange.min;
  const gender = framework.genderOptions[Math.floor(Math.random() * framework.genderOptions.length)];
  const occupation = framework.occupationOptions[Math.floor(Math.random() * framework.occupationOptions.length)];
  const chiefComplaint = framework.chiefComplaintTemplates[Math.floor(Math.random() * framework.chiefComplaintTemplates.length)];
  const onsetType = framework.onsetTypeOptions[Math.floor(Math.random() * framework.onsetTypeOptions.length)];
  const chronologyWeeks = Math.floor(Math.random() * (framework.chronologyWeeksRange.max - framework.chronologyWeeksRange.min + 1)) + framework.chronologyWeeksRange.min;
  
  const aggravatingFactors = framework.aggravatingFactorsOptions[Math.floor(Math.random() * framework.aggravatingFactorsOptions.length)];
  const relievingFactors = framework.relievingFactorsOptions[Math.floor(Math.random() * framework.relievingFactorsOptions.length)];
  
  // Generar hallazgos físicos aleatorios
  const palpation = framework.physicalFindings.palpationOptions[Math.floor(Math.random() * framework.physicalFindings.palpationOptions.length)];
  const rom = framework.physicalFindings.romOptions[Math.floor(Math.random() * framework.physicalFindings.romOptions.length)];
  const strength = framework.physicalFindings.strengthOptions[Math.floor(Math.random() * framework.physicalFindings.strengthOptions.length)];
  const specialTests = framework.physicalFindings.specialTestsOptions[Math.floor(Math.random() * framework.physicalFindings.specialTestsOptions.length)];
  
  // Generar nombre aleatorio español
  const firstNames = {
    Masculino: ['Carlos', 'Miguel', 'Juan', 'David', 'Antonio', 'José', 'Manuel', 'Francisco', 'Rafael', 'Javier'],
    Femenino: ['María', 'Ana', 'Carmen', 'Laura', 'Isabel', 'Marta', 'Elena', 'Patricia', 'Lucía', 'Rosa']
  };
  
  const lastNames = ['García', 'Martínez', 'López', 'Sánchez', 'González', 'Rodríguez', 'Fernández', 'Pérez', 'Gómez', 'Díaz'];
  
  const firstName = firstNames[gender as 'Masculino' | 'Femenino'][Math.floor(Math.random() * 10)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const patientName = `${firstName} ${lastName}`;
  
  // Construir el caso completo
  return {
    id: `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    patientName,
    age,
    gender,
    occupation,
    chiefComplaint,
    pathology: framework.pathology,
    date: new Date().toISOString(),
    clinicalDetails: {
      onsetType,
      chronologyWeeks,
      aggravatingFactors,
      relievingFactors,
      physicalFindings: {
        palpation,
        rom,
        strength,
        specialTests
      }
    }
  };
}

// Función para obtener un framework específico por ID
export function getFrameworkById(id: string): ClinicalFramework | undefined {
  return CLINICAL_FRAMEWORKS.find(f => f.id === id);
}

// Función para obtener todos los frameworks disponibles
export function getAllFrameworks(): ClinicalFramework[] {
  return CLINICAL_FRAMEWORKS;
}
