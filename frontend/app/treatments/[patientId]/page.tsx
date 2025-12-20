'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { usePatientStore } from '@/store/patientStore';
import { useTreatmentStore } from '@/store/treatmentStore';
import { useSettingsStore } from '@/store/settingsStore';
import styles from './treatments.module.css';

type Jaw = 'upper' | 'lower';

export default function TreatmentsPage({ params }: { params: Promise<{ patientId: string }> }) {
    const { patientId } = React.use(params);
    const [selectedJaw, setSelectedJaw] = useState<Jaw>('upper');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

    const patients = usePatientStore((state) => state.patients);
    const allTreatments = useTreatmentStore((state) => state.treatments);
    const addTreatment = useTreatmentStore((state) => state.addTreatment);
    const appointmentTypes = useSettingsStore((state) => state.appointmentTypes);

    const treatments = useMemo(() => {
        return allTreatments.filter((t) => t.patientId === patientId);
    }, [allTreatments, patientId]);

    const patient = patients.find((p) => p.id === patientId);

    const [formData, setFormData] = useState({
        appointmentTypeId: '',
        amountPaid: 0,
        discount: 0,
        date: '',
    });

    const handleToothClick = (toothNumber: number) => {
        setSelectedTooth(toothNumber);
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (selectedTooth && formData.appointmentTypeId && formData.date) {
            const aptType = appointmentTypes.find((t) => t.id === formData.appointmentTypeId);
            if (aptType) {
                addTreatment({
                    patientId: patientId,
                    toothNumber: selectedTooth,
                    appointmentTypeId: formData.appointmentTypeId,
                    totalPrice: aptType.price,
                    amountPaid: formData.amountPaid,
                    discount: formData.discount,
                    date: formData.date,
                });
                setIsModalOpen(false);
                setSelectedTooth(null);
                setFormData({ appointmentTypeId: '', amountPaid: 0, discount: 0, date: '' });
            }
        }
    };

    const totalPrice = treatments.reduce((sum, t) => sum + (t.totalPrice - t.discount), 0);
    const totalPaid = treatments.reduce((sum, t) => sum + t.amountPaid, 0);
    const balance = totalPrice - totalPaid;

    // Get teeth for selected jaw
    const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
    const lowerTeeth = Array.from({ length: 16 }, (_, i) => i + 17);
    const currentTeeth = selectedJaw === 'upper' ? upperTeeth : lowerTeeth;

    return (
        <MainLayout title="Chart">
            <div className={styles.pageLayout}>
                {/* Left Column - Dental Chart */}
                <div className={styles.chartSection}>
                    {/* Compact Patient Header */}
                    <div className={styles.compactHeader}>
                        <div className={styles.patientAvatar}>
                            {patient?.firstName[0]}{patient?.lastName[0]}
                        </div>
                        <div className={styles.patientDetails}>
                            <h2 className={styles.patientName}>
                                {patient?.firstName} {patient?.lastName}
                            </h2>
                            <p className={styles.patientId}>ID: {patient?.id}</p>
                        </div>
                    </div>

                    {/* Jaw Selection Tabs */}
                    <div className={styles.jawTabs}>
                        <button
                            className={`${styles.jawTab} ${selectedJaw === 'upper' ? styles.activeTab : ''}`}
                            onClick={() => setSelectedJaw('upper')}
                        >
                            Upper jaw
                        </button>
                        <button
                            className={`${styles.jawTab} ${selectedJaw === 'lower' ? styles.activeTab : ''}`}
                            onClick={() => setSelectedJaw('lower')}
                        >
                            Lower jaw
                        </button>
                    </div>

                    {/* Dental Chart */}
                    <Card className={styles.dentalChartCard}>
                        <div className={styles.dentalChart}>
                            <div className={selectedJaw === 'upper' ? styles.upperArchSingle : styles.lowerArchSingle}>
                                {currentTeeth.map((toothNum) => {
                                    const treatment = treatments.find((t) => t.toothNumber === toothNum);
                                    const aptType = treatment ? appointmentTypes.find((a) => a.id === treatment.appointmentTypeId) : null;
                                    const isSelected = selectedTooth === toothNum;

                                    return (
                                        <div
                                            key={toothNum}
                                            className={`${styles.tooth} ${isSelected ? styles.selectedTooth : ''}`}
                                            style={{ backgroundColor: aptType?.color || '#ffffff' }}
                                            onClick={() => handleToothClick(toothNum)}
                                            title={`Tooth ${toothNum}`}
                                        >
                                            {toothNum}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Treatment Panel */}
                <div className={styles.treatmentPanel}>
                    <Card>
                        <h3 className={styles.panelTitle}>Treatments</h3>
                        <div className={styles.treatmentSummary}>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Total:</span>
                                <span className={styles.summaryValue}>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Paid:</span>
                                <span className={styles.summaryValue}>${totalPaid.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Balance:</span>
                                <span className={`${styles.summaryValue} ${styles.balanceValue}`}>
                                    ${balance.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className={styles.treatmentList}>
                            {treatments.length === 0 ? (
                                <p className={styles.emptyState}>No treatments yet. Click on a tooth to add a treatment.</p>
                            ) : (
                                treatments.map((treatment) => {
                                    const aptType = appointmentTypes.find((a) => a.id === treatment.appointmentTypeId);
                                    const treatmentBalance = treatment.totalPrice - treatment.discount - treatment.amountPaid;

                                    return (
                                        <div key={treatment.id} className={styles.treatmentItem}>
                                            <div className={styles.treatmentHeader}>
                                                <span className={styles.toothBadge}>#{treatment.toothNumber}</span>
                                                <span className={styles.treatmentName}>{aptType?.name}</span>
                                            </div>
                                            <div className={styles.treatmentDetails}>
                                                <span className={styles.treatmentDate}>
                                                    {new Date(treatment.date).toLocaleDateString()}
                                                </span>
                                                <span className={styles.treatmentPrice}>
                                                    ${treatment.totalPrice.toFixed(2)}
                                                </span>
                                            </div>
                                            {treatmentBalance > 0 && (
                                                <div className={styles.treatmentBalance}>
                                                    Balance: ${treatmentBalance.toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Treatment Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTooth(null);
                }}
                title={`Add Treatment - Tooth #${selectedTooth}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => {
                            setIsModalOpen(false);
                            setSelectedTooth(null);
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>Add Treatment</Button>
                    </>
                }
            >
                <Select
                    label="Treatment Type"
                    options={appointmentTypes.map((t) => ({ value: t.id, label: `${t.name} - $${t.price}` }))}
                    value={formData.appointmentTypeId}
                    onChange={(value) => setFormData({ ...formData, appointmentTypeId: value })}
                />
                <Input
                    type="date"
                    label="Date"
                    value={formData.date}
                    onChange={(value) => setFormData({ ...formData, date: value })}
                    required
                />
                <Input
                    type="number"
                    label="Amount Paid"
                    value={String(formData.amountPaid)}
                    onChange={(value) => setFormData({ ...formData, amountPaid: parseFloat(value) || 0 })}
                />
                <Input
                    type="number"
                    label="Discount"
                    value={String(formData.discount)}
                    onChange={(value) => setFormData({ ...formData, discount: parseFloat(value) || 0 })}
                />
            </Modal>
        </MainLayout>
    );
}
