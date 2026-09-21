// lib/ui-constants.ts
export const rowDeletingClass = (isDeleting: boolean) =>
  `transition-opacity ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`