import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './EtDialog.scss';

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

  // Effect to control the native <dialog> element's open/close state.
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

  // Effect to handle the native 'close' event from the <dialog> element.
  useEffect(() => {
    const dialogElement = dialogRef.current;
    const handleClose = () => onClose();

    if (dialogElement) {
      dialogElement.addEventListener('close', handleClose);
    }

    return () => {
      // Cleanup: Remove event listener on unmount or dependency change.
      if (dialogElement) {
        dialogElement.removeEventListener('close', handleClose);
      }
    };
  }, [onClose]);

  // body scrolling
  useEffect(() => {
    const originOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originOverflow;
    }

    return () => {
      document.body.style.overflow = originOverflow;
    }
  }, [isOpen]);

  // Do not render if the portal root is not found in the DOM.
  if (!portalRoot) {
    console.warn("Portal root element with ID 'dialog-root' not found. Dialog will not render.");
    return null;
  }

  // Render the dialog content using ReactDOM.createPortal
  return ReactDOM.createPortal(
    // The dialog element, with dynamic classes for styling and animation.
    <dialog ref={dialogRef} className={`et-dialog ${className || ''} et-dialog--slide-${slideFrom}`}>
      <div className="et-dialog-header">
        <h2 className="et-dialog-title">{title || 'Details'}</h2>
        {/* Close button with accessible label for screen readers */}
        <button className="et-dialog-close" onClick={onClose} aria-label="Close dialog">
          &times;
        </button>
      </div>
      <div className="et-dialog-body">
        {children}
      </div>
    </dialog>,
    portalRoot
  );
}

export default EtDialog;