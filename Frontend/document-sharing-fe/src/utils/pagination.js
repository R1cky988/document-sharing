export function paginateLocal(docs, page, size) {
  const start = page * size;
  return {
    content: docs.slice(start, start + size),
    page: {
      size,
      totalElements: docs.length,
      totalPages: Math.ceil(docs.length / size),
      number: page,
    },
  };
}
