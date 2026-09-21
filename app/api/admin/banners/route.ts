import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/app/utils/supabase/server';
import { adminActionRateLimit } from '@/app/utils/redis' 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitas exportações em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const { data: banners, error } = await supabase
    .from('banners')
    .select('*, categories(name)')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const withCategoryName = (banners ?? []).map((b) => ({
    ...b,
    category_name: (b as any).categories?.name ?? null,
    categories: undefined,
  }));

  return NextResponse.json({ banners: withCategoryName });
}

const MAX_TITLE_LENGTH = 30;
const MAX_DESCRIPTION_LENGTH = 100;
const MAX_URL_LENGTH = 700;

function isValidUrl(value: string): boolean {
  if (value.startsWith('/')) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const file = formData.get('file') as File | null;
  const title = (formData.get('title') as string) || null;
  const description = (formData.get('description') as string) || null;
  const link_type = formData.get('link_type') as string;
  const category_id = (formData.get('category_id') as string) || null;
  const custom_url = (formData.get('custom_url') as string) || null;
  const page = (formData.get('page') as string) || null;
  const position = (formData.get('position') as string) || null;
  //const sort_order = Number(formData.get('sort_order')) || 0;
  const active = formData.get('active') === 'true';

  if (!file) {
    return NextResponse.json(
      { error: 'Mídia é obrigatória' },
      { status: 400 },
    );
  }
  if (!page) {
    return NextResponse.json({ error: 'Selecione a página do banner' }, { status: 400 });
  }
  if (!position) {
    return NextResponse.json({ error: 'Selecione a posição do banner' }, { status: 400 });
  }
  if (link_type === 'category' && !category_id) {
    return NextResponse.json(
      { error: 'Selecione uma categoria para o link' },
      { status: 400 },
    );
  }
  if (title && title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json(
      { error: `Título muito longo (máximo ${MAX_TITLE_LENGTH} caracteres)` },
      { status: 400 },
    );
  }
  if (description && description.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json(
      { error: `Descrição muito longo (máximo ${MAX_DESCRIPTION_LENGTH} caracteres)` },
      { status: 400 },
    );
  }
  if (link_type === 'url' && custom_url) {
    if (custom_url.length > MAX_URL_LENGTH) {
      return NextResponse.json({ error: 'URL muito longa' }, { status: 400 });
    }
    if (!isValidUrl(custom_url.trim())) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }
  }

  if (link_type === 'url' && !custom_url?.trim()) {
    return NextResponse.json({ error: 'Informe a URL do link' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Arquivo precisa ser uma imagem' }, { status: 400 });
  }

  const ALLOWED_TYPES = ['image/', 'video/'];
  if (!ALLOWED_TYPES.some((prefix) => file.type.startsWith(prefix))) {
    return NextResponse.json(
      { error: 'Arquivo precisa ser uma imagem ou vídeo' },
      { status: 400 },
    );
  }

  const isVideo = file.type.startsWith('video/');
  const MAX_SIZE_MB = isVideo ? 30 : 5;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `Arquivo muito grande — máximo ${MAX_SIZE_MB}MB para ${isVideo ? 'vídeos' : 'imagens'}` },
      { status: 400 },
    );
  }

  let image_url: string;
  let image_public_id: string;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'savanna/banners', 
            resource_type: 'auto',
            context:{
              alt: title ?? '',
              caption: description ?? '',
            }
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          },
        );
        uploadStream.end(buffer);
      },
    );

    image_url = result.secure_url;
    image_public_id = result.public_id;
  } catch (err) {
    console.error('Erro no upload do banner:', err);
    return NextResponse.json({ error: 'Falha no upload da imagem' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('banners')
    .insert({
      title: title?.trim() || null,
      description: description?.trim() || null,
      image_url,
      image_public_id,
      link_type,
      category_id: link_type === 'category' ? category_id : null,
      custom_url: link_type === 'url' ? custom_url?.trim() : null,
      page,
      position,
      //sort_order,
      active,
    })
    .select()
    .single();

  if (error) {
    cloudinary.uploader.destroy(image_public_id).catch((cleanupErr) => {
      console.error('Falha ao limpar imagem após erro no insert:', cleanupErr);
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateTag('banners', 'max');

  return NextResponse.json({ banner: data }, { status: 201 });
}