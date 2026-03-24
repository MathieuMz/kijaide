export enum CategoryId {
  JardinageBricolage = 'jardinage-bricolage',
  GardeAnimaux = 'garde-animaux',
  CoursesMobilite = 'courses-mobilite',
  CuisineRepas = 'cuisine-repas',
  InformatiqueAdmin = 'informatique-admin',
  SoutienScolaire = 'soutien-scolaire',
  Compagnie = 'compagnie',
}

export enum JardinageBricolageSubcatId {
  Jardinage = 'jardinage',
  TailleHaies = 'taille-haies',
  Bricolage = 'bricolage',
  Couture = 'couture',
}

export enum GardeAnimauxSubcatId {
  GardeEnfants = 'garde-enfants',
  BabySitting = 'baby-sitting',
  GardeAnimaux = 'garde-animaux',
}

export enum CoursesMobiliteSubcatId {
  Courses = 'courses',
  TransportMedical = 'transport-medical',
  Covoiturage = 'covoiturage',
}

export enum CuisineRepasSubcatId {
  CuisineADomicile = 'cuisine-a-domicile',
  CoursDeCuisine = 'cours-de-cuisine',
}

export enum InformatiqueAdminSubcatId {
  SmartphoneTablette = 'smartphone-tablette',
  Ordinateur = 'ordinateur',
  DemarchesEnLigne = 'demarches-en-ligne',
  RedactionCourriers = 'redaction-courriers',
}

export enum SoutienScolaireSubcatId {
  Primaire = 'primaire',
  College = 'college',
  Lycee = 'lycee',
  Langues = 'langues',
}

export enum CompagnieSubcatId {
  VisiteADomicile = 'visite-a-domicile',
  JeuxDeSociete = 'jeux-de-societe',
  Balade = 'balade',
}

export type SubcatId =
  | JardinageBricolageSubcatId
  | GardeAnimauxSubcatId
  | CoursesMobiliteSubcatId
  | CuisineRepasSubcatId
  | InformatiqueAdminSubcatId
  | SoutienScolaireSubcatId
  | CompagnieSubcatId

export const CATEGORIES = [
  {
    id: CategoryId.JardinageBricolage,
    label: 'Jardinage & Bricolage',
    emoji: '🌿',
    bg: '#E1F5EE',
    subcategories: [
      { id: JardinageBricolageSubcatId.Jardinage,   label: 'Jardinage' },
      { id: JardinageBricolageSubcatId.TailleHaies, label: 'Taille / haies' },
      { id: JardinageBricolageSubcatId.Bricolage,   label: 'Bricolage' },
      { id: JardinageBricolageSubcatId.Couture,     label: 'Couture' },
    ],
  },
  {
    id: CategoryId.GardeAnimaux,
    label: 'Garde & Animaux',
    emoji: '🧒',
    bg: '#FFF3E0',
    subcategories: [
      { id: GardeAnimauxSubcatId.GardeEnfants, label: 'Garde enfants' },
      { id: GardeAnimauxSubcatId.BabySitting,  label: 'Baby-sitting' },
      { id: GardeAnimauxSubcatId.GardeAnimaux, label: 'Garde animaux' },
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
      { id: CuisineRepasSubcatId.CuisineADomicile, label: 'Cuisine à domicile' },
      { id: CuisineRepasSubcatId.CoursDeCuisine,   label: 'Cours de cuisine' },
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
      { id: SoutienScolaireSubcatId.Primaire, label: 'Primaire' },
      { id: SoutienScolaireSubcatId.College,  label: 'Collège' },
      { id: SoutienScolaireSubcatId.Lycee,    label: 'Lycée' },
      { id: SoutienScolaireSubcatId.Langues,  label: 'Langues' },
    ],
  },
  {
    id: CategoryId.Compagnie,
    label: 'Compagnie',
    emoji: '🤝',
    bg: '#ECEFF1',
    subcategories: [
      { id: CompagnieSubcatId.VisiteADomicile, label: 'Visite à domicile' },
      { id: CompagnieSubcatId.JeuxDeSociete,   label: 'Jeux de société' },
      { id: CompagnieSubcatId.Balade,          label: 'Balade' },
    ],
  },
] as const
