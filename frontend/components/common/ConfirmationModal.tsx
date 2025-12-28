import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary' | 'warning'; // Update Button variant types if needed
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'primary',
    isLoading = false,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        {cancelLabel}
                    </Button>
                    <Button variant={variant as any} onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? 'Processing...' : confirmLabel}
                    </Button>
                </>
            }
        >
            <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>{message}</p>
        </Modal>
    );
};
