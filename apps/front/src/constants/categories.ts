export enum CategoryId {
  JardinageBricolage  = 'jardinage-bricolage',
  GardeAnimaux        = 'garde-animaux',
  CoursesMobilite     = 'courses-mobilite',
  CuisineRepas        = 'cuisine-repas',
  InformatiqueAdmin   = 'informatique-admin',
  SoutienScolaire     = 'soutien-scolaire',
  Compagnie           = 'compagnie',
  ArtisanatCreation   = 'artisanat-creation',
  BienEtreSport       = 'bien-etre-sport',
  MusiqueArts         = 'musique-arts',
  NatureEnvironnement = 'nature-environnement',
}

// ─── Sous-catégories (IDs existants inchangés) ───────────────────────────────

export enum JardinageBricolageSubcatId {
  Jardinage        = 'jardinage',
  TailleHaies      = 'taille-haies',
  Bricolage        = 'bricolage',
  Couture          = 'couture',
  Plomberie        = 'plomberie',
  Electricite      = 'electricite',
  PeintureBatiment = 'peinture-batiment',
  Maconnerie       = 'maconnerie',
  ReparationVelos  = 'reparation-velos',
}

export enum GardeAnimauxSubcatId {
  GardeEnfants      = 'garde-enfants',
  BabySitting       = 'baby-sitting',
  GardeAnimaux      = 'garde-animaux',
  Dressage          = 'dressage',
  ToilettageAnimaux = 'toilettage-animaux',
}

export enum CoursesMobiliteSubcatId {
  Courses         = 'courses',
  TransportMedical = 'transport-medical',
  Covoiturage     = 'covoiturage',
}

export enum CuisineRepasSubcatId {
  CuisineADomicile  = 'cuisine-a-domicile',
  CoursDeCuisine    = 'cours-de-cuisine',
  Conserves         = 'conserves',
  LactoFermentation = 'lacto-fermentation',
  Boulangerie       = 'boulangerie',
  Confiture         = 'confiture',
}

export enum InformatiqueAdminSubcatId {
  SmartphoneTablette = 'smartphone-tablette',
  Ordinateur         = 'ordinateur',
  DemarchesEnLigne   = 'demarches-en-ligne',
  RedactionCourriers = 'redaction-courriers',
}

export enum SoutienScolaireSubcatId {
  Primaire      = 'primaire',
  College       = 'college',
  Lycee         = 'lycee',
  Langues       = 'langues',
  Mathematiques = 'mathematiques',
  Francais      = 'francais',
  HistoireGeo   = 'histoire-geo',
  Sciences      = 'sciences',
  PhysiqueChimie = 'physique-chimie',
  Philosophie   = 'philosophie',
}

export enum CompagnieSubcatId {
  VisiteADomicile  = 'visite-a-domicile',
  JeuxDeSociete    = 'jeux-de-societe',
  Balade           = 'balade',
  LectureVoixHaute = 'lecture-voix-haute',
}

export enum ArtisanatCreationSubcatId {
  Menuiserie  = 'menuiserie',
  Poterie     = 'poterie',
  TricotCrochet = 'tricot-crochet',
  Vannerie    = 'vannerie',
  SavonBougies = 'savon-bougies',
  Bijoux      = 'bijoux',
}

export enum BienEtreSportSubcatId {
  Yoga          = 'yoga',
  Meditation    = 'meditation',
  Randonnee     = 'randonnee',
  Velo          = 'velo',
  Sophrologie   = 'sophrologie',
  SportCollectif = 'sport-collectif',
}

export enum MusiqueArtsSubcatId {
  Guitare  = 'guitare',
  Piano    = 'piano',
  Chant    = 'chant',
  Dessin   = 'dessin',
  Peinture = 'peinture',
  Photo    = 'photo',
  Video    = 'video',
}

export enum NatureEnvironnementSubcatId {
  Cueillette            = 'cueillette',
  Apiculture            = 'apiculture',
  Maraichage            = 'maraichage',
  Compostage            = 'compostage',
  IdentificationPlantes = 'identification-plantes',
  GrainesBoutures       = 'graines-boutures',
}

export type SubcatId =
  | JardinageBricolageSubcatId
  | GardeAnimauxSubcatId
  | CoursesMobiliteSubcatId
  | CuisineRepasSubcatId
  | InformatiqueAdminSubcatId
  | SoutienScolaireSubcatId
  | CompagnieSubcatId
  | ArtisanatCreationSubcatId
  | BienEtreSportSubcatId
  | MusiqueArtsSubcatId
  | NatureEnvironnementSubcatId

// ─── Catégories ──────────────────────────────────────────────────────────────

export const CATEGORIES = [
  {
    id: CategoryId.JardinageBricolage,
    label: 'Jardinage & Bricolage',
    emoji: '🌿',
    bg: '#E1F5EE',
    subcategories: [
      { id: JardinageBricolageSubcatId.Jardinage,        label: 'Jardinage' },
      { id: JardinageBricolageSubcatId.TailleHaies,      label: 'Taille / haies' },
      { id: JardinageBricolageSubcatId.Bricolage,        label: 'Bricolage' },
      { id: JardinageBricolageSubcatId.Couture,          label: 'Couture' },
      { id: JardinageBricolageSubcatId.Plomberie,        label: 'Plomberie' },
      { id: JardinageBricolageSubcatId.Electricite,      label: 'Électricité' },
      { id: JardinageBricolageSubcatId.PeintureBatiment, label: 'Peinture bâtiment' },
      { id: JardinageBricolageSubcatId.Maconnerie,       label: 'Maçonnerie' },
      { id: JardinageBricolageSubcatId.ReparationVelos,  label: 'Réparation vélos' },
    ],
  },
  {
    id: CategoryId.GardeAnimaux,
    label: 'Garde & Animaux',
    emoji: '🧒',
    bg: '#FFF3E0',
    subcategories: [
      { id: GardeAnimauxSubcatId.GardeEnfants,      label: 'Garde enfants' },
      { id: GardeAnimauxSubcatId.BabySitting,        label: 'Baby-sitting' },
      { id: GardeAnimauxSubcatId.GardeAnimaux,       label: 'Garde animaux' },
      { id: GardeAnimauxSubcatId.Dressage,           label: 'Dressage' },
      { id: GardeAnimauxSubcatId.ToilettageAnimaux,  label: 'Toilettage' },
    ],
  },
  {
    id: CategoryId.CoursesMobilite,
    label: 'Courses & Mobilité',
    emoji: '🚗',
    bg: '#E3F2FD',
    subcategories: [
      { id: CoursesMobiliteSubcatId.Courses,          label: 'Courses' },
      { id: CoursesMobiliteSubcatId.TransportMedical, label: 'Transport médical' },
      { id: CoursesMobiliteSubcatId.Covoiturage,      label: 'Covoiturage' },
    ],
  },
  {
    id: CategoryId.CuisineRepas,
    label: 'Cuisine & Repas',
    emoji: '🍲',
    bg: '#FCE4EC',
    subcategories: [
      { id: CuisineRepasSubcatId.CuisineADomicile,  label: 'Cuisine à domicile' },
      { id: CuisineRepasSubcatId.CoursDeCuisine,    label: 'Cours de cuisine' },
      { id: CuisineRepasSubcatId.Conserves,         label: 'Conserves & bocaux' },
      { id: CuisineRepasSubcatId.LactoFermentation, label: 'Lacto-fermentation' },
      { id: CuisineRepasSubcatId.Boulangerie,       label: 'Boulangerie & pain' },
      { id: CuisineRepasSubcatId.Confiture,         label: 'Confitures & gelées' },
    ],
  },
  {
    id: CategoryId.InformatiqueAdmin,
    label: 'Informatique & Admin',
    emoji: '💻',
    bg: '#F3E5F5',
    subcategories: [
      { id: InformatiqueAdminSubcatId.SmartphoneTablette, label: 'Smartphone / tablette' },
      { id: InformatiqueAdminSubcatId.Ordinateur,         label: 'Ordinateur' },
      { id: InformatiqueAdminSubcatId.DemarchesEnLigne,   label: 'Démarches en ligne' },
      { id: InformatiqueAdminSubcatId.RedactionCourriers, label: 'Rédaction courriers' },
    ],
  },
  {
    id: CategoryId.SoutienScolaire,
    label: 'Soutien scolaire',
    emoji: '📚',
    bg: '#FBE9E7',
    subcategories: [
      { id: SoutienScolaireSubcatId.Primaire,       label: 'Primaire' },
      { id: SoutienScolaireSubcatId.College,        label: 'Collège' },
      { id: SoutienScolaireSubcatId.Lycee,          label: 'Lycée' },
      { id: SoutienScolaireSubcatId.Langues,        label: 'Langues' },
      { id: SoutienScolaireSubcatId.Mathematiques,  label: 'Mathématiques' },
      { id: SoutienScolaireSubcatId.Francais,       label: 'Français' },
      { id: SoutienScolaireSubcatId.HistoireGeo,    label: 'Histoire-Géo' },
      { id: SoutienScolaireSubcatId.Sciences,       label: 'Sciences (SVT)' },
      { id: SoutienScolaireSubcatId.PhysiqueChimie, label: 'Physique-Chimie' },
      { id: SoutienScolaireSubcatId.Philosophie,    label: 'Philosophie' },
    ],
  },
  {
    id: CategoryId.Compagnie,
    label: 'Compagnie',
    emoji: '🤝',
    bg: '#ECEFF1',
    subcategories: [
      { id: CompagnieSubcatId.VisiteADomicile,  label: 'Visite à domicile' },
      { id: CompagnieSubcatId.JeuxDeSociete,    label: 'Jeux de société' },
      { id: CompagnieSubcatId.Balade,           label: 'Balade' },
      { id: CompagnieSubcatId.LectureVoixHaute, label: 'Lecture à voix haute' },
    ],
  },
  {
    id: CategoryId.ArtisanatCreation,
    label: 'Artisanat & Création',
    emoji: '🎨',
    bg: '#FFF8E1',
    subcategories: [
      { id: ArtisanatCreationSubcatId.Menuiserie,   label: 'Menuiserie' },
      { id: ArtisanatCreationSubcatId.Poterie,      label: 'Poterie' },
      { id: ArtisanatCreationSubcatId.TricotCrochet, label: 'Tricot / crochet' },
      { id: ArtisanatCreationSubcatId.Vannerie,     label: 'Vannerie' },
      { id: ArtisanatCreationSubcatId.SavonBougies, label: 'Savon & bougies' },
      { id: ArtisanatCreationSubcatId.Bijoux,       label: 'Bijoux' },
    ],
  },
  {
    id: CategoryId.BienEtreSport,
    label: 'Bien-être & Sport',
    emoji: '🏃',
    bg: '#E8F5E9',
    subcategories: [
      { id: BienEtreSportSubcatId.Yoga,          label: 'Yoga' },
      { id: BienEtreSportSubcatId.Meditation,    label: 'Méditation' },
      { id: BienEtreSportSubcatId.Randonnee,     label: 'Randonnée' },
      { id: BienEtreSportSubcatId.Velo,          label: 'Vélo' },
      { id: BienEtreSportSubcatId.Sophrologie,   label: 'Sophrologie' },
      { id: BienEtreSportSubcatId.SportCollectif, label: 'Sport collectif' },
    ],
  },
  {
    id: CategoryId.MusiqueArts,
    label: 'Musique & Arts',
    emoji: '🎵',
    bg: '#EDE7F6',
    subcategories: [
      { id: MusiqueArtsSubcatId.Guitare,  label: 'Guitare' },
      { id: MusiqueArtsSubcatId.Piano,    label: 'Piano / claviers' },
      { id: MusiqueArtsSubcatId.Chant,    label: 'Chant' },
      { id: MusiqueArtsSubcatId.Dessin,   label: 'Dessin' },
      { id: MusiqueArtsSubcatId.Peinture, label: 'Peinture' },
      { id: MusiqueArtsSubcatId.Photo,    label: 'Photographie' },
      { id: MusiqueArtsSubcatId.Video,    label: 'Vidéo' },
    ],
  },
  {
    id: CategoryId.NatureEnvironnement,
    label: 'Nature & Environnement',
    emoji: '🌾',
    bg: '#F1F8E9',
    subcategories: [
      { id: NatureEnvironnementSubcatId.Cueillette,            label: 'Cueillette' },
      { id: NatureEnvironnementSubcatId.Apiculture,            label: 'Apiculture' },
      { id: NatureEnvironnementSubcatId.Maraichage,            label: 'Maraîchage' },
      { id: NatureEnvironnementSubcatId.Compostage,            label: 'Compostage' },
      { id: NatureEnvironnementSubcatId.IdentificationPlantes, label: 'Identification de plantes' },
      { id: NatureEnvironnementSubcatId.GrainesBoutures,       label: 'Graines & boutures' },
    ],
  },
] as const
