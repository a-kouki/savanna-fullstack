export type Ration = '1x1' | '4x5' | '1.91x1' | '9x16'

export const rationClass : Record<Ration, string> = {
  '1x1':    'aspect-square',
  '4x5':    'aspect-[4/5]',
  '1.91x1': 'aspect-[1.91/1]',
  '9x16':   'aspect-[9/16]',
}

export function getRationclass(ratio?: string){
    return rationClass[(ratio as Ration) ?? '4x5'] ?? 'aspect-[4/5]'
}