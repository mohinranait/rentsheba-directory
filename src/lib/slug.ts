export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uniqueSlug(
  candidate: string,
  isDuplicate: (slug: string) => Promise<boolean>,
): Promise<string> {
  if (!candidate) {
    candidate = `category-${Date.now()}`;
  }

  let finalSlug = candidate;
  let suffix = 2;

  while (await isDuplicate(finalSlug)) {
    finalSlug = `${candidate}-${suffix}`;
    suffix += 1;
  }

  return finalSlug;
}
