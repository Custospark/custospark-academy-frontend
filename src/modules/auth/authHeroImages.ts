/**
 * Online hero images for auth pages (mirrors Custosell authHeroImages.ts).
 * Unsplash URLs keep the bundle lean - no local hero assets.
 */

export const AUTH_HERO_IMAGES = {
  login:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  register:
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  forgot:
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
  reset:
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
} as const