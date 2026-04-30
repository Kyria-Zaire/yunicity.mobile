/** Identifiant stable d’un post (ex. `p1-p0-0` → `p1`) pour détail / API / store. */
export function canonicalFeedPostId(id: string): string {
  return id.replace(/-p\d+-\d+$/, '') || id;
}
