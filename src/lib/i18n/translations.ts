export interface LandingTranslation {
  locale: string
  langName: string
  nativeName: string
  hero: {
    badge: string
    title: string
    titleAccent: string
    subtitle: string
    ctaPrimary: string
    ctaSecondary: string
    freeNote: string
  }
  features: {
    title: string
    items: Array<{ title: string; description: string }>
  }
  howItWorks: {
    title: string
    subtitle: string
    steps: Array<{ title: string; description: string }>
  }
  pricing: {
    title: string
    subtitle: string
    free: { name: string; description: string; cta: string; features: string[] }
    basic: { name: string; description: string; cta: string; features: string[] }
    pro: { name: string; description: string; cta: string; features: string[] }
    creditPack: string
  }
  faq: {
    title: string
    subtitle: string
    items: Array<{ question: string; answer: string }>
  }
  cta: {
    title: string
    subtitle: string
    button: string
    note: string
  }
  nav: {
    features: string
    howItWorks: string
    pricing: string
    blog: string
    roastMyResume: string
    roastFree: string
    signIn: string
    getStartedFree: string
    product: string
    resources: string
    documents: string
    support: string
    faq: string
    tagline: string
    resumeBuilder: string
    coverLetter: string
    linkedInSummary: string
    interviewPrep: string
    contactUs: string
    privacyPolicy: string
    termsOfService: string
    allRightsReserved: string
    alsoAvailableIn: string
  }
  roastPage: {
    badge: string
    title: string
    subtitle: string
    jdLabel: string
    jdPlaceholder: string
    resumeLabel: string
    resumePlaceholder: string
    submitButton: string
    jdMinChars: string
    resumeMinChars: string
    loadingMessages: string[]
    keywordMatch: string
    impactScore: string
    atsCompatibility: string
    skillsGap: string
    matched: string
    missing: string
    strongBullets: string
    weakBullets: string
    covered: string
    noAtsIssues: string
    formattingIssues: string
    top3Fixes: string
    theRoast: string
    shareYourScore: string
    shareOnLinkedIn: string
    shareOnX: string
    copyLink: string
    copied: string
    shareText: string
    ctaTitle: string
    ctaSubtitle: string
    ctaButton: string
    ctaPricing: string
  }
  contactPage: {
    title: string
    subtitle: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    subjectLabel: string
    subjectPlaceholder: string
    categoryLabel: string
    messageLabel: string
    messagePlaceholder: string
    sending: string
    sendMessage: string
    messageSentTitle: string
    messageSentBody: string
    caseNumberLabel: string
  }
  blogPage: {
    title: string
    subtitle: string
    metaTitle: string
    metaDescription: string
  }
  ghostboardPage: {
    metaTitle: string
    metaDescription: string
  }
}

export const translations: Record<string, LandingTranslation> = {
  // ---------------------------------------------------------------------------
  // Spanish
  // ---------------------------------------------------------------------------
  es: {
    locale: 'es',
    langName: 'Spanish',
    nativeName: 'Espanol',
    hero: {
      badge: 'Documentos de carrera inteligentes',
      title: 'Consigue el trabajo de tus suenos',
      titleAccent: 'con un solo clic',
      subtitle:
        'Pega una oferta de empleo, agrega tu experiencia y obtiene un paquete completo de solicitud: curriculum optimizado para ATS, carta de presentacion, resumen de LinkedIn, correo en frio y preparacion para entrevistas, en segundos.',
      ctaPrimary: 'Empieza gratis, sin tarjeta',
      ctaSecondary: 'Mira como funciona',
      freeNote: '2 documentos gratis al mes. No se requiere tarjeta de credito.',
    },
    features: {
      title: 'Funcionalidades',
      items: [
        {
          title: 'Analisis de oferta',
          description:
            'La IA analiza la descripcion del puesto para extraer habilidades, palabras clave y requisitos.',
        },
        {
          title: 'Puntuacion ATS',
          description:
            'Comprueba que tan bien encaja tu curriculum con la oferta y corrige las palabras clave faltantes.',
        },
        {
          title: 'Paquete completo en un clic',
          description:
            'Curriculum, carta de presentacion, resumen de LinkedIn, correo en frio y preparacion para entrevistas, todo a la vez.',
        },
        {
          title: 'Plantillas profesionales',
          description:
            '10 plantillas premium de curriculum con fuentes y tamanos configurables.',
        },
        {
          title: 'Seguimiento de postulaciones',
          description:
            'Lleva un registro de tus postulaciones y haz seguimiento en el momento adecuado.',
        },
        {
          title: 'Preparacion para entrevistas',
          description:
            'Recibe preguntas de entrevista personalizadas con respuestas modelo y consejos.',
        },
      ],
    },
    howItWorks: {
      title: 'Como funciona',
      subtitle: 'De oferta de empleo a solicitud completa en 4 pasos',
      steps: [
        {
          title: 'Pega la oferta de empleo',
          description: 'Copia cualquier publicacion de empleo y pegala aqui.',
        },
        {
          title: 'Agrega tu experiencia',
          description: 'Anade tu curriculum o los datos mas relevantes.',
        },
        {
          title: 'Genera los documentos',
          description: 'La IA crea 6 documentos personalizados.',
        },
        {
          title: 'Descarga y postulate',
          description: 'Descarga los PDF y envialos.',
        },
      ],
    },
    pricing: {
      title: 'Planes y precios',
      subtitle: 'Elige el plan que mejor se adapte a ti',
      free: {
        name: 'Gratis',
        description: 'Ideal para probarlo',
        cta: 'Comenzar gratis',
        features: [
          '2 documentos al mes',
          'Puntuacion ATS basica',
          'Descarga en PDF (con marca de agua)',
          '3 plantillas de curriculum',
        ],
      },
      basic: {
        name: 'Basic',
        description: 'Para quienes buscan empleo activamente',
        cta: 'Elegir Basic',
        features: [
          '10 documentos al mes',
          'Las 13 plantillas',
          'Sin marca de agua',
          'Guardar hasta 10 postulaciones',
          'Analisis ATS avanzado',
          'Seguimiento de postulaciones',
        ],
      },
      pro: {
        name: 'Pro',
        description: 'Para quienes buscan empleo en serio',
        cta: 'Elegir Pro',
        features: [
          '20 documentos al mes',
          'Las 13 plantillas',
          'Fuentes premium',
          'Soporte multiidioma',
          'Coach de carrera',
          'Sin marca de agua',
        ],
      },
      creditPack: '3 generaciones de documentos por $2.99 — sin marca de agua, guardados en tu cuenta. Los creditos nunca caducan.',
    },
    faq: {
      title: 'Preguntas frecuentes',
      subtitle: 'Todo lo que necesitas saber sobre Resume Studio',
      items: [
        {
          question: 'Que hace Resume Studio exactamente?',
          answer:
            'Pegas una oferta de empleo, agregas tu experiencia y Resume Studio genera un paquete completo de solicitud: curriculum optimizado para ATS, carta de presentacion, resumen de LinkedIn, correo de contacto en frio, guia de preparacion para entrevistas y recomendaciones de certificaciones, todo personalizado para ese puesto.',
        },
        {
          question: 'Que es la puntuacion ATS y por que importa?',
          answer:
            'Los ATS (Applicant Tracking Systems) son programas que la mayoria de las empresas usan para filtrar curriculos antes de que un humano los vea. Nuestra puntuacion ATS analiza tu curriculum frente a la oferta y te dice que tan bien encaja. Si faltan palabras clave, nuestra herramienta las agrega automaticamente.',
        },
        {
          question: 'Estan seguros mis datos?',
          answer:
            'Si. Tus documentos e informacion personal se almacenan de forma segura con permisos a nivel de fila, cifrados en transito, y nunca se comparten con terceros. No usamos tus datos para entrenar modelos de IA. Puedes eliminar tu cuenta y todos tus datos en cualquier momento.',
        },
        {
          question: 'Puedo usar Resume Studio en mi idioma?',
          answer:
            'Los usuarios del plan Pro pueden generar documentos en 11 idiomas, incluidos espanol, frances, aleman, portugues, chino, japones, coreano, hindi, arabe e italiano, ademas de cualquier idioma personalizado.',
        },
        {
          question: 'Que pasa despues de mis 2 documentos gratis?',
          answer:
            'Puedes esperar al mes siguiente para obtener 2 documentos gratis mas, comprar un paquete de creditos (3 generaciones por $2.99, sin caducidad), o pasarte a Basic ($5.99/mes) o Pro ($10.99/mes).',
        },
        {
          question: 'Puedo cancelar mi suscripcion en cualquier momento?',
          answer:
            'Si. No hay contratos ni cargos por cancelacion. Puedes cancelar desde tu pagina de ajustes y mantendras el acceso hasta el final de tu periodo de facturacion.',
        },
      ],
    },
    cta: {
      title: 'Listo para conseguir mas entrevistas?',
      subtitle:
        '6 documentos personalizados a partir de una sola oferta de empleo. Optimizados para ATS, listos para la entrevista y generados en menos de 60 segundos.',
      button: 'Empieza gratis',
      note: 'Sin tarjeta de credito. 2 documentos gratis cada mes.',
    },
    nav: {
      features: 'Funcionalidades',
      howItWorks: 'Como funciona',
      pricing: 'Precios',
      blog: 'Blog',
      roastMyResume: 'Critica mi CV',
      roastFree: 'GRATIS',
      signIn: 'Iniciar sesion',
      getStartedFree: 'Empieza gratis',
      product: 'Producto',
      resources: 'Recursos',
      documents: 'Documentos',
      support: 'Soporte',
      faq: 'Preguntas frecuentes',
      tagline: 'Documentos de carrera inteligentes. Consigue tu empleo ideal con un solo clic.',
      resumeBuilder: 'Creador de curriculum',
      coverLetter: 'Carta de presentacion',
      linkedInSummary: 'Resumen de LinkedIn',
      interviewPrep: 'Preparacion de entrevista',
      contactUs: 'Contacto',
      privacyPolicy: 'Politica de privacidad',
      termsOfService: 'Terminos de servicio',
      allRightsReserved: 'Todos los derechos reservados.',
      alsoAvailableIn: 'Tambien disponible en:',
    },
    roastPage: {
      badge: 'Gratis — No necesitas registrarte',
      title: 'Critica mi CV',
      subtitle: 'Pega una oferta de empleo y tu curriculum. Nuestra IA lo puntuara, encontrara palabras clave faltantes y te dara una critica brutalmente honesta con soluciones.',
      jdLabel: 'Descripcion del puesto',
      jdPlaceholder: 'Pega la descripcion del puesto aqui...',
      resumeLabel: 'Tu curriculum (texto plano)',
      resumePlaceholder: 'Pega el texto de tu curriculum aqui...',
      submitButton: 'Critica mi CV',
      jdMinChars: 'La descripcion del puesto necesita al menos 50 caracteres',
      resumeMinChars: 'El curriculum necesita al menos 50 caracteres',
      loadingMessages: [
        'Escaneando tu curriculum en busca de errores...',
        'Comparando palabras clave con la oferta...',
        'Calculando tus probabilidades de pasar el ATS...',
        'Juzgando tus viñetas sin piedad...',
        'Encontrando las habilidades que olvidaste mencionar...',
        'Preparando tu critica...',
        'Casi listo — dando los toques finales...',
      ],
      keywordMatch: 'Coincidencia de palabras clave',
      impactScore: 'Puntuacion de impacto',
      atsCompatibility: 'Compatibilidad ATS',
      skillsGap: 'Brecha de habilidades',
      matched: 'Coinciden',
      missing: 'Faltan',
      strongBullets: 'Viñetas fuertes',
      weakBullets: 'Viñetas debiles',
      covered: 'Cubiertas',
      noAtsIssues: 'No se detectaron problemas de ATS.',
      formattingIssues: 'Problemas de formato',
      top3Fixes: 'Las 3 correcciones principales',
      theRoast: 'La critica',
      shareYourScore: 'Comparte tu puntuacion',
      shareOnLinkedIn: 'Compartir en LinkedIn',
      shareOnX: 'Compartir en X',
      copyLink: 'Copiar enlace',
      copied: '¡Copiado!',
      shareText: 'La IA acaba de criticar mi curriculum y saque {score}/100. ¿Crees que puedes hacerlo mejor?',
      ctaTitle: '¿Quieres arreglarlo todo?',
      ctaSubtitle: 'Resume Studio genera curriculos optimizados para ATS, cartas de presentacion y mas — adaptados a cada empleo.',
      ctaButton: 'Empieza gratis',
      ctaPricing: 'Ver precios',
    },
    contactPage: {
      title: 'Contacto',
      subtitle: '¿Tienes una pregunta, encontraste un error o quieres solicitar una funcion? Nos encantaria saber de ti.',
      nameLabel: 'Nombre',
      namePlaceholder: 'Tu nombre',
      emailLabel: 'Correo electronico',
      emailPlaceholder: 'tu@ejemplo.com',
      subjectLabel: 'Asunto',
      subjectPlaceholder: 'Breve descripcion',
      categoryLabel: 'Categoria',
      messageLabel: 'Mensaje',
      messagePlaceholder: 'Cuentanos lo que piensas...',
      sending: 'Enviando...',
      sendMessage: 'Enviar mensaje',
      messageSentTitle: 'Mensaje enviado',
      messageSentBody: 'Gracias por escribirnos. Revisaremos tu mensaje y te responderemos pronto.',
      caseNumberLabel: 'Tu numero de caso es',
    },
    blogPage: {
      title: 'Consejos de carrera y curriculum',
      subtitle: 'Guias de expertos sobre redaccion de curriculum, optimizacion ATS y como conseguir mas entrevistas.',
      metaTitle: 'Blog — Consejos de curriculum, guias ATS y consejos de carrera',
      metaDescription: 'Consejos de expertos sobre redaccion de curriculum, optimizacion ATS, cartas de presentacion, perfiles de LinkedIn y preparacion para entrevistas.',
    },
    ghostboardPage: {
      metaTitle: 'GhostBoard — Califica la experiencia de contratacion de empresas',
      metaDescription: 'Descubre que empresas ignoran a los candidatos. Califica tiempos de respuesta, calidad de entrevista y transparencia.',
    },
  },

  // ---------------------------------------------------------------------------
  // French
  // ---------------------------------------------------------------------------
  fr: {
    locale: 'fr',
    langName: 'French',
    nativeName: 'Francais',
    hero: {
      badge: 'Documents de carriere intelligents',
      title: 'Decrochez le poste de vos reves',
      titleAccent: 'en un clic',
      subtitle:
        'Collez une offre d\'emploi, ajoutez votre parcours, et obtenez un dossier de candidature complet : CV optimise ATS, lettre de motivation, resume LinkedIn, e-mail de prospection et preparation aux entretiens, en quelques secondes.',
      ctaPrimary: 'Commencer gratuitement',
      ctaSecondary: 'Voir comment ca marche',
      freeNote: '2 documents gratuits par mois. Aucune carte bancaire requise.',
    },
    features: {
      title: 'Fonctionnalites',
      items: [
        {
          title: 'Analyse de l\'offre',
          description:
            'L\'IA analyse l\'offre d\'emploi pour en extraire les competences, mots-cles et exigences.',
        },
        {
          title: 'Score ATS',
          description:
            'Verifiez l\'adequation de votre CV avec l\'offre et corrigez les mots-cles manquants.',
        },
        {
          title: 'Dossier complet en un clic',
          description:
            'CV, lettre de motivation, resume LinkedIn, e-mail de prospection et preparation aux entretiens, le tout en une seule fois.',
        },
        {
          title: 'Modeles professionnels',
          description:
            '10 modeles de CV premium avec polices et tailles personnalisables.',
        },
        {
          title: 'Suivi des candidatures',
          description:
            'Suivez vos candidatures et relancez au bon moment.',
        },
        {
          title: 'Preparation aux entretiens',
          description:
            'Recevez des questions d\'entretien personnalisees avec des reponses types et des conseils.',
        },
      ],
    },
    howItWorks: {
      title: 'Comment ca marche',
      subtitle: 'De l\'offre d\'emploi a la candidature complete en 4 etapes',
      steps: [
        {
          title: 'Collez l\'offre d\'emploi',
          description: 'Copiez n\'importe quelle offre et collez-la ici.',
        },
        {
          title: 'Ajoutez votre parcours',
          description: 'Importez votre CV ou vos informations cles.',
        },
        {
          title: 'Generez les documents',
          description: 'L\'IA cree 6 documents sur mesure.',
        },
        {
          title: 'Telechargez et postulez',
          description: 'Telechargez les PDF et envoyez votre candidature.',
        },
      ],
    },
    pricing: {
      title: 'Tarifs',
      subtitle: 'Choisissez la formule qui vous convient',
      free: {
        name: 'Gratuit',
        description: 'Ideal pour essayer',
        cta: 'Commencer gratuitement',
        features: [
          '2 documents par mois',
          'Score ATS de base',
          'Telechargement PDF (avec filigrane)',
          '3 modeles de CV',
        ],
      },
      basic: {
        name: 'Basic',
        description: 'Pour les chercheurs d\'emploi actifs',
        cta: 'Choisir Basic',
        features: [
          '10 documents par mois',
          'Les 13 modeles',
          'Sans filigrane',
          'Sauvegarder 10 candidatures',
          'Analyse ATS avancee',
          'Suivi des candidatures',
        ],
      },
      pro: {
        name: 'Pro',
        description: 'Pour les chercheurs d\'emploi serieux',
        cta: 'Choisir Pro',
        features: [
          '20 documents par mois',
          'Les 13 modeles',
          'Polices premium',
          'Support multilingue',
          'Coach de carriere',
          'Sans filigrane',
        ],
      },
      creditPack: '3 generations de documents pour 2,99 $ — sans filigrane, enregistrees sur votre compte. Les credits n\'expirent jamais.',
    },
    faq: {
      title: 'Questions frequentes',
      subtitle: 'Tout ce qu\'il faut savoir sur Resume Studio',
      items: [
        {
          question: 'Que fait Resume Studio exactement ?',
          answer:
            'Vous collez une offre d\'emploi, ajoutez votre parcours, et Resume Studio genere un dossier de candidature complet : CV optimise ATS, lettre de motivation, resume LinkedIn, e-mail de prospection, guide de preparation aux entretiens et recommandations de certifications, le tout adapte au poste vise.',
        },
        {
          question: 'Qu\'est-ce que le score ATS et pourquoi est-ce important ?',
          answer:
            'Les ATS (Applicant Tracking Systems) sont des logiciels utilises par la plupart des entreprises pour filtrer les CV avant qu\'un recruteur ne les lise. Notre score ATS analyse votre CV par rapport a l\'offre et vous indique son degre de correspondance. Si des mots-cles manquent, notre outil les ajoute automatiquement.',
        },
        {
          question: 'Mes donnees sont-elles en securite ?',
          answer:
            'Oui. Vos documents et informations personnelles sont stockes de maniere securisee avec un controle d\'acces au niveau des lignes, chiffres en transit et jamais partages avec des tiers. Nous n\'utilisons pas vos donnees pour entrainer des modeles d\'IA. Vous pouvez supprimer votre compte et toutes vos donnees a tout moment.',
        },
        {
          question: 'Puis-je utiliser Resume Studio dans ma langue ?',
          answer:
            'Les utilisateurs du plan Pro peuvent generer des documents dans 11 langues, dont l\'espagnol, le francais, l\'allemand, le portugais, le chinois, le japonais, le coreen, le hindi, l\'arabe et l\'italien, ainsi que toute langue personnalisee.',
        },
        {
          question: 'Que se passe-t-il apres mes 2 documents gratuits ?',
          answer:
            'Vous pouvez attendre le mois suivant pour obtenir 2 nouveaux documents gratuits, acheter un lot de credits (3 generations pour 2,99 $, sans date d\'expiration), ou passer a Basic (5,99 $/mois) ou Pro (10,99 $/mois).',
        },
        {
          question: 'Puis-je annuler mon abonnement a tout moment ?',
          answer:
            'Oui. Il n\'y a ni contrat ni frais d\'annulation. Vous pouvez annuler depuis votre page de parametres et vous conserverez l\'acces jusqu\'a la fin de votre periode de facturation.',
        },
      ],
    },
    cta: {
      title: 'Pret a decrocher plus d\'entretiens ?',
      subtitle:
        '6 documents sur mesure a partir d\'une seule offre d\'emploi. Optimises pour les ATS, prets pour l\'entretien, generes en moins de 60 secondes.',
      button: 'Commencer gratuitement',
      note: 'Aucune carte bancaire requise. 2 documents gratuits chaque mois.',
    },
    nav: {
      features: 'Fonctionnalites',
      howItWorks: 'Comment ca marche',
      pricing: 'Tarifs',
      blog: 'Blog',
      roastMyResume: 'Critiquez mon CV',
      roastFree: 'GRATUIT',
      signIn: 'Connexion',
      getStartedFree: 'Commencer gratuitement',
      product: 'Produit',
      resources: 'Ressources',
      documents: 'Documents',
      support: 'Support',
      faq: 'FAQ',
      tagline: 'Documents de carriere intelligents. Decrochez le poste de vos reves en un clic.',
      resumeBuilder: 'Createur de CV',
      coverLetter: 'Lettre de motivation',
      linkedInSummary: 'Resume LinkedIn',
      interviewPrep: 'Preparation entretien',
      contactUs: 'Nous contacter',
      privacyPolicy: 'Politique de confidentialite',
      termsOfService: 'Conditions d\'utilisation',
      allRightsReserved: 'Tous droits reserves.',
      alsoAvailableIn: 'Egalement disponible en :',
    },
    roastPage: {
      badge: 'Gratuit — Pas d\'inscription requise',
      title: 'Critiquez mon CV',
      subtitle: 'Collez une offre d\'emploi et votre CV. Notre IA le notera, trouvera les mots-cles manquants et vous livrera une critique brutalement honnete avec des corrections.',
      jdLabel: 'Description du poste',
      jdPlaceholder: 'Collez la description du poste ici...',
      resumeLabel: 'Votre CV (texte brut)',
      resumePlaceholder: 'Collez le texte de votre CV ici...',
      submitButton: 'Critiquez mon CV',
      jdMinChars: 'La description du poste doit contenir au moins 50 caracteres',
      resumeMinChars: 'Le CV doit contenir au moins 50 caracteres',
      loadingMessages: [
        'Analyse de votre CV a la recherche d\'erreurs...',
        'Comparaison des mots-cles avec l\'offre...',
        'Calcul de vos chances de passer l\'ATS...',
        'Jugement impitoyable de vos puces...',
        'Recherche des competences que vous avez oubliees...',
        'Preparation de votre critique...',
        'Presque fini — derniers ajustements...',
      ],
      keywordMatch: 'Correspondance des mots-cles',
      impactScore: 'Score d\'impact',
      atsCompatibility: 'Compatibilite ATS',
      skillsGap: 'Ecart de competences',
      matched: 'Correspondants',
      missing: 'Manquants',
      strongBullets: 'Puces fortes',
      weakBullets: 'Puces faibles',
      covered: 'Couvertes',
      noAtsIssues: 'Aucun probleme ATS detecte.',
      formattingIssues: 'Problemes de mise en forme',
      top3Fixes: 'Les 3 corrections principales',
      theRoast: 'La critique',
      shareYourScore: 'Partagez votre score',
      shareOnLinkedIn: 'Partager sur LinkedIn',
      shareOnX: 'Partager sur X',
      copyLink: 'Copier le lien',
      copied: 'Copie !',
      shareText: 'L\'IA vient de critiquer mon CV et j\'ai obtenu {score}/100. Vous pensez faire mieux ?',
      ctaTitle: 'Envie de tout corriger ?',
      ctaSubtitle: 'Resume Studio genere des CV optimises ATS, lettres de motivation et plus — adaptes a chaque poste.',
      ctaButton: 'Commencer gratuitement',
      ctaPricing: 'Voir les tarifs',
    },
    contactPage: {
      title: 'Nous contacter',
      subtitle: 'Une question, un bug ou une demande de fonctionnalite ? Nous serions ravis de vous entendre.',
      nameLabel: 'Nom',
      namePlaceholder: 'Votre nom',
      emailLabel: 'E-mail',
      emailPlaceholder: 'vous@exemple.com',
      subjectLabel: 'Objet',
      subjectPlaceholder: 'Breve description',
      categoryLabel: 'Categorie',
      messageLabel: 'Message',
      messagePlaceholder: 'Dites-nous ce que vous avez en tete...',
      sending: 'Envoi en cours...',
      sendMessage: 'Envoyer le message',
      messageSentTitle: 'Message envoye',
      messageSentBody: 'Merci de nous avoir contactes. Nous examinerons votre message et vous repondrons rapidement.',
      caseNumberLabel: 'Votre numero de dossier est',
    },
    blogPage: {
      title: 'Conseils carriere et CV',
      subtitle: 'Guides d\'experts sur la redaction de CV, l\'optimisation ATS et comment decrocher plus d\'entretiens.',
      metaTitle: 'Blog — Conseils CV, guides ATS et conseils carriere',
      metaDescription: 'Conseils d\'experts sur la redaction de CV, l\'optimisation ATS, les lettres de motivation, les profils LinkedIn et la preparation aux entretiens.',
    },
    ghostboardPage: {
      metaTitle: 'GhostBoard — Evaluez l\'experience de recrutement des entreprises',
      metaDescription: 'Decouvrez quelles entreprises ignorent les candidats. Evaluez les temps de reponse, la qualite des entretiens et la transparence.',
    },
  },

  // ---------------------------------------------------------------------------
  // German
  // ---------------------------------------------------------------------------
  de: {
    locale: 'de',
    langName: 'German',
    nativeName: 'Deutsch',
    hero: {
      badge: 'Intelligente Bewerbungsdokumente',
      title: 'Landen Sie Ihren Traumjob',
      titleAccent: 'mit einem Klick',
      subtitle:
        'Stellenanzeige einfuegen, Erfahrung hinzufuegen und ein komplettes Bewerbungspaket erhalten: ATS-optimierter Lebenslauf, Anschreiben, LinkedIn-Zusammenfassung, Kaltakquise-E-Mail und Interview-Vorbereitung -- in Sekunden.',
      ctaPrimary: 'Kostenlos starten -- ohne Kreditkarte',
      ctaSecondary: 'So funktioniert es',
      freeNote: '2 kostenlose Dokumente pro Monat. Keine Kreditkarte erforderlich.',
    },
    features: {
      title: 'Funktionen',
      items: [
        {
          title: 'Stellenanzeigen-Analyse',
          description:
            'Die KI analysiert die Stellenausschreibung und extrahiert Faehigkeiten, Schluesselwoerter und Anforderungen.',
        },
        {
          title: 'ATS-Score',
          description:
            'Pruefen Sie, wie gut Ihr Lebenslauf zur Stelle passt, und ergaenzen Sie fehlende Schluesselwoerter.',
        },
        {
          title: 'Komplettpaket mit einem Klick',
          description:
            'Lebenslauf, Anschreiben, LinkedIn-Zusammenfassung, Kaltakquise-E-Mail und Interview-Vorbereitung -- alles auf einmal.',
        },
        {
          title: 'Professionelle Vorlagen',
          description:
            '10 Premium-Lebenslaufvorlagen mit konfigurierbaren Schriftarten und -groessen.',
        },
        {
          title: 'Bewerbungstracker',
          description:
            'Behalten Sie den Ueberblick ueber Ihre Bewerbungen und fassen Sie zum richtigen Zeitpunkt nach.',
        },
        {
          title: 'Interview-Vorbereitung',
          description:
            'Erhalten Sie massgeschneiderte Interview-Fragen mit Musterantworten und Tipps.',
        },
      ],
    },
    howItWorks: {
      title: 'So funktioniert es',
      subtitle: 'Von der Stellenanzeige zur fertigen Bewerbung in 4 Schritten',
      steps: [
        {
          title: 'Stellenanzeige einfuegen',
          description: 'Kopieren Sie eine beliebige Stellenanzeige und fuegen Sie sie ein.',
        },
        {
          title: 'Erfahrung hinzufuegen',
          description: 'Laden Sie Ihren Lebenslauf hoch oder geben Sie Ihre wichtigsten Daten ein.',
        },
        {
          title: 'Dokumente generieren',
          description: 'Die KI erstellt 6 massgeschneiderte Dokumente.',
        },
        {
          title: 'Herunterladen und bewerben',
          description: 'Laden Sie die PDFs herunter und bewerben Sie sich.',
        },
      ],
    },
    pricing: {
      title: 'Preise',
      subtitle: 'Waehlen Sie den Plan, der zu Ihnen passt',
      free: {
        name: 'Kostenlos',
        description: 'Ideal zum Ausprobieren',
        cta: 'Kostenlos starten',
        features: [
          '2 Dokumente pro Monat',
          'Einfacher ATS-Score',
          'PDF-Download (mit Wasserzeichen)',
          '3 Lebenslaufvorlagen',
        ],
      },
      basic: {
        name: 'Basic',
        description: 'Fuer aktive Jobsuchende',
        cta: 'Basic waehlen',
        features: [
          '10 Dokumente pro Monat',
          'Alle 13 Vorlagen',
          'Ohne Wasserzeichen',
          'Bis zu 10 Bewerbungen speichern',
          'Erweiterte ATS-Analyse',
          'Bewerbungstracker',
        ],
      },
      pro: {
        name: 'Pro',
        description: 'Fuer engagierte Jobsuchende',
        cta: 'Pro waehlen',
        features: [
          '20 Dokumente pro Monat',
          'Alle 13 Vorlagen',
          'Premium-Schriftarten',
          'Mehrsprachige Unterstuetzung',
          'Karriere-Coach',
          'Ohne Wasserzeichen',
        ],
      },
      creditPack: '3 Dokumentgenerierungen fuer $2,99 — ohne Wasserzeichen, in Ihrem Konto gespeichert. Credits verfallen nie.',
    },
    faq: {
      title: 'Haeufig gestellte Fragen',
      subtitle: 'Alles, was Sie ueber Resume Studio wissen muessen',
      items: [
        {
          question: 'Was genau macht Resume Studio?',
          answer:
            'Sie fuegen eine Stellenanzeige ein, ergaenzen Ihre Erfahrung, und Resume Studio erstellt ein komplettes Bewerbungspaket: ATS-optimierter Lebenslauf, Anschreiben, LinkedIn-Zusammenfassung, Kaltakquise-E-Mail, Interview-Leitfaden und Zertifizierungsempfehlungen -- alles auf die jeweilige Stelle zugeschnitten.',
        },
        {
          question: 'Was ist ein ATS-Score und warum ist er wichtig?',
          answer:
            'ATS (Applicant Tracking System) ist Software, die die meisten Unternehmen einsetzen, um Lebenslaeufe zu filtern, bevor ein Mensch sie sieht. Unser ATS-Score vergleicht Ihren Lebenslauf mit der Stellenanzeige und zeigt, wie gut er passt. Fehlen Schluesselwoerter, ergaenzt unser Tool sie automatisch.',
        },
        {
          question: 'Sind meine Daten sicher?',
          answer:
            'Ja. Ihre Dokumente und persoenlichen Daten werden sicher gespeichert -- mit Zugriffskontrolle auf Zeilenebene, verschluesselt waehrend der Uebertragung und niemals an Dritte weitergegeben. Wir nutzen Ihre Daten nicht zum Trainieren von KI-Modellen. Sie koennen Ihr Konto und alle Daten jederzeit loeschen.',
        },
        {
          question: 'Kann ich Resume Studio in meiner Sprache nutzen?',
          answer:
            'Nutzer des Pro-Plans koennen Dokumente in 11 Sprachen generieren, darunter Spanisch, Franzoesisch, Deutsch, Portugiesisch, Chinesisch, Japanisch, Koreanisch, Hindi, Arabisch und Italienisch -- plus jede benutzerdefinierte Sprache.',
        },
        {
          question: 'Was passiert nach meinen 2 kostenlosen Dokumenten?',
          answer:
            'Sie koennen bis zum naechsten Monat warten und erneut 2 kostenlose Dokumente erhalten, ein Kreditpaket kaufen (3 Generierungen fuer $2,99, unbegrenzt gueltig) oder auf Basic ($5,99/Monat) oder Pro ($10,99/Monat) upgraden.',
        },
        {
          question: 'Kann ich mein Abonnement jederzeit kuendigen?',
          answer:
            'Ja. Es gibt keine Vertraege und keine Kuendigungsgebuehren. Sie koennen in Ihren Einstellungen kuendigen und behalten den Zugang bis zum Ende Ihres Abrechnungszeitraums.',
        },
      ],
    },
    cta: {
      title: 'Bereit fuer mehr Vorstellungsgespraeche?',
      subtitle:
        '6 massgeschneiderte Dokumente aus einer einzigen Stellenanzeige. ATS-optimiert, interview-fertig und in unter 60 Sekunden erstellt.',
      button: 'Kostenlos starten',
      note: 'Keine Kreditkarte erforderlich. 2 kostenlose Dokumente jeden Monat.',
    },
    nav: {
      features: 'Funktionen',
      howItWorks: 'So funktioniert es',
      pricing: 'Preise',
      blog: 'Blog',
      roastMyResume: 'Lebenslauf-Roast',
      roastFree: 'GRATIS',
      signIn: 'Anmelden',
      getStartedFree: 'Kostenlos starten',
      product: 'Produkt',
      resources: 'Ressourcen',
      documents: 'Dokumente',
      support: 'Support',
      faq: 'FAQ',
      tagline: 'Intelligente Bewerbungsdokumente. Landen Sie Ihren Traumjob mit einem Klick.',
      resumeBuilder: 'Lebenslauf-Ersteller',
      coverLetter: 'Anschreiben',
      linkedInSummary: 'LinkedIn-Zusammenfassung',
      interviewPrep: 'Interview-Vorbereitung',
      contactUs: 'Kontakt',
      privacyPolicy: 'Datenschutz',
      termsOfService: 'Nutzungsbedingungen',
      allRightsReserved: 'Alle Rechte vorbehalten.',
      alsoAvailableIn: 'Auch verfuegbar auf:',
    },
    roastPage: {
      badge: 'Gratis — Keine Anmeldung noetig',
      title: 'Lebenslauf-Roast',
      subtitle: 'Fuegen Sie eine Stellenanzeige und Ihren Lebenslauf ein. Unsere KI bewertet ihn, findet fehlende Schluesselwoerter und liefert eine brutal ehrliche Kritik mit Loesungen.',
      jdLabel: 'Stellenbeschreibung',
      jdPlaceholder: 'Stellenbeschreibung hier einfuegen...',
      resumeLabel: 'Ihr Lebenslauf (Klartext)',
      resumePlaceholder: 'Lebenslauftext hier einfuegen...',
      submitButton: 'Lebenslauf roasten',
      jdMinChars: 'Die Stellenbeschreibung muss mindestens 50 Zeichen lang sein',
      resumeMinChars: 'Der Lebenslauf muss mindestens 50 Zeichen lang sein',
      loadingMessages: [
        'Lebenslauf wird auf Fehler gescannt...',
        'Schluesselwoerter werden mit der Stelle verglichen...',
        'ATS-Ueberlebenschancen werden berechnet...',
        'Aufzaehlungspunkte werden gnadenlos bewertet...',
        'Vergessene Faehigkeiten werden gesucht...',
        'Ihr Roast wird vorbereitet...',
        'Fast fertig — letzte Korrekturen...',
      ],
      keywordMatch: 'Schluesselwort-Uebereinstimmung',
      impactScore: 'Wirkung-Score',
      atsCompatibility: 'ATS-Kompatibilitaet',
      skillsGap: 'Kompetenzluecke',
      matched: 'Uebereinstimmend',
      missing: 'Fehlend',
      strongBullets: 'Starke Punkte',
      weakBullets: 'Schwache Punkte',
      covered: 'Abgedeckt',
      noAtsIssues: 'Keine ATS-Probleme erkannt.',
      formattingIssues: 'Formatierungsprobleme',
      top3Fixes: 'Die 3 wichtigsten Korrekturen',
      theRoast: 'Der Roast',
      shareYourScore: 'Teilen Sie Ihren Score',
      shareOnLinkedIn: 'Auf LinkedIn teilen',
      shareOnX: 'Auf X teilen',
      copyLink: 'Link kopieren',
      copied: 'Kopiert!',
      shareText: 'KI hat meinen Lebenslauf geroastet und ich habe {score}/100 bekommen. Schaffst du mehr?',
      ctaTitle: 'Alles korrigieren?',
      ctaSubtitle: 'Resume Studio erstellt ATS-optimierte Lebenslaeufe, Anschreiben und mehr — zugeschnitten auf jede Stelle.',
      ctaButton: 'Kostenlos starten',
      ctaPricing: 'Preise ansehen',
    },
    contactPage: {
      title: 'Kontakt',
      subtitle: 'Eine Frage, einen Fehler gefunden oder eine Funktion gewuenscht? Wir freuen uns auf Ihre Nachricht.',
      nameLabel: 'Name',
      namePlaceholder: 'Ihr Name',
      emailLabel: 'E-Mail',
      emailPlaceholder: 'sie@beispiel.de',
      subjectLabel: 'Betreff',
      subjectPlaceholder: 'Kurze Beschreibung',
      categoryLabel: 'Kategorie',
      messageLabel: 'Nachricht',
      messagePlaceholder: 'Sagen Sie uns, was Sie bewegt...',
      sending: 'Wird gesendet...',
      sendMessage: 'Nachricht senden',
      messageSentTitle: 'Nachricht gesendet',
      messageSentBody: 'Vielen Dank fuer Ihre Nachricht. Wir werden sie pruefen und uns bald bei Ihnen melden.',
      caseNumberLabel: 'Ihre Fallnummer ist',
    },
    blogPage: {
      title: 'Karrieretipps und Lebenslauf-Ratgeber',
      subtitle: 'Expertenratgeber zu Lebenslauf-Erstellung, ATS-Optimierung und wie Sie mehr Vorstellungsgespraeche bekommen.',
      metaTitle: 'Blog — Lebenslauf-Tipps, ATS-Ratgeber und Karrieretipps',
      metaDescription: 'Expertenratgeber zu Lebenslauf-Erstellung, ATS-Optimierung, Anschreiben, LinkedIn-Profilen und Vorbereitung auf Vorstellungsgespraeche.',
    },
    ghostboardPage: {
      metaTitle: 'GhostBoard — Bewerten Sie die Einstellungserfahrung von Unternehmen',
      metaDescription: 'Erfahren Sie, welche Unternehmen Bewerber ignorieren. Bewerten Sie Antwortzeiten, Interviewqualitaet und Transparenz.',
    },
  },

  // ---------------------------------------------------------------------------
  // Portuguese
  // ---------------------------------------------------------------------------
  pt: {
    locale: 'pt',
    langName: 'Portuguese',
    nativeName: 'Portugues',
    hero: {
      badge: 'Documentos de carreira inteligentes',
      title: 'Conquiste o emprego dos seus sonhos',
      titleAccent: 'com um clique',
      subtitle:
        'Cole uma vaga de emprego, adicione sua experiencia e receba um pacote completo de candidatura: curriculo otimizado para ATS, carta de apresentacao, resumo para LinkedIn, e-mail de abordagem e preparacao para entrevistas, em segundos.',
      ctaPrimary: 'Comece gratis, sem cartao',
      ctaSecondary: 'Veja como funciona',
      freeNote: '2 documentos gratis por mes. Nenhum cartao de credito necessario.',
    },
    features: {
      title: 'Funcionalidades',
      items: [
        {
          title: 'Analise da vaga',
          description:
            'A IA analisa a descricao da vaga para extrair habilidades, palavras-chave e requisitos.',
        },
        {
          title: 'Pontuacao ATS',
          description:
            'Verifique o quanto seu curriculo corresponde a vaga e corrija palavras-chave ausentes.',
        },
        {
          title: 'Pacote completo em um clique',
          description:
            'Curriculo, carta de apresentacao, resumo para LinkedIn, e-mail de abordagem e preparacao para entrevistas, tudo de uma vez.',
        },
        {
          title: 'Modelos profissionais',
          description:
            '10 modelos premium de curriculo com fontes e tamanhos configuraveis.',
        },
        {
          title: 'Acompanhamento de candidaturas',
          description:
            'Acompanhe suas candidaturas e faca follow-up no momento certo.',
        },
        {
          title: 'Preparacao para entrevistas',
          description:
            'Receba perguntas de entrevista personalizadas com respostas modelo e dicas.',
        },
      ],
    },
    howItWorks: {
      title: 'Como funciona',
      subtitle: 'Da vaga de emprego a candidatura completa em 4 passos',
      steps: [
        {
          title: 'Cole a vaga de emprego',
          description: 'Copie qualquer anuncio de vaga e cole aqui.',
        },
        {
          title: 'Adicione sua experiencia',
          description: 'Envie seu curriculo ou os dados mais importantes.',
        },
        {
          title: 'Gere os documentos',
          description: 'A IA cria 6 documentos personalizados.',
        },
        {
          title: 'Baixe e candidate-se',
          description: 'Baixe os PDFs e envie sua candidatura.',
        },
      ],
    },
    pricing: {
      title: 'Planos e precos',
      subtitle: 'Escolha o plano ideal para voce',
      free: {
        name: 'Gratis',
        description: 'Perfeito para experimentar',
        cta: 'Comecar gratis',
        features: [
          '2 documentos por mes',
          'Pontuacao ATS basica',
          'Download em PDF (com marca d\'agua)',
          '3 modelos de curriculo',
        ],
      },
      basic: {
        name: 'Basic',
        description: 'Para quem esta em busca ativa de emprego',
        cta: 'Escolher Basic',
        features: [
          '10 documentos por mes',
          'Todos os 13 modelos',
          'Sem marca d\'agua',
          'Salvar ate 10 candidaturas',
          'Analise ATS avancada',
          'Acompanhamento de candidaturas',
        ],
      },
      pro: {
        name: 'Pro',
        description: 'Para quem leva a busca de emprego a serio',
        cta: 'Escolher Pro',
        features: [
          '20 documentos por mes',
          'Todos os 13 modelos',
          'Fontes premium',
          'Suporte multilinguaje',
          'Coach de carreira',
          'Sem marca d\'agua',
        ],
      },
      creditPack: '3 geracoes de documentos por $2,99 — sem marca d\'agua, salvas na sua conta. Os creditos nunca expiram.',
    },
    faq: {
      title: 'Perguntas frequentes',
      subtitle: 'Tudo o que voce precisa saber sobre o Resume Studio',
      items: [
        {
          question: 'O que o Resume Studio faz exatamente?',
          answer:
            'Voce cola uma vaga de emprego, adiciona sua experiencia, e o Resume Studio gera um pacote completo de candidatura: curriculo otimizado para ATS, carta de apresentacao, resumo para LinkedIn, e-mail de abordagem, guia de preparacao para entrevistas e recomendacoes de certificacoes -- tudo personalizado para aquela vaga.',
        },
        {
          question: 'O que e a pontuacao ATS e por que ela importa?',
          answer:
            'ATS (Applicant Tracking System) e um software que a maioria das empresas usa para filtrar curriculos antes que um ser humano os leia. Nossa pontuacao ATS analisa seu curriculo em relacao a vaga e mostra o grau de correspondencia. Se palavras-chave estiverem faltando, nossa ferramenta as adiciona automaticamente.',
        },
        {
          question: 'Meus dados estao seguros?',
          answer:
            'Sim. Seus documentos e informacoes pessoais sao armazenados com seguranca, com controle de acesso por linha, criptografados em transito e nunca compartilhados com terceiros. Nao usamos seus dados para treinar modelos de IA. Voce pode excluir sua conta e todos os dados a qualquer momento.',
        },
        {
          question: 'Posso usar o Resume Studio no meu idioma?',
          answer:
            'Usuarios do plano Pro podem gerar documentos em 11 idiomas, incluindo espanhol, frances, alemao, portugues, chines, japones, coreano, hindi, arabe e italiano, alem de qualquer idioma personalizado.',
        },
        {
          question: 'O que acontece depois dos meus 2 documentos gratis?',
          answer:
            'Voce pode esperar ate o proximo mes para receber mais 2 documentos gratis, comprar um pacote de creditos (3 geracoes por $2,99, sem validade), ou fazer upgrade para Basic ($5,99/mes) ou Pro ($10,99/mes).',
        },
        {
          question: 'Posso cancelar minha assinatura a qualquer momento?',
          answer:
            'Sim. Nao ha contratos nem taxas de cancelamento. Voce pode cancelar na pagina de configuracoes e mantera o acesso ate o final do seu periodo de cobranca.',
        },
      ],
    },
    cta: {
      title: 'Pronto para conseguir mais entrevistas?',
      subtitle:
        '6 documentos personalizados a partir de uma unica vaga de emprego. Otimizados para ATS, prontos para a entrevista e gerados em menos de 60 segundos.',
      button: 'Comece gratis',
      note: 'Sem cartao de credito. 2 documentos gratis todo mes.',
    },
    nav: {
      features: 'Funcionalidades',
      howItWorks: 'Como funciona',
      pricing: 'Precos',
      blog: 'Blog',
      roastMyResume: 'Critique meu CV',
      roastFree: 'GRATIS',
      signIn: 'Entrar',
      getStartedFree: 'Comece gratis',
      product: 'Produto',
      resources: 'Recursos',
      documents: 'Documentos',
      support: 'Suporte',
      faq: 'FAQ',
      tagline: 'Documentos de carreira inteligentes. Conquiste o emprego dos seus sonhos com um clique.',
      resumeBuilder: 'Criador de curriculo',
      coverLetter: 'Carta de apresentacao',
      linkedInSummary: 'Resumo LinkedIn',
      interviewPrep: 'Preparacao para entrevista',
      contactUs: 'Contato',
      privacyPolicy: 'Politica de privacidade',
      termsOfService: 'Termos de servico',
      allRightsReserved: 'Todos os direitos reservados.',
      alsoAvailableIn: 'Tambem disponivel em:',
    },
    roastPage: {
      badge: 'Gratis — Sem cadastro',
      title: 'Critique meu CV',
      subtitle: 'Cole uma vaga de emprego e seu curriculo. Nossa IA vai pontuar, encontrar palavras-chave faltando e fazer uma critica brutalmente honesta com correcoes.',
      jdLabel: 'Descricao da vaga',
      jdPlaceholder: 'Cole a descricao da vaga aqui...',
      resumeLabel: 'Seu curriculo (texto simples)',
      resumePlaceholder: 'Cole o texto do seu curriculo aqui...',
      submitButton: 'Critique meu CV',
      jdMinChars: 'A descricao da vaga precisa de pelo menos 50 caracteres',
      resumeMinChars: 'O curriculo precisa de pelo menos 50 caracteres',
      loadingMessages: [
        'Analisando seu curriculo em busca de erros...',
        'Comparando palavras-chave com a vaga...',
        'Calculando suas chances no ATS...',
        'Julgando seus topicos sem piedade...',
        'Encontrando habilidades que voce esqueceu...',
        'Preparando sua critica...',
        'Quase pronto — ultimos ajustes...',
      ],
      keywordMatch: 'Correspondencia de palavras-chave',
      impactScore: 'Pontuacao de impacto',
      atsCompatibility: 'Compatibilidade ATS',
      skillsGap: 'Lacuna de habilidades',
      matched: 'Correspondentes',
      missing: 'Faltando',
      strongBullets: 'Topicos fortes',
      weakBullets: 'Topicos fracos',
      covered: 'Cobertas',
      noAtsIssues: 'Nenhum problema de ATS detectado.',
      formattingIssues: 'Problemas de formatacao',
      top3Fixes: 'As 3 correcoes principais',
      theRoast: 'A critica',
      shareYourScore: 'Compartilhe sua pontuacao',
      shareOnLinkedIn: 'Compartilhar no LinkedIn',
      shareOnX: 'Compartilhar no X',
      copyLink: 'Copiar link',
      copied: 'Copiado!',
      shareText: 'A IA criticou meu curriculo e eu tirei {score}/100. Acha que consegue mais?',
      ctaTitle: 'Quer corrigir tudo?',
      ctaSubtitle: 'Resume Studio gera curriculos otimizados para ATS, cartas de apresentacao e mais — adaptados para cada vaga.',
      ctaButton: 'Comece gratis',
      ctaPricing: 'Ver precos',
    },
    contactPage: {
      title: 'Contato',
      subtitle: 'Tem uma pergunta, encontrou um bug ou quer solicitar uma funcionalidade? Adorariamos ouvir de voce.',
      nameLabel: 'Nome',
      namePlaceholder: 'Seu nome',
      emailLabel: 'E-mail',
      emailPlaceholder: 'voce@exemplo.com',
      subjectLabel: 'Assunto',
      subjectPlaceholder: 'Breve descricao',
      categoryLabel: 'Categoria',
      messageLabel: 'Mensagem',
      messagePlaceholder: 'Conte-nos o que esta pensando...',
      sending: 'Enviando...',
      sendMessage: 'Enviar mensagem',
      messageSentTitle: 'Mensagem enviada',
      messageSentBody: 'Obrigado por entrar em contato. Vamos analisar sua mensagem e responder em breve.',
      caseNumberLabel: 'Seu numero de caso e',
    },
    blogPage: {
      title: 'Dicas de carreira e curriculo',
      subtitle: 'Guias de especialistas sobre redacao de curriculo, otimizacao ATS e como conseguir mais entrevistas.',
      metaTitle: 'Blog — Dicas de curriculo, guias ATS e conselhos de carreira',
      metaDescription: 'Conselhos de especialistas sobre redacao de curriculo, otimizacao ATS, cartas de apresentacao, perfis do LinkedIn e preparacao para entrevistas.',
    },
    ghostboardPage: {
      metaTitle: 'GhostBoard — Avalie a experiencia de contratacao das empresas',
      metaDescription: 'Descubra quais empresas ignoram candidatos. Avalie tempos de resposta, qualidade de entrevista e transparencia.',
    },
  },

  // ---------------------------------------------------------------------------
  // Hindi
  // ---------------------------------------------------------------------------
  hi: {
    locale: 'hi',
    langName: 'Hindi',
    nativeName: 'Hindi',
    hero: {
      badge: 'Smart Career Documents',
      title: 'Apne sapnon ki naukri payen',
      titleAccent: 'bas ek click mein',
      subtitle:
        'Job description paste karein, apna experience daalein, aur poora application package paayein -- ATS-optimized resume, cover letter, LinkedIn summary, cold email, aur interview ki taiyaari -- bas kuch secondon mein.',
      ctaPrimary: 'Muft shuru karein -- credit card nahi chahiye',
      ctaSecondary: 'Dekhein kaise kaam karta hai',
      freeNote: 'Har mahine 2 muft documents. Credit card ki zaroorat nahi.',
    },
    features: {
      title: 'Features',
      items: [
        {
          title: 'JD Analysis',
          description:
            'AI job description ka vishleshan karke skills, keywords aur requirements nikalta hai.',
        },
        {
          title: 'ATS Score',
          description:
            'Dekhein aapka resume job se kitna match karta hai aur missing keywords ko fix karein.',
        },
        {
          title: 'Ek Click mein Poora Package',
          description:
            'Resume, cover letter, LinkedIn summary, cold email, aur interview prep -- sab ek saath.',
        },
        {
          title: 'Pro Templates',
          description:
            '10 premium resume templates jismein fonts aur sizes customize kar sakte hain.',
        },
        {
          title: 'Job Tracker',
          description:
            'Apni applications track karein aur sahi samay par follow up karein.',
        },
        {
          title: 'Interview ki Taiyaari',
          description:
            'Aapke liye bane interview questions paayein -- model answers aur tips ke saath.',
        },
      ],
    },
    howItWorks: {
      title: 'Kaise kaam karta hai',
      subtitle: 'Job posting se lekar poori application tak -- 4 aasaan steps mein',
      steps: [
        {
          title: 'Job Description paste karein',
          description: 'Koi bhi job posting copy karein aur yahaan paste karein.',
        },
        {
          title: 'Apna Experience daalein',
          description: 'Apna resume ya zaroori jaankari add karein.',
        },
        {
          title: 'Documents banayein',
          description: 'AI 6 customized documents taiyaar karta hai.',
        },
        {
          title: 'Download karein aur Apply karein',
          description: 'PDFs download karein aur apply karein.',
        },
      ],
    },
    pricing: {
      title: 'Plans aur Prices',
      subtitle: 'Apne liye sahi plan chunein',
      free: {
        name: 'Free',
        description: 'Try karne ke liye perfect',
        cta: 'Muft shuru karein',
        features: [
          'Har mahine 2 documents',
          'Basic ATS score',
          'PDF download (watermark ke saath)',
          '3 resume templates',
        ],
      },
      basic: {
        name: 'Basic',
        description: 'Active job seekers ke liye',
        cta: 'Basic chunein',
        features: [
          'Har mahine 10 documents',
          'Sabhi 13 templates',
          'Bina watermark',
          '10 applications save karein',
          'Advanced ATS analysis',
          'Job tracker',
        ],
      },
      pro: {
        name: 'Pro',
        description: 'Serious job seekers ke liye',
        cta: 'Pro chunein',
        features: [
          'Har mahine 20 documents',
          'Sabhi 13 templates',
          'Premium fonts',
          'Multi-language support',
          'Career Coach',
          'Bina watermark',
        ],
      },
      creditPack: '3 document generations sirf $2.99 mein — bina watermark, aapke account mein save. Credits kabhi expire nahi hote.',
    },
    faq: {
      title: 'Aksar Poochhe Jaane Waale Sawaal',
      subtitle: 'Resume Studio ke baare mein sab kuch jaanein',
      items: [
        {
          question: 'Resume Studio kya karta hai?',
          answer:
            'Aap ek job description paste karein, apna experience daalein, aur Resume Studio poora application package banata hai -- ATS-optimized resume, cover letter, LinkedIn summary, cold outreach email, interview prep guide, aur certification recommendations -- sab us specific role ke hisaab se.',
        },
        {
          question: 'ATS score kya hai aur yeh kyun zaroori hai?',
          answer:
            'ATS (Applicant Tracking System) ek software hai jo zyaadatar companies resumes ko filter karne ke liye use karti hain -- kisi insaan ke dekhne se pehle. Hamara ATS score aapke resume ko job description se compare karke batata hai ki kitna match hai. Agar keywords missing hain, to hamara tool unhe khud jod deta hai.',
        },
        {
          question: 'Kya mera data surakshit hai?',
          answer:
            'Haan. Aapke documents aur personal information row-level security ke saath surakshit store hote hain, transit mein encrypted hain, aur kabhi kisi third party ke saath share nahi kiye jaate. Hum aapke data ka use AI models train karne ke liye nahi karte. Aap apna account aur saara data kabhi bhi delete kar sakte hain.',
        },
        {
          question: 'Kya main Resume Studio apni bhaasha mein use kar sakta/sakti hoon?',
          answer:
            'Pro plan ke users 11 bhaashaon mein documents generate kar sakte hain -- Spanish, French, German, Portuguese, Chinese, Japanese, Korean, Hindi, Arabic, aur Italian -- saath hi koi bhi custom bhaasha.',
        },
        {
          question: 'Mere 2 muft documents ke baad kya hoga?',
          answer:
            'Aap agle mahine ka intezaar kar sakte hain 2 aur muft documents ke liye, credit pack kharid sakte hain (3 generations sirf $2.99 mein, kabhi expire nahi hote), ya Basic ($5.99/mahina) ya Pro ($10.99/mahina) mein upgrade kar sakte hain.',
        },
        {
          question: 'Kya main apna subscription kabhi bhi cancel kar sakta/sakti hoon?',
          answer:
            'Haan. Koi contract nahi, koi cancellation fee nahi. Aap settings page se cancel kar sakte hain aur aapka access billing period ke end tak bana rahega.',
        },
      ],
    },
    cta: {
      title: 'Zyaada interviews paane ke liye taiyaar hain?',
      subtitle:
        'Ek hi job description se 6 customized documents. ATS-optimized, interview-ready, aur 60 second se bhi kam mein taiyaar.',
      button: 'Muft shuru karein',
      note: 'Credit card nahi chahiye. Har mahine 2 muft documents.',
    },
    nav: {
      features: 'Features',
      howItWorks: 'Kaise kaam karta hai',
      pricing: 'Plans aur Prices',
      blog: 'Blog',
      roastMyResume: 'Resume ki Dhulai',
      roastFree: 'MUFT',
      signIn: 'Sign In',
      getStartedFree: 'Muft shuru karein',
      product: 'Product',
      resources: 'Resources',
      documents: 'Documents',
      support: 'Support',
      faq: 'FAQ',
      tagline: 'Smart career documents. Apne sapnon ki naukri payen bas ek click mein.',
      resumeBuilder: 'Resume Builder',
      coverLetter: 'Cover Letter',
      linkedInSummary: 'LinkedIn Summary',
      interviewPrep: 'Interview ki Taiyaari',
      contactUs: 'Sampark karein',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      allRightsReserved: 'Sarvaadhikaar surakshit.',
      alsoAvailableIn: 'Yeh bhi uplabdh hai:',
    },
    roastPage: {
      badge: 'Muft — Signup ki zaroorat nahi',
      title: 'Resume ki Dhulai',
      subtitle: 'Job description aur apna resume paste karein. Hamari AI score degi, missing keywords dhundhegi aur brutally honest critica degi — solutions ke saath.',
      jdLabel: 'Job Description',
      jdPlaceholder: 'Job description yahaan paste karein...',
      resumeLabel: 'Aapka Resume (plain text)',
      resumePlaceholder: 'Resume ka text yahaan paste karein...',
      submitButton: 'Resume ki Dhulai karein',
      jdMinChars: 'Job description mein kam se kam 50 characters chahiye',
      resumeMinChars: 'Resume mein kam se kam 50 characters chahiye',
      loadingMessages: [
        'Aapka resume scan ho raha hai...',
        'Keywords ko JD se compare kar rahe hain...',
        'ATS mein pass hone ke chances calculate ho rahe hain...',
        'Aapke bullet points ka nirdayata se judgment ho raha hai...',
        'Bhool gayi skills dhundh rahe hain...',
        'Aapki critica taiyaar ho rahi hai...',
        'Lagbhag ho gaya — finishing touches...',
      ],
      keywordMatch: 'Keyword Match',
      impactScore: 'Impact Score',
      atsCompatibility: 'ATS Compatibility',
      skillsGap: 'Skills Gap',
      matched: 'Match',
      missing: 'Missing',
      strongBullets: 'Strong Bullets',
      weakBullets: 'Weak Bullets',
      covered: 'Covered',
      noAtsIssues: 'Koi ATS problem nahi mila.',
      formattingIssues: 'Formatting Issues',
      top3Fixes: 'Top 3 Fixes',
      theRoast: 'Dhulai',
      shareYourScore: 'Apna Score Share karein',
      shareOnLinkedIn: 'LinkedIn par share karein',
      shareOnX: 'X par share karein',
      copyLink: 'Link copy karein',
      copied: 'Copy ho gaya!',
      shareText: 'AI ne mera resume roast kiya aur mujhe {score}/100 mila. Lagta hai tum better kar sakte ho?',
      ctaTitle: 'Sab kuch theek karna hai?',
      ctaSubtitle: 'Resume Studio ATS-optimized resumes, cover letters, aur bahut kuch generate karta hai — har job ke hisaab se.',
      ctaButton: 'Muft shuru karein',
      ctaPricing: 'Prices dekhein',
    },
    contactPage: {
      title: 'Sampark karein',
      subtitle: 'Koi sawaal hai, bug mila ya feature chahiye? Hum aapki baat sunna chahte hain.',
      nameLabel: 'Naam',
      namePlaceholder: 'Aapka naam',
      emailLabel: 'Email',
      emailPlaceholder: 'aap@example.com',
      subjectLabel: 'Vishay',
      subjectPlaceholder: 'Sankshipt vivaran',
      categoryLabel: 'Category',
      messageLabel: 'Sandesh',
      messagePlaceholder: 'Humein bataiye kya chal raha hai...',
      sending: 'Bhej rahe hain...',
      sendMessage: 'Sandesh bhejein',
      messageSentTitle: 'Sandesh bhej diya gaya',
      messageSentBody: 'Sampark karne ke liye dhanyavaad. Hum aapka sandesh dekhenge aur jald javab denge.',
      caseNumberLabel: 'Aapka case number hai',
    },
    blogPage: {
      title: 'Career Tips aur Resume Salaah',
      subtitle: 'Resume likhne, ATS optimization aur zyaada interviews paane ke liye expert guides.',
      metaTitle: 'Blog — Resume Tips, ATS Guides aur Career Salaah',
      metaDescription: 'Resume likhne, ATS optimization, cover letters, LinkedIn profiles aur interview ki taiyaari par expert salaah.',
    },
    ghostboardPage: {
      metaTitle: 'GhostBoard — Companies ki hiring experience ko rate karein',
      metaDescription: 'Jaanein kaunsi companies candidates ko ignore karti hain. Response time, interview quality aur transparency rate karein.',
    },
  },
}

/** English defaults for roast page (used when no locale is active) */
export const englishRoastPage: LandingTranslation['roastPage'] = {
  badge: 'Free — No signup required',
  title: 'Roast My Resume',
  subtitle: 'Paste a job description and your resume. Our AI will score it, find keyword gaps, and deliver a brutally honest roast — with actionable fixes.',
  jdLabel: 'Job Description',
  jdPlaceholder: 'Paste the job description here...',
  resumeLabel: 'Your Resume (plain text)',
  resumePlaceholder: 'Paste your resume text here...',
  submitButton: 'Roast My Resume',
  jdMinChars: 'Job description needs at least 50 characters',
  resumeMinChars: 'Resume needs at least 50 characters',
  loadingMessages: [
    'Scanning your resume for red flags...',
    'Comparing keywords against the JD...',
    'Calculating your ATS survival odds...',
    'Judging your bullet points mercilessly...',
    'Finding the skills you forgot to mention...',
    'Preparing your roast...',
    'Almost done — putting the finishing burns on...',
  ],
  keywordMatch: 'Keyword Match',
  impactScore: 'Impact Score',
  atsCompatibility: 'ATS Compatibility',
  skillsGap: 'Skills Gap',
  matched: 'Matched',
  missing: 'Missing',
  strongBullets: 'Strong Bullets',
  weakBullets: 'Weak Bullets',
  covered: 'Covered',
  noAtsIssues: 'No ATS issues detected.',
  formattingIssues: 'Formatting Issues',
  top3Fixes: 'Top 3 Fixes',
  theRoast: 'The Roast',
  shareYourScore: 'Share Your Score',
  shareOnLinkedIn: 'Share on LinkedIn',
  shareOnX: 'Share on X',
  copyLink: 'Copy Link',
  copied: 'Copied!',
  shareText: 'I just got my resume roasted by AI and scored {score}/100. Think you can do better?',
  ctaTitle: 'Want to fix everything?',
  ctaSubtitle: 'Resume Studio generates ATS-optimized resumes, cover letters, and more — tailored to every job.',
  ctaButton: 'Get Started Free',
  ctaPricing: 'See Pricing',
}

/** English defaults for contact page (used when no locale is active) */
export const englishContactPage: LandingTranslation['contactPage'] = {
  title: 'Contact Us',
  subtitle: 'Have a question, found a bug, or want to request a feature? We\'d love to hear from you.',
  nameLabel: 'Name',
  namePlaceholder: 'Your name',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  subjectLabel: 'Subject',
  subjectPlaceholder: 'Brief description',
  categoryLabel: 'Category',
  messageLabel: 'Message',
  messagePlaceholder: 'Tell us what\'s on your mind...',
  sending: 'Sending...',
  sendMessage: 'Send Message',
  messageSentTitle: 'Message Sent',
  messageSentBody: 'Thank you for reaching out. We\'ll review your message and get back to you soon.',
  caseNumberLabel: 'Your case number is',
}

/** English defaults for blog page (used when no locale is active) */
export const englishBlogPage: LandingTranslation['blogPage'] = {
  title: 'Career Advice & Resume Tips',
  subtitle: 'Expert guides on resume writing, ATS optimization, and landing more interviews.',
  metaTitle: 'Blog — Resume Tips, ATS Guides & Career Advice',
  metaDescription: 'Expert advice on resume writing, ATS optimization, cover letters, LinkedIn profiles, and interview preparation. Free guides updated for 2026.',
}

/** English defaults for nav (used when no locale is active) */
export const englishNav: LandingTranslation['nav'] = {
  features: 'Features',
  howItWorks: 'How It Works',
  pricing: 'Pricing',
  blog: 'Blog',
  roastMyResume: 'Roast My Resume',
  roastFree: 'FREE',
  signIn: 'Sign In',
  getStartedFree: 'Get Started Free',
  product: 'Product',
  resources: 'Resources',
  documents: 'Documents',
  support: 'Support',
  faq: 'FAQ',
  tagline: 'Smart career document generation. Land your dream job with one click.',
  resumeBuilder: 'Resume Builder',
  coverLetter: 'Cover Letter',
  linkedInSummary: 'LinkedIn Summary',
  interviewPrep: 'Interview Prep',
  contactUs: 'Contact Us',
  privacyPolicy: 'Privacy Policy',
  termsOfService: 'Terms of Service',
  allRightsReserved: 'All rights reserved.',
  alsoAvailableIn: 'Also available in:',
}
