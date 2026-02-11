/** Vérifier si c'est un lien externe */
export function isExternal(path: string): boolean {
  return /^(?:https?:|mailto:|tel:)/.test(path)
}
