export function slugify(text: string): string {
  return text
    .normalize('NFD')                   // separa acento da letra
    .replace(/[\u0300-\u036f]/g, '')    // remove os acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')       // remove tudo que não é letra/número/espaço/hífen
    .replace(/\s+/g, '-')               // espaço vira hífen
    .replace(/-+/g, '-')                // colapsa hífens duplicados
    .replace(/^-|-$/g, '');             // remove hífen do início/fim
}