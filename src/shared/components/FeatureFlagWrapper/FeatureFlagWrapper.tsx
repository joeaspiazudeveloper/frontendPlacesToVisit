import React from 'react';
import { useFeatureFlag } from '../../contexts/FeatureFlagContext';

interface FeatureFlagWrapperProps {
    flagName: string;
    children: React.ReactNode;
}

const FeatureFlagWrapper: React.FC<FeatureFlagWrapperProps> = ({ flagName, children }) => {
    const { featureFlags, loading } = useFeatureFlag();

    // No renderizamos nada si los flags aún se están cargando
    if (loading) {
        return null; 
    }

    const isEnabled = featureFlags[flagName];

    // Si el flag no está activado, no renderizamos los hijos
    if (!isEnabled) {
        return null;
    }

    // Si el flag está activo, renderizamos los hijos
    return <>{children}</>;
};

export default FeatureFlagWrapper;