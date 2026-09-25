/**
 * Langues proposees et regle de choix. Volontairement sans DOM ni Vue : le
 * navigateur ne rentre que par les arguments, donc la regle se teste sans
 * simuler `navigator` ni `localStorage`.
 */

/**
 * `tag` est l'etiquette BCP 47, pas l'identifiant : elle sert a `Intl` et a
 * l'attribut `lang` du document.
 *
 * `nom` est l'endonyme — le nom de la langue DANS cette langue.
 */
export const LANGUES = [
  { id: 'en', tag: 'en', emoji: '🇬🇧', nom: 'English' },
  { id: 'es', tag: 'es', emoji: '🇪🇸', nom: 'Español' },
  { id: 'pt', tag: 'pt-BR', emoji: '🇧🇷', nom: 'Português' }
] as const

export type Langue = (typeof LANGUES)[number]['id']

export const LANGUE_PAR_DEFAUT: Langue = 'es'

export function estLangue(valeur: string | null | undefined): valeur is Langue {
  return LANGUES.some((l) => l.id === valeur)
}

export function tagDe(langue: Langue): string {
  return LANGUES.find((l) => l.id === langue)!.tag
}

/**
 * Langue a afficher au demarrage.
 *
 * Un choix explicite gagne toujours. Sinon on parcourt les preferences du
 * navigateur DANS L'ORDRE. A defaut, l'espagnol — c'est la base du mur.
 */
export function choisirLangue(memorisee: string | null, preferences: readonly string[]): Langue {
  if (estLangue(memorisee)) return memorisee
  for (const tag of preferences) {
    let base: string
    try {
      base = new Intl.Locale(tag).language
    } catch {
      continue
    }
    if (estLangue(base)) return base
  }
  return LANGUE_PAR_DEFAUT
}
