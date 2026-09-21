'use server'

import { createClient } from '@/app/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleOrderValidation(orderId: number, validated: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ validated })
    .eq('id', orderId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/orders')
}