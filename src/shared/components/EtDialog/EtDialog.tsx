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
        dialogElement.showModal(); // Opens the dialog modally
      } else {
        dialogElement.close(); // Closes the dialog
      }
    }
  }, [isOpen]); // Re-run when dialog's open state changes

  // Effect to handle the native 'close' event from the <dialog> element.
  useEffect(() => {
    const dialogElement = dialogRef.current;
    const handleClose = () => onClose(); // Call the parent's onClose handler

    if (dialogElement) {
      dialogElement.addEventListener('close', handleClose);
    }

    return () => {
      // Cleanup: Remove event listener on unmount or dependency change.
      if (dialogElement) {
        dialogElement.removeEventListener('close', handleClose);
      }
    };
  }, [onClose]); // Re-run only if the onClose function reference changes

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
    portalRoot // Specifies the DOM node where the portal content will be appended.
  );
}

export default EtDialog;