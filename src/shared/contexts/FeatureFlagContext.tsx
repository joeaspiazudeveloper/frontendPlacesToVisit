import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { FeatureFlags, FeatureFlag } from '../types/FeatureFlagType';
import { toast } from 'react-toastify';

interface FeatureFlagContextType {
  featureFlags: FeatureFlags;
  loading: boolean;
  updateFlag: (_id: string, enabled: boolean) => Promise<void>;
  flagsList: FeatureFlag[];
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider = ({ children }: { children: ReactNode }) => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({});
  const [flagsList, setFlagsList] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/featureFlags`);
      const apiFlags: FeatureFlag[] = response.data;
      
      const flagsObject = apiFlags.reduce((acc, flag) => {
        acc[flag.name] = flag.enabled;
        return acc;
      }, {} as FeatureFlags);
      
      setFeatureFlags(flagsObject);
      setFlagsList(apiFlags);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      toast.error('Error al cargar los flags de la aplicación.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const updateFlag = async (_id: string, enabled: boolean) => {
    try {
      const response = await axios.patch(`${API_URL}/featureFlags/${_id}`, { enabled });
      const updatedFlag: FeatureFlag = response.data;
      
      setFeatureFlags(prev => ({
        ...prev,
        [updatedFlag.name]: updatedFlag.enabled,
      }));
      
      setFlagsList(prev => prev.map(flag => 
        flag._id === _id ? updatedFlag : flag
      ));
      
      toast.success(`Flag "${updatedFlag.name}" actualizado.`);
    } catch (error) {
      console.error(`Error updating feature flag ${_id}:`, error);
      toast.error('Error al actualizar el flag.');
    }
  };

  return (
    <FeatureFlagContext.Provider value={{ featureFlags, loading, updateFlag, flagsList }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlag = () => {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }
  return context;
};