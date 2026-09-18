export type CategoryNodeImage = {
  id: string;
  url: string;
  secure_url: string;
  alt: string | null;
};

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageId: string | null;
  image: CategoryNodeImage | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children: CategoryNode[];
  _count: { children: number };
};

export type CategoryOption = {
  id: string;
  name: string;
  depth: number;
};

export function flattenCategories(
  nodes: CategoryNode[],
  depth = 0,
  result: CategoryOption[] = [],
): CategoryOption[] {
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name, depth });
    flattenCategories(node.children, depth + 1, result);
  }

  return result;
}

export function countCategories(nodes: CategoryNode[]): number {
  return nodes.reduce(
    (total, node) => total + 1 + countCategories(node.children),
    0,
  );
}

export function countActive(nodes: CategoryNode[]): number {
  return nodes.reduce(
    (total, node) =>
      total + (node.isActive ? 1 : 0) + countActive(node.children),
    0,
  );
}

export function filterCategories(
  nodes: CategoryNode[],
  query: string,
): CategoryNode[] {
  const q = query.trim().toLowerCase();

  if (!q) {
    return nodes;
  }

  const result: CategoryNode[] = [];

  for (const node of nodes) {
    const children = filterCategories(node.children, q);
    const matches =
      node.name.toLowerCase().includes(q) ||
      node.slug.toLowerCase().includes(q);

    if (matches || children.length > 0) {
      result.push({ ...node, children });
    }
  }

  return result;
}

export function collectCategoryIds(nodes: CategoryNode[]): string[] {
  const ids: string[] = [];

  for (const node of nodes) {
    ids.push(node.id);
    ids.push(...collectCategoryIds(node.children));
  }

  return ids;
}
