import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import toast from 'react-hot-toast';
import { usePatientStore } from '@/store/patientStore';

const schema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    mobileNumber: z.string().min(8, 'Valid mobile number is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface PatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId?: string | null;
}

export const PatientModal: React.FC<PatientModalProps> = ({ isOpen, onClose, patientId }) => {
    const addPatient = usePatientStore(state => state.addPatient);
    const updatePatient = usePatientStore(state => state.updatePatient);
    const patients = usePatientStore(state => state.patients);

    const editingPatient = patientId ? patients.find(p => p.id === patientId) : null;

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: '',
            lastName: '',
            mobileNumber: '',
            email: '',
            address: '',
            dateOfBirth: '',
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (editingPatient) {
                let dob = '';
                if (editingPatient.dateOfBirth) {
                    const d = new Date(editingPatient.dateOfBirth);
                    if (!isNaN(d.getTime())) {
                        dob = d.toISOString().split('T')[0];
                    }
                }

                reset({
                    firstName: editingPatient.firstName,
                    lastName: editingPatient.lastName,
                    mobileNumber: editingPatient.mobileNumber,
                    email: editingPatient.email || '',
                    address: editingPatient.address || '',
                    dateOfBirth: dob,
                });
            } else {
                reset({
                    firstName: '',
                    lastName: '',
                    mobileNumber: '',
                    email: '',
                    address: '',
                    dateOfBirth: '',
                });
            }
        }
    }, [isOpen, editingPatient, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            const payload = { ...data };
            if (!payload.email) delete (payload as any).email;
            if (!payload.address) delete (payload as any).address;
            if (!payload.dateOfBirth) delete (payload as any).dateOfBirth;

            if (patientId) {
                await updatePatient(patientId, payload);
                toast.success('Patient updated successfully');
            } else {
                await addPatient(payload);
                toast.success('Patient added successfully');
            }
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(patientId ? 'Failed to update patient' : 'Failed to add patient');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={patientId ? 'Edit Patient' : 'Add New Patient'}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (patientId ? 'Save Changes' : 'Add Patient')}
                    </Button>
                </>
            }
        >
            <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                label="First Name"
                                placeholder="John"
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.firstName?.message}
                                required
                            />
                        )}
                    />
                    <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                label="Last Name"
                                placeholder="Doe"
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.lastName?.message}
                                required
                            />
                        )}
                    />
                </div>

                <Controller
                    name="mobileNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            label="Mobile Number"
                            placeholder="+1 (555) 000-0000"
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.mobileNumber?.message}
                            required
                        />
                    )}
                />

                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <Input
                            label="Email (Optional)"
                            type="email"
                            placeholder="john@example.com"
                            value={field.value || ''}
                            onChange={field.onChange}
                            error={errors.email?.message}
                        />
                    )}
                />

                <Controller
                    name="dateOfBirth"
                    control={control}
                    render={({ field }) => (
                        <Input
                            label="Date of Birth"
                            type="date"
                            value={field.value || ''}
                            onChange={field.onChange}
                            error={errors.dateOfBirth?.message}
                        />
                    )}
                />

                <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                        <Input
                            label="Address (Optional)"
                            placeholder="123 Main St"
                            value={field.value || ''}
                            onChange={field.onChange}
                            error={errors.address?.message}
                        />
                    )}
                />
            </div>
        </Modal>
    );
};
