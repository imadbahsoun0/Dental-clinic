import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { PatientSearchSelect } from '@/components/patients/PatientSearchSelect';
import toast from 'react-hot-toast';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useSettingsStore } from '@/store/settingsStore';

// Schema for creating appointments (doctor is required)
const createSchema = z.object({
    patientId: z.string().min(1, 'Patient is required'),
    treatmentTypeId: z.string().optional(),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    doctorId: z.string().min(1, 'Doctor is required'),
    notes: z.string().optional(),
});

// Schema for editing appointments (includes status)
const editSchema = z.object({
    patientId: z.string().min(1, 'Patient is required'),
    treatmentTypeId: z.string().optional(),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    status: z.enum(['pending', 'confirmed', 'cancelled']),
    doctorId: z.string().min(1, 'Doctor is required'),
    notes: z.string().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData = z.infer<typeof editSchema>;
type FormData = CreateFormData | EditFormData;

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

    const users = useSettingsStore(state => state.users);
    const fetchUsers = useSettingsStore(state => state.fetchUsers);

    const [loadingData, setLoadingData] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<{ id: string; firstName: string; lastName: string; mobileNumber: string } | null>(null);

    const isEditing = !!appointmentId;
    const editingAppointment = appointmentId ? appointments.find(a => a.id === appointmentId) : null;

    const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(isEditing ? editSchema : createSchema),
        defaultValues: {
            patientId: defaultPatientId || '',
            treatmentTypeId: '',
            date: defaultDate || '',
            time: '',
            ...(isEditing ? { status: 'pending' as const } : {}),
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
                    await fetchUsers();
                } catch (error) {
                    console.error('Failed to load data:', error);
                    toast.error('Failed to load form data');
                } finally {
                    setLoadingData(false);
                }
            };

            loadData();

            if (editingAppointment) {
                // Set selected patient for display in edit mode
                if (editingAppointment.patient) {
                    setSelectedPatient({
                        id: editingAppointment.patient.id,
                        firstName: editingAppointment.patient.firstName,
                        lastName: editingAppointment.patient.lastName,
                        mobileNumber: '', // Will be fetched by PatientSearchSelect if needed
                    });
                }

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
                setSelectedPatient(null);
                reset({
                    patientId: defaultPatientId || '',
                    treatmentTypeId: '',
                    date: defaultDate || '',
                    time: '',
                    doctorId: '',
                    notes: '',
                });
            }
        }
    }, [isOpen, editingAppointment, reset, defaultDate, defaultPatientId, fetchUsers]);

    const onSubmit = async (data: FormData) => {
        try {
            const payload: any = { ...data };
            if (!payload.notes) delete payload.notes;
            if (!payload.treatmentTypeId) delete payload.treatmentTypeId;

            // For create, don't send status (backend will set to pending)
            if (!isEditing) {
                delete payload.status;
            }

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

    // Doctor options: include both dentists and admins
    const doctorOptions = users
        .filter((u: any) => u.role === 'dentist' || u.role === 'admin')
        .map((u: any) => ({
            value: u.id,
            label: `${u.name}${u.role === 'admin' ? ' (Admin)' : ''}`,
        }));

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
                                <PatientSearchSelect
                                    value={field.value}
                                    selectedPatient={selectedPatient}
                                    onChange={(patientId, patient) => {
                                        field.onChange(patientId);
                                        setSelectedPatient(patient);
                                    }}
                                    error={errors.patientId?.message}
                                    required
                                    disabled={isEditing} // Disable patient change in edit mode
                                />
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
                                        Doctor <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <Select
                                        options={doctorOptions}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder="Select a doctor..."
                                    />
                                    {errors.doctorId && (
                                        <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                            {errors.doctorId.message}
                                        </span>
                                    )}
                                </div>
                            )}
                        />

                        {/* Status field - only show in edit mode */}
                        {isEditing && (
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
                                            value={(field.value as string) || 'pending'}
                                            onChange={field.onChange}
                                        />
                                    </div>
                                )}
                            />
                        )}

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
