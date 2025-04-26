import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SkeletonProps {
  count?: number;
  height?: number | string;
  width?: number | string;
  borderRadius?: number | string;
  className?: string;
}

function AppSkeleton(props: SkeletonProps) {
  return <Skeleton {...props} />;
}

export default AppSkeleton;