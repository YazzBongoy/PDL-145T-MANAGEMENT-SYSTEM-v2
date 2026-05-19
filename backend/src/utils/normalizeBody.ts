/**
 * Normalise les champs d'un req.body en acceptant indifféremment
 * camelCase (ex: "name") et PascalCase (ex: "Name").
 *
 * Usage:
 *   const b = normalizeBody(req.body);
 *   const name = b.name;          // accepte "name" ou "Name"
 *   const startDate = b.startDate; // accepte "startDate" ou "StartDate"
 */
export function normalizeBody(body: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(body)) {
    const normalized = key.charAt(0).toLowerCase() + key.slice(1);
    // Priorité camelCase, écrase si PascalCase déjà présent
    if (!(normalized in result) || body[key] !== undefined) {
      result[normalized] = body[key];
    }
  }
  return result;
}
