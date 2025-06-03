import React, { useRef, useEffect } from 'react';
import './Et-dialog.scss';

interface EtDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function EtDialog({ isOpen, onClose, title, children, className }: EtDialogProps) {

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (dialogElement) {
      if (isOpen) {
        dialogElement.showModal();
      } else {
        dialogElement.close();
      }
    }
  }, [isOpen]);

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

  return (
    <dialog ref={dialogRef} className={`et-dialog ${className || ''}`}>
      <div className="et-dialog-header">
        <h2 className="et-dialog-title">{title || 'Details'}</h2>
        <button className="et-dialog-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="et-dialog-body">
        {children}
      </div>
    </dialog>
  );
};

export default EtDialog;