export const ADJECTIVES = [
  { id: 'ponctuel',      label: 'Ponctuel' },
  { id: 'pedagogue',     label: 'Pédagogue' },
  { id: 'genereux',      label: 'Généreux' },
  { id: 'creatif',       label: 'Créatif' },
  { id: 'patient',       label: 'Patient' },
  { id: 'fiable',        label: 'Fiable' },
  { id: 'chaleureux',    label: 'Chaleureux' },
  { id: 'bienveillant',  label: 'Bienveillant' },
  { id: 'enthousiaste',  label: 'Enthousiaste' },
  { id: 'curieux',       label: 'Curieux' },
] as const

export type AdjectiveId = (typeof ADJECTIVES)[number]['id']
