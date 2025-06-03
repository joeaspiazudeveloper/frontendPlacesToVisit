import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Et-dialog.scss';

interface EtDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  slideFrom?: 'right' | 'left' | 'none';
}

function EtDialog({ isOpen, onClose, title, children, className, slideFrom = 'none' }: EtDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const portalRoot = document.getElementById('dialog-root');

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (dialogElement) {
      if (isOpen) {
        dialogElement.classList.add(`et-dialog--slide-${slideFrom}`);
        dialogElement.showModal();
      } else {
        dialogElement.classList.remove(`et-dialog--slide-right`, `et-dialog--slide-left`);
        dialogElement.close();
      }
    }
  }, [isOpen, slideFrom]);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    const handleClose = () => onClose();

    if (dialogElement) {
      dialogElement.addEventListener('close', handleClose);
    }

    return () => {
      if (dialogElement) {
        dialogElement.removeEventListener('close', handleClose);
      }
    };
  }, [onClose]);

  if (!portalRoot) {
    return null; 
  }

  // Renderiza el contenido del diálogo en el portal
  return ReactDOM.createPortal(
    <dialog ref={dialogRef} className={`et-dialog ${className || ''} et-dialog--slide-${slideFrom}`}>
      <div className="et-dialog-header">
        <h2 className="et-dialog-title">{title || 'Details'}</h2>
        <button className="et-dialog-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="et-dialog-body">
        {children}
      </div>
    </dialog>,
    portalRoot // Este es el DOM node donde se renderizará el diálogo
  );
};

export default EtDialog;