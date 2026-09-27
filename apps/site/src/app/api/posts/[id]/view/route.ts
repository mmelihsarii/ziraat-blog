/**
 * Dosyanın görevi: Yayındaki makalenin görüntülenmesini atomik veritabanı fonksiyonuyla bir artırır.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createPublicClient } from '@/lib/supabase/public';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Yayındaki makalenin görüntülenmesini atomik veritabanı fonksiyonuyla bir artırır. */
export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: 'Geçersiz makale kimliği' }, { status: 400 });
  }
  const supabase = createPublicClient();
  const { error } = await supabase.rpc('increment_post_views', { post_uuid: id });
  if (error) {
    return NextResponse.json({ error: 'Görüntülenme kaydedilemedi' }, { status: 503 });
  }
  return new NextResponse(null, { status: 204 });
}
