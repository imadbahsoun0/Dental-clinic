'use client';

import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Table, TableColumn, TableAction } from '@/components/common/Table';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { MultiSelect } from '@/components/common/MultiSelect';
import { useSettingsStore } from '@/store/settingsStore';
import { TreatmentCategory, TreatmentType, PriceVariant } from '@/types';
import { ALL_TEETH, formatToothNumbers } from '@/constants/teeth';
import styles from './settings-tabs.module.css';

export const TreatmentTypesTab: React.FC = () => {
    const treatmentCategories = useSettingsStore((state) => state.treatmentCategories);
    const treatmentTypes = useSettingsStore((state) => state.treatmentTypes);
    const addTreatmentCategory = useSettingsStore((state) => state.addTreatmentCategory);
    const updateTreatmentCategory = useSettingsStore((state) => state.updateTreatmentCategory);
    const deleteTreatmentCategory = useSettingsStore((state) => state.deleteTreatmentCategory);
    const addTreatmentType = useSettingsStore((state) => state.addTreatmentType);
    const updateTreatmentType = useSettingsStore((state) => state.updateTreatmentType);
    const deleteTreatmentType = useSettingsStore((state) => state.deleteTreatmentType);

    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [treatmentModalOpen, setTreatmentModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<TreatmentCategory | null>(null);
    const [editingTreatment, setEditingTreatment] = useState<TreatmentType | null>(null);

    const [categoryForm, setCategoryForm] = useState({ name: '', icon: '🦷', order: 1 });
    const [treatmentForm, setTreatmentForm] = useState({
        categoryId: '',
        name: '',
        priceVariants: [] as PriceVariant[],
        duration: 30,
        color: '#3b82f6',
    });

    // Variant form state
    const [variantForm, setVariantForm] = useState({
        selectedTeeth: [] as number[],
        price: 0,
        isDefault: false,
    });

    const handleAddCategory = () => {
        setEditingCategory(null);
        setCategoryForm({ name: '', icon: '🦷', order: treatmentCategories.length + 1 });
        setCategoryModalOpen(true);
    };

    const handleEditCategory = (category: TreatmentCategory) => {
        setEditingCategory(category);
        setCategoryForm({ name: category.name, icon: category.icon, order: category.order });
        setCategoryModalOpen(true);
    };

    const handleSaveCategory = () => {
        if (!categoryForm.name) {
            alert('Please enter a category name');
            return;
        }

        if (editingCategory) {
            updateTreatmentCategory(editingCategory.id, categoryForm);
        } else {
            addTreatmentCategory(categoryForm);
        }
        setCategoryModalOpen(false);
    };

    const handleDeleteCategory = (category: TreatmentCategory) => {
        if (confirm(`Are you sure you want to delete "${category.name}"? This will also delete all treatments in this category.`)) {
            deleteTreatmentCategory(category.id);
        }
    };

    const handleAddTreatment = () => {
        setEditingTreatment(null);
        setTreatmentForm({
            categoryId: '',
            name: '',
            priceVariants: [],
            duration: 30,
            color: '#3b82f6',
        });
        setVariantForm({ selectedTeeth: [], price: 0, isDefault: false });
        setTreatmentModalOpen(true);
    };

    const handleEditTreatment = (treatment: TreatmentType) => {
        setEditingTreatment(treatment);
        setTreatmentForm({
            categoryId: treatment.categoryId || '',
            name: treatment.name,
            priceVariants: [...treatment.priceVariants],
            duration: treatment.duration,
            color: treatment.color,
        });
        setVariantForm({ selectedTeeth: [], price: 0, isDefault: false });
        setTreatmentModalOpen(true);
    };

    const handleAddVariant = () => {
        if (variantForm.price <= 0) {
            alert('Please enter a price');
            return;
        }

        if (!variantForm.isDefault && variantForm.selectedTeeth.length === 0) {
            alert('Please select teeth or mark as default price');
            return;
        }

        // Check if default already exists
        if (variantForm.isDefault && treatmentForm.priceVariants.some(v => v.isDefault)) {
            alert('A default price already exists. Please remove it first.');
            return;
        }

        const newVariant: PriceVariant = variantForm.isDefault
            ? {
                id: `var-${Date.now()}`,
                toothSpec: 'Default',
                toothNumbers: [],
                price: variantForm.price,
                isDefault: true,
            }
            : {
                id: `var-${Date.now()}`,
                toothSpec: formatToothNumbers(variantForm.selectedTeeth),
                toothNumbers: [...variantForm.selectedTeeth],
                price: variantForm.price,
            };

        setTreatmentForm({
            ...treatmentForm,
            priceVariants: [...treatmentForm.priceVariants, newVariant],
        });

        setVariantForm({ selectedTeeth: [], price: 0, isDefault: false });
    };

    const handleDeleteVariant = (variantId: string) => {
        setTreatmentForm({
            ...treatmentForm,
            priceVariants: treatmentForm.priceVariants.filter(v => v.id !== variantId),
        });
    };

    const handleSaveTreatment = () => {
        if (!treatmentForm.name || !treatmentForm.categoryId) {
            alert('Please fill in treatment name and category');
            return;
        }

        if (treatmentForm.priceVariants.length === 0) {
            alert('Please add at least one price variant');
            return;
        }

        if (editingTreatment) {
            updateTreatmentType(editingTreatment.id, treatmentForm);
        } else {
            addTreatmentType(treatmentForm);
        }
        setTreatmentModalOpen(false);
    };

    const handleDeleteTreatment = (treatment: TreatmentType) => {
        if (confirm(`Are you sure you want to delete "${treatment.name}"?`)) {
            deleteTreatmentType(treatment.id);
        }
    };

    const categoryColumns: TableColumn<TreatmentCategory>[] = [
        { key: 'icon', label: 'Icon', render: (cat) => <span style={{ fontSize: '24px' }}>{cat.icon}</span> },
        { key: 'name', label: 'Category Name' },
        { key: 'order', label: 'Order' },
        {
            key: 'count',
            label: 'Treatments',
            render: (cat) => treatmentTypes.filter((t) => t.categoryId === cat.id).length,
        },
    ];

    const categoryActions: TableAction<TreatmentCategory>[] = [
        { label: 'Edit', onClick: handleEditCategory, variant: 'secondary' },
        { label: 'Delete', onClick: handleDeleteCategory, variant: 'danger' },
    ];

    const treatmentColumns: TableColumn<TreatmentType>[] = [
        {
            key: 'category',
            label: 'Category',
            render: (t) => {
                const cat = treatmentCategories.find((c) => c.id === t.categoryId);
                return cat ? `${cat.icon} ${cat.name}` : 'N/A';
            },
        },
        { key: 'name', label: 'Treatment Name' },
        {
            key: 'variants',
            label: 'Price Variants',
            render: (t) => `${t.priceVariants.length} variant${t.priceVariants.length !== 1 ? 's' : ''}`
        },
        { key: 'duration', label: 'Duration', render: (t) => `${t.duration} min` },
        {
            key: 'color',
            label: 'Color',
            render: (t) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            backgroundColor: t.color,
                            border: '1px solid #ddd',
                        }}
                    />
                    <span>{t.color}</span>
                </div>
            ),
        },
    ];

    const treatmentActions: TableAction<TreatmentType>[] = [
        { label: 'Edit', onClick: handleEditTreatment, variant: 'secondary' },
        { label: 'Delete', onClick: handleDeleteTreatment, variant: 'danger' },
    ];

    return (
        <div className={styles.tabContent}>
            <Card
                title="Treatment Categories"
                action={<Button onClick={handleAddCategory}>Add Category</Button>}
            >
                <Table
                    columns={categoryColumns}
                    data={treatmentCategories.sort((a, b) => a.order - b.order)}
                    actions={categoryActions}
                    emptyMessage="No categories found. Add your first category to get started."
                />
            </Card>

            <Card
                title="Treatment Types"
                action={<Button onClick={handleAddTreatment}>Add Treatment Type</Button>}
                className={styles.marginTop}
            >
                <Table
                    columns={treatmentColumns}
                    data={treatmentTypes}
                    actions={treatmentActions}
                    emptyMessage="No treatment types found. Add your first treatment type to get started."
                />
            </Card>

            {/* Category Modal */}
            <Modal
                isOpen={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                title={editingCategory ? 'Edit Category' : 'Add Category'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setCategoryModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveCategory}>
                            {editingCategory ? 'Update' : 'Add'} Category
                        </Button>
                    </>
                }
            >
                <div className={styles.form}>
                    <Input
                        type="text"
                        label="Category Name *"
                        value={categoryForm.name}
                        onChange={(value) => setCategoryForm({ ...categoryForm, name: value })}
                        placeholder="e.g., Preventive Dentistry"
                    />
                    <Input
                        type="text"
                        label="Icon (Emoji) *"
                        value={categoryForm.icon}
                        onChange={(value) => setCategoryForm({ ...categoryForm, icon: value })}
                        placeholder="🦷"
                    />
                    <Input
                        type="number"
                        label="Display Order *"
                        value={String(categoryForm.order)}
                        onChange={(value) => setCategoryForm({ ...categoryForm, order: parseInt(value) || 1 })}
                    />
                </div>
            </Modal>

            {/* Treatment Type Modal */}
            <Modal
                isOpen={treatmentModalOpen}
                onClose={() => setTreatmentModalOpen(false)}
                title={editingTreatment ? 'Edit Treatment Type' : 'Add Treatment Type'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setTreatmentModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveTreatment}>
                            {editingTreatment ? 'Update' : 'Add'} Treatment
                        </Button>
                    </>
                }
            >
                <div className={styles.form}>
                    <Select
                        label="Category *"
                        options={treatmentCategories
                            .sort((a, b) => a.order - b.order)
                            .map((cat) => ({
                                value: cat.id,
                                label: `${cat.icon} ${cat.name}`,
                            }))}
                        value={treatmentForm.categoryId}
                        onChange={(value) => setTreatmentForm({ ...treatmentForm, categoryId: value })}
                        placeholder="Select a category"
                    />
                    <Input
                        type="text"
                        label="Treatment Name *"
                        value={treatmentForm.name}
                        onChange={(value) => setTreatmentForm({ ...treatmentForm, name: value })}
                        placeholder="e.g., Root Canal Treatment"
                    />
                    <Input
                        type="number"
                        label="Duration (minutes) *"
                        value={String(treatmentForm.duration)}
                        onChange={(value) => setTreatmentForm({ ...treatmentForm, duration: parseInt(value) || 30 })}
                    />
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                            Color *
                        </label>
                        <input
                            type="color"
                            value={treatmentForm.color}
                            onChange={(e) => setTreatmentForm({ ...treatmentForm, color: e.target.value })}
                            style={{
                                width: '100%',
                                height: '40px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                            }}
                        />
                    </div>

                    {/* Price Variants Section */}
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid var(--border)' }}>
                        <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
                            Price Variants *
                        </h4>

                        {/* Existing Variants Table */}
                        {treatmentForm.priceVariants.length > 0 && (
                            <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Teeth</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Price</th>
                                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, width: '80px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {treatmentForm.priceVariants.map((variant) => (
                                            <tr key={variant.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '12px' }}>{variant.toothSpec}</td>
                                                <td style={{ padding: '12px', color: 'var(--primary)', fontWeight: 500 }}>${variant.price}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => handleDeleteVariant(variant.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--danger)',
                                                            cursor: 'pointer',
                                                            fontSize: '18px',
                                                            padding: '4px 8px',
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Add Variant Form */}
                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            <h5 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>Add Price Variant</h5>
                            <div className={styles.form}>
                                {/* Default Price Checkbox */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'var(--bg-white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                    <input
                                        type="checkbox"
                                        id="isDefaultPrice"
                                        checked={variantForm.isDefault}
                                        onChange={(e) => setVariantForm({ ...variantForm, isDefault: e.target.checked, selectedTeeth: [] })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="isDefaultPrice" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                                        Default Price (for all teeth not specified)
                                    </label>
                                </div>

                                {/* Teeth Selector - only show if not default */}
                                {!variantForm.isDefault && (
                                    <MultiSelect
                                        label="Select Teeth *"
                                        options={ALL_TEETH.map(tooth => ({
                                            value: tooth.value,
                                            label: tooth.label,
                                            group: tooth.type
                                        }))}
                                        value={variantForm.selectedTeeth}
                                        onChange={(value) => setVariantForm({ ...variantForm, selectedTeeth: value as number[] })}
                                        placeholder="Select one or more teeth..."
                                    />
                                )}

                                <Input
                                    type="number"
                                    label="Price ($) *"
                                    value={String(variantForm.price)}
                                    onChange={(value) => setVariantForm({ ...variantForm, price: parseFloat(value) || 0 })}
                                    placeholder="0"
                                />
                                <Button onClick={handleAddVariant} variant="secondary">
                                    Add Variant
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
