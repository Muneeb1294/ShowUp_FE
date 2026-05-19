export function normalizePagination(data, fallbackPage = 1) {
  const totalProjects = Number(data?.totalProjects) || 0;
  const pageSize = Number(data?.pageSize) || 10;
  const totalPages = Math.max(
    1,
    Number(data?.totalPages) || Math.ceil(totalProjects / pageSize) || 1,
  );
  const currentPage = Math.min(
    Math.max(1, Number(data?.currentPage) || fallbackPage),
    totalPages,
  );

  return {
    totalProjects,
    pageSize,
    totalPages,
    currentPage,
    hasNextPage:
      data?.hasNextPage != null
        ? Boolean(data.hasNextPage)
        : currentPage < totalPages,
    hasPrevPage:
      data?.hasPrevPage != null
        ? Boolean(data.hasPrevPage)
        : currentPage > 1,
  };
}
