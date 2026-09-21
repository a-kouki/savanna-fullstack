import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@/app/utils/supabase/server';
import { revalidateTag } from 'next/cache';
import { adminActionRateLimit } from '@/app/utils/redis' 
import { getBannerMediaType } from '@/lib/utils';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Next.js 15 — params é Promise
) {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const { id } = await params;

  const { data, error } = await supabase.from('banners').select('*').eq('id', id).single();

  if (error || !data) {
    return NextResponse.json({ error: 'Banner não encontrado' }, { status: 404 });
  }

  revalidateTag('banners', 'max');
  return NextResponse.json({ banner: data });
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  /*
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }*/

  const { id } = await params;
  const formData = await request.formData();

  const file = formData.get('file') as File | null;
  const currentImageUrl = (formData.get('image_url') as string) || '';
  const currentPublicId = (formData.get('image_public_id') as string) || '';
  const title = (formData.get('title') as string) || null;
  const description = (formData.get('description') as string) || null;
  const link_type = formData.get('link_type') as string;
  const category_id = (formData.get('category_id') as string) || null;
  const custom_url = (formData.get('custom_url') as string) || null;
  const page = (formData.get('page') as string) || null;
  const position = (formData.get('position') as string) || null;
  const active = formData.get('active') === 'true';

  if (!file && !currentImageUrl) {
    return NextResponse.json({ error: 'Mídia  é obrigatória' }, { status: 400 });
  }
  if (!page) {
    return NextResponse.json({ error: 'Selecione a página do banner' }, { status: 400 });
  }
  if (!position) {
    return NextResponse.json({ error: 'Selecione a posição do banner' }, { status: 400 });
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
  if (link_type === 'category' && !category_id) {
    return NextResponse.json({ error: 'Selecione uma categoria para o link' }, { status: 400 });
  }
  if (link_type === 'url' && !custom_url?.trim()) {
    return NextResponse.json({ error: 'Informe a URL do link' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('banners')
    .select('image_public_id, image_url')
    .eq('id', id)
    .single();

  const oldResourceType: 'image' | 'video' =
    getBannerMediaType(existing?.image_url ?? currentImageUrl) === 'video' ? 'video' : 'image';

  let image_url = currentImageUrl;
  let image_public_id = currentPublicId;
  let newResourceType: 'image' | 'video' = oldResourceType; 

  const finalPublicId = file ? image_public_id : currentPublicId;
  cloudinary.uploader
    .explicit(finalPublicId, {
      type: 'upload',
      resource_type: oldResourceType,
      context: `alt=${title?.trim() ?? ''}|caption=${description?.trim() ?? ''}`,
    })
    .catch((err) => {
      console.error('Falha ao atualizar metadata do banner no Cloudinary:', err);
    });

  if (file) {
    const ALLOWED_TYPES = ['image/', 'video/'];
    if (!ALLOWED_TYPES.some((prefix) => file.type.startsWith(prefix))) {
      return NextResponse.json({ error: 'Arquivo precisa ser uma imagem ou vídeo' }, { status: 400 });
    }

    const isVideo = file.type.startsWith('video/');
    newResourceType = isVideo ? 'video' : 'image';
    const MAX_SIZE_MB = isVideo ? 30 : 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Arquivo muito grande — máximo ${MAX_SIZE_MB}MB para ${isVideo ? 'vídeos' : 'imagens'}` },
        { status: 400 },
      );
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'savanna/banners',
              resource_type: 'auto',
              context: {
                alt: title?.trim() ?? '',
                caption: description?.trim() ?? '',
              },
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
  }

  const { data, error } = await supabase
    .from('banners')
    .update({
      title: title?.trim() || null,
      description: description?.trim() || null,
      image_url,
      image_public_id,
      link_type,
      category_id: link_type === 'category' ? category_id : null,
      custom_url: link_type === 'url' ? custom_url?.trim() : null,
      page,
      position,
      active,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (file) {
      cloudinary.uploader.destroy(image_public_id, { resource_type: newResourceType }).catch((cleanupErr) => {
        console.error('Falha ao limpar imagem após erro no update:', cleanupErr);
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (file && existing?.image_public_id && existing.image_public_id !== image_public_id) {
    try {
      await cloudinary.uploader.destroy(existing.image_public_id, {
        resource_type: oldResourceType,
      });
    } catch (err) {
      console.error('Falha ao remover imagem antiga do banner:', err);
    }
  }

  revalidateTag('banners', 'max');

  return NextResponse.json({ banner: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (typeof body.active === 'boolean') updates.active = body.active;
  if (typeof body.sort_order === 'number') updates.sort_order = body.sort_order;

  const { data, error } = await supabase
    .from('banners')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  revalidateTag('banners', 'max');
  return NextResponse.json({ banner: data });
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const { id } = await params;

  const { data: existing } = await supabase
    .from('banners')
    .select('image_public_id')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('banners').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existing?.image_public_id) {
    cloudinary.uploader.destroy(existing.image_public_id).catch((err) => {
      console.error('Falha ao remover imagem do banner deletado:', err);
    });
  }

  revalidateTag('banners', 'max');
  return NextResponse.json({ success: true });
}