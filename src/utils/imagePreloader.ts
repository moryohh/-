import spaceBiomeImg from '../assets/images/space_minimal_void_1786901269341.jpg';
import deepSeaBiomeImg from '../assets/images/ocean_clean_biome_1786901297268.jpg';
import biome1Img from '../assets/images/biome1_snow_mountain_1786898662715.jpg';
import biome2Img from '../assets/images/biome2_green_farm_1786898677268.jpg';
import biome3Img from '../assets/images/biome3_harbor_refinery_1786898690005.jpg';
import biome4Img from '../assets/images/biome4_night_realm_1786898703967.jpg';
import { GRADE_6_SUBJECTS } from '../data/mockSubjects';
import { INITIAL_STORIES } from '../data/mockData';

// List of all critical visual assets to preload instantly in the background
export const CRITICAL_APP_IMAGES = [
  spaceBiomeImg,
  deepSeaBiomeImg,
  biome1Img,
  biome2Img,
  biome3Img,
  biome4Img,
  ...GRADE_6_SUBJECTS.map((s) => s.teacherAvatar).filter(Boolean),
  ...INITIAL_STORIES.map((st) => st.avatar).filter(Boolean),
];

/**
 * Preloads all crucial map biomes, subject cards, and UI images
 * immediately into the browser cache so navigation is instant without delay.
 */
export function preloadAppImages(): void {
  if (typeof window === 'undefined') return;

  // Use requestIdleCallback or setTimeout to not block initial render
  const runPreload = () => {
    CRITICAL_APP_IMAGES.forEach((src) => {
      if (!src) return;
      
      // Standard HTML5 Image preloader
      const img = new Image();
      img.decoding = 'async';
      img.src = src;

      // Link preload header injection if supported
      try {
        const existingLink = document.querySelector(`link[rel="prefetch"][href="${src}"]`);
        if (!existingLink) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.as = 'image';
          link.href = src;
          document.head.appendChild(link);
        }
      } catch {
        // Safe fallback
      }
    });
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runPreload, { timeout: 1000 });
  } else {
    setTimeout(runPreload, 100);
  }
}
