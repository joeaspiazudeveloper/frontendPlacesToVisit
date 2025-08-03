import React from 'react';
import { useFeatureFlag } from '../../../../shared/contexts/FeatureFlagContext';
import styles from './FeatureFlagsPage.module.scss';

const FeatureFlagsPage: React.FC = () => {
    const { flagsList, loading, updateFlag } = useFeatureFlag();

    const handleToggle = async (_id: string, enabled: boolean) => {
        await updateFlag(_id, !enabled);
    };

    if (loading) {
        return <div className={styles.container}>Cargando flags...</div>;
    }

    return (
        <div className={styles.container}>
            <h1>Administrador de Funcionalidades</h1>
            <p>Activar o desactivar funcionalidades de la aplicación.</p>
            <table className={styles.flagsTable}>
                <thead>
                    <tr>
                        <th>Funcionalidad</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {flagsList.map(flag => (
                        <tr key={flag._id}>
                            <td>{flag.name}</td>
                            <td>{flag.description}</td>
                            <td>
                                <span className={flag.enabled ? styles.enabled : styles.disabled}>
                                    {flag.enabled ? 'Activada' : 'Desactivada'}
                                </span>
                            </td>
                            <td>
                                <button
                                    onClick={() => handleToggle(flag._id, flag.enabled)}
                                    className={flag.enabled ? styles.toggleOffBtn : styles.toggleOnBtn}
                                >
                                    {flag.enabled ? 'Desactivar' : 'Activar'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FeatureFlagsPage;