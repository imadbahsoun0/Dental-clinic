import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import toast from 'react-hot-toast';
import { useAppointmentStore } from '@/store/appointmentStore';
import { usePatientStore } from '@/store/patientStore';
import { useSettingsStore } from '@/store/settingsStore';

const schema = z.object({
    patientId: z.string().min(1, 'Patient is required'),
    treatmentTypeId: z.string().optional(),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
    doctorId: z.string().optional(),
    notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointmentId?: string | null;
    defaultDate?: string;
    defaultPatientId?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
    isOpen,
    onClose,
    appointmentId,
    defaultDate,
    defaultPatientId
}) => {
    const addAppointment = useAppointmentStore(state => state.addAppointment);
    const updateAppointment = useAppointmentStore(state => state.updateAppointment);
    const appointments = useAppointmentStore(state => state.appointments);

    const patients = usePatientStore(state => state.patients);
    const fetchPatients = usePatientStore(state => state.fetchPatients);

    const users = useSettingsStore(state => state.users);
    const fetchUsers = useSettingsStore(state => state.fetchUsers);

    const [loadingData, setLoadingData] = useState(false);

    const editingAppointment = appointmentId ? appointments.find(a => a.id === appointmentId) : null;

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            patientId: defaultPatientId || '',
            treatmentTypeId: '',
            date: defaultDate || '',
            time: '',
            status: 'pending',
            doctorId: '',
            notes: '',
        }
    });

    useEffect(() => {
        if (isOpen) {
            // Fetch required data
            const loadData = async () => {
                setLoadingData(true);
                try {
                    await Promise.all([
                        fetchPatients(1, 100),
                        fetchUsers(),
                    ]);
                } catch (error) {
                    console.error('Failed to load data:', error);
                    toast.error('Failed to load form data');
                } finally {
                    setLoadingData(false);
                }
            };

            loadData();

            if (editingAppointment) {
                reset({
                    patientId: editingAppointment.patient?.id || '',
                    treatmentTypeId: editingAppointment.treatmentType?.id || '',
                    date: editingAppointment.date,
                    time: editingAppointment.time,
                    status: editingAppointment.status || 'pending',
                    doctorId: editingAppointment.doctor?.id || '',
                    notes: editingAppointment.notes || '',
                });
            } else {
                reset({
                    patientId: defaultPatientId || '',
                    treatmentTypeId: '',
                    date: defaultDate || '',
                    time: '',
                    status: 'pending',
                    doctorId: '',
                    notes: '',
                });
            }
        }
    }, [isOpen, editingAppointment, reset, defaultDate, defaultPatientId, fetchPatients, fetchUsers]);

    const onSubmit = async (data: FormData) => {
        try {
            const payload: any = { ...data };
            if (!payload.doctorId) delete payload.doctorId;
            if (!payload.notes) delete payload.notes;
            if (!payload.status) payload.status = 'pending';
            if (!payload.treatmentTypeId) delete payload.treatmentTypeId;

            if (appointmentId) {
                await updateAppointment(appointmentId, payload);
                toast.success('Appointment updated successfully');
            } else {
                await addAppointment(payload);
                toast.success('Appointment created successfully');
            }
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(appointmentId ? 'Failed to update appointment' : 'Failed to create appointment');
        }
    };

    const patientOptions = patients.map(p => ({
        value: p.id,
        label: `${p.firstName} ${p.lastName}`,
    }));

    const doctorOptions = [
        { value: '', label: 'No doctor assigned' },
        ...users.filter((u: any) => u.role === 'dentist').map((u: any) => ({
            value: u.id,
            label: u.name,
        })),
    ];

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const deleteAppointment = useAppointmentStore(state => state.deleteAppointment);

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!appointmentId) return;

        try {
            await deleteAppointment(appointmentId);
            toast.success('Appointment deleted successfully');
            setShowDeleteConfirm(false);
            onClose();
        } catch (error) {
            console.error('Failed to delete appointment:', error);
            toast.error('Failed to delete appointment');
            setShowDeleteConfirm(false);
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={appointmentId ? 'Edit Appointment' : 'New Appointment'}
                footer={
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            {appointmentId && (
                                <Button variant="danger" onClick={handleDelete} disabled={isSubmitting || loadingData}>
                                    Delete
                                </Button>
                            )}
                            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                <Button variant="secondary" onClick={onClose} disabled={isSubmitting || loadingData}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting || loadingData}>
                                    {isSubmitting ? 'Saving...' : (appointmentId ? 'Save Changes' : 'Create Appointment')}
                                </Button>
                            </div>
                        </div>
                    </>
                }
            >
                {loadingData ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <Controller
                            name="patientId"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                                        Patient <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <Select
                                        options={patientOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    {errors.patientId && (
                                        <span style={{ color: 'red', fontSize: '14px' }}>{errors.patientId.message}</span>
                                    )}
                                </div>
                            )}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <Controller
                                name="date"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="Date"
                                        type="date"
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        error={errors.date?.message}
                                        required
                                    />
                                )}
                            />

                            <Controller
                                name="time"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="Time"
                                        type="time"
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        error={errors.time?.message}
                                        required
                                    />
                                )}
                            />
                        </div>

                        <Controller
                            name="doctorId"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                                        Doctor (Optional)
                                    </label>
                                    <Select
                                        options={doctorOptions}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                    />
                                </div>
                            )}
                        />

                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                                        Status
                                    </label>
                                    <Select
                                        options={statusOptions}
                                        value={field.value || 'pending'}
                                        onChange={field.onChange}
                                    />
                                </div>
                            )}
                        />

                        <Controller
                            name="notes"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    label="Notes (Optional)"
                                    placeholder="Any special notes..."
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    error={errors.notes?.message}
                                />
                            )}
                        />
                    </div>
                )}
            </Modal>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Appointment"
                message="Are you sure you want to delete this appointment? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />
        </>
    );
};
