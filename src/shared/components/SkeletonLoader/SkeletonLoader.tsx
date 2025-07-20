import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


import { BaseSkeletonProps } from './SkeletonLoader.types';

function SkeletonLoader(props: BaseSkeletonProps) {
  return <Skeleton {...props} />;
}

export function TextSkeleton(props: Omit<BaseSkeletonProps, 'height' | 'width' | 'borderRadius' | 'circle'>) {
  return (
    <>
      <SkeletonLoader count={props.count || 1} height={20} className={props.className} />
    </>
  );
}

export function CardSkeleton(props: Omit<BaseSkeletonProps, 'height' | 'width' | 'borderRadius' | 'count' | 'circle'>) {
  return (
    <div className={`flex flex-col gap-2 p-4 border rounded ${props.className || ''}`}>
      <SkeletonLoader height={150} />
      <SkeletonLoader width="80%" /> 
      <SkeletonLoader count={2} />
      <SkeletonLoader width="40%" /> 
    </div>
  );
}

export function AvatarSkeleton(props: Omit<BaseSkeletonProps, 'borderRadius' | 'height' | 'width'>) {
  return <SkeletonLoader {...props} circle={true} height={50} width={50} />;
}

export default SkeletonLoader;