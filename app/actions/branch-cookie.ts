'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function setActiveBranchCookie(branchId: string | null) {
  const cookieStore = await cookies();
  if (branchId) {
    cookieStore.set('lazoo_active_branch', branchId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 año
    });
  } else {
    cookieStore.delete('lazoo_active_branch');
  }
  
  // Refrescar el dashboard completo
  revalidatePath('/dashboard', 'layout');
}
