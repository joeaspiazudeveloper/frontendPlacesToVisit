import AppSkeleton from '../../../shared/components/AppSkeleton';


const PlaceItemSkeleton = () => {
  return (
    <div className="place-item-skeleton">
      <AppSkeleton height={200} borderRadius={8} />
      <AppSkeleton width="80%" height={24} />
      <AppSkeleton height={16} count={3} />
    </div>
  );
};

export default PlaceItemSkeleton;