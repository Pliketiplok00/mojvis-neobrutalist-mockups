/**
 * Font Loading Infrastructure
 *
 * Uses expo-font with Google Fonts for consistent typography.
 * - Space Grotesk: Display/headings (H1, H2)
 * - Space Mono: Body/UI text
 *
 * Phase 1: Fonts + Icons Infrastructure
 */

import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';

/**
 * Font family names as they appear after loading.
 * These must match the keys used in useFonts.
 */
export const FontFamilies = {
  // Space Grotesk variants
  spaceGroteskRegular: 'SpaceGrotesk_400Regular',
  spaceGroteskMedium: 'SpaceGrotesk_500Medium',
  spaceGroteskSemiBold: 'SpaceGrotesk_600SemiBold',
  spaceGroteskBold: 'SpaceGrotesk_700Bold',

  // Space Mono variants
  spaceMonoRegular: 'SpaceMono_400Regular',
  spaceMonoBold: 'SpaceMono_700Bold',
} as const;

/**
 * Hook to load all custom fonts.
 * Returns [fontsLoaded, error] tuple.
 *
 * Usage:
 * ```tsx
 * const [fontsLoaded, fontError] = useAppFonts();
 * if (!fontsLoaded) return <SplashScreen />;
 * ```
 */
export function useAppFonts(): [boolean, Error | null] {
  const [fontsLoaded, error] = useFonts({
    [FontFamilies.spaceGroteskRegular]: SpaceGrotesk_400Regular,
    [FontFamilies.spaceGroteskMedium]: SpaceGrotesk_500Medium,
    [FontFamilies.spaceGroteskSemiBold]: SpaceGrotesk_600SemiBold,
    [FontFamilies.spaceGroteskBold]: SpaceGrotesk_700Bold,
    [FontFamilies.spaceMonoRegular]: SpaceMono_400Regular,
    [FontFamilies.spaceMonoBold]: SpaceMono_700Bold,
  });

  return [fontsLoaded, error];
}

export default useAppFonts;
