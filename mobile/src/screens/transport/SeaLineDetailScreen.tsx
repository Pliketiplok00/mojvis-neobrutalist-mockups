/**
 * Sea Line Detail Screen
 *
 * Wrapper for LineDetailScreen for sea transport.
 */

import React from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { LineDetailScreen } from './LineDetailScreen';
import type { MainStackParamList } from '../../navigation/types';

type SeaLineDetailRouteProp = RouteProp<MainStackParamList, 'SeaLineDetail'>;

export function SeaLineDetailScreen(): React.JSX.Element {
  const route = useRoute<SeaLineDetailRouteProp>();
  const { lineId } = route.params;

  return <LineDetailScreen lineId={lineId} transportType="sea" />;
}

export default SeaLineDetailScreen;
