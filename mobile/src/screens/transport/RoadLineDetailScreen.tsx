/**
 * Road Line Detail Screen
 *
 * Wrapper for LineDetailScreen for road transport.
 */

import React from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { LineDetailScreen } from './LineDetailScreen';
import type { MainStackParamList } from '../../navigation/types';

type RoadLineDetailRouteProp = RouteProp<MainStackParamList, 'RoadLineDetail'>;

export function RoadLineDetailScreen(): React.JSX.Element {
  const route = useRoute<RoadLineDetailRouteProp>();
  const { lineId } = route.params;

  return <LineDetailScreen lineId={lineId} transportType="road" />;
}

export default RoadLineDetailScreen;
