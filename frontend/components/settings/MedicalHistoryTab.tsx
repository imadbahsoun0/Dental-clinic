'use client';

import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Table, TableColumn, TableAction } from '@/components/common/Table';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { useSettingsStore } from '@/store/settingsStore';
import { MedicalHistoryQuestion } from '@/types';
import styles from './settings-tabs.module.css';

export const MedicalHistoryTab: React.FC = () => {
    const medicalHistoryQuestions = useSettingsStore((state) => state.medicalHistoryQuestions);
    const addMedicalHistoryQuestion = useSettingsStore((state) => state.addMedicalHistoryQuestion);
    const updateMedicalHistoryQuestion = useSettingsStore((state) => state.updateMedicalHistoryQuestion);
    const deleteMedicalHistoryQuestion = useSettingsStore((state) => state.deleteMedicalHistoryQuestion);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<MedicalHistoryQuestion | null>(null);
    const [questionForm, setQuestionForm] = useState({
        question: '',
        type: 'text' as 'text' | 'radio' | 'checkbox' | 'textarea',
        options: [] as string[],
        required: true,
        order: 1,
    });
    const [optionInput, setOptionInput] = useState('');

    const handleAddQuestion = () => {
        setEditingQuestion(null);
        setQuestionForm({
            question: '',
            type: 'text',
            options: [],
            required: true,
            order: medicalHistoryQuestions.length + 1,
        });
        setOptionInput('');
        setModalOpen(true);
    };

    const handleEditQuestion = (question: MedicalHistoryQuestion) => {
        setEditingQuestion(question);
        setQuestionForm({
            question: question.question,
            type: question.type,
            options: question.options || [],
            required: question.required,
            order: question.order,
        });
        setOptionInput('');
        setModalOpen(true);
    };

    const handleSaveQuestion = () => {
        if (!questionForm.question) {
            alert('Please enter a question');
            return;
        }

        if ((questionForm.type === 'radio' || questionForm.type === 'checkbox') && questionForm.options.length === 0) {
            alert('Please add at least one option for radio/checkbox questions');
            return;
        }

        if (editingQuestion) {
            updateMedicalHistoryQuestion(editingQuestion.id, questionForm);
        } else {
            addMedicalHistoryQuestion(questionForm);
        }
        setModalOpen(false);
    };

    const handleDeleteQuestion = (question: MedicalHistoryQuestion) => {
        if (confirm(`Are you sure you want to delete this question?`)) {
            deleteMedicalHistoryQuestion(question.id);
        }
    };

    const handleAddOption = () => {
        if (optionInput.trim()) {
            setQuestionForm({
                ...questionForm,
                options: [...questionForm.options, optionInput.trim()],
            });
            setOptionInput('');
        }
    };

    const handleRemoveOption = (index: number) => {
        setQuestionForm({
            ...questionForm,
            options: questionForm.options.filter((_, i) => i !== index),
        });
    };

    const handleMoveUp = (question: MedicalHistoryQuestion) => {
        const currentIndex = medicalHistoryQuestions.findIndex((q) => q.id === question.id);
        if (currentIndex > 0) {
            const prevQuestion = medicalHistoryQuestions[currentIndex - 1];
            updateMedicalHistoryQuestion(question.id, { order: prevQuestion.order });
            updateMedicalHistoryQuestion(prevQuestion.id, { order: question.order });
        }
    };

    const handleMoveDown = (question: MedicalHistoryQuestion) => {
        const currentIndex = medicalHistoryQuestions.findIndex((q) => q.id === question.id);
        if (currentIndex < medicalHistoryQuestions.length - 1) {
            const nextQuestion = medicalHistoryQuestions[currentIndex + 1];
            updateMedicalHistoryQuestion(question.id, { order: nextQuestion.order });
            updateMedicalHistoryQuestion(nextQuestion.id, { order: question.order });
        }
    };

    const columns: TableColumn<MedicalHistoryQuestion>[] = [
        { key: 'order', label: 'Order' },
        { key: 'question', label: 'Question' },
        {
            key: 'type',
            label: 'Type',
            render: (q) => (
                <span
                    style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                    }}
                >
                    {q.type.charAt(0).toUpperCase() + q.type.slice(1)}
                </span>
            ),
        },
        {
            key: 'required',
            label: 'Required',
            render: (q) => (q.required ? '✓' : '—'),
        },
        {
            key: 'options',
            label: 'Options',
            render: (q) => (q.options ? q.options.length : '—'),
        },
    ];

    const actions: TableAction<MedicalHistoryQuestion>[] = [
        {
            label: '↑',
            onClick: handleMoveUp,
            variant: 'secondary',
        },
        {
            label: '↓',
            onClick: handleMoveDown,
            variant: 'secondary',
        },
        { label: 'Edit', onClick: handleEditQuestion, variant: 'secondary' },
        { label: 'Delete', onClick: handleDeleteQuestion, variant: 'danger' },
    ];

    return (
        <div className={styles.tabContent}>
            <Card
                title="Medical History Questions"
                action={<Button onClick={handleAddQuestion}>Add Question</Button>}
            >
                <p className={styles.description}>
                    Configure the questions that patients will answer when filling out the medical history form.
                    Use the arrow buttons to reorder questions.
                </p>
                <Table
                    columns={columns}
                    data={medicalHistoryQuestions.sort((a, b) => a.order - b.order)}
                    actions={actions}
                    emptyMessage="No questions found. Add your first question to get started."
                />
            </Card>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingQuestion ? 'Edit Question' : 'Add Question'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveQuestion}>
                            {editingQuestion ? 'Update' : 'Add'} Question
                        </Button>
                    </>
                }
            >
                <div className={styles.form}>
                    <div>
                        <label className={styles.label}>Question Text *</label>
                        <textarea
                            className={styles.textarea}
                            rows={3}
                            value={questionForm.question}
                            onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                            placeholder="Enter your question..."
                        />
                    </div>

                    <Select
                        label="Question Type *"
                        options={[
                            { value: 'text', label: 'Text Input' },
                            { value: 'textarea', label: 'Text Area' },
                            { value: 'radio', label: 'Radio Buttons (Single Choice)' },
                            { value: 'checkbox', label: 'Checkboxes (Multiple Choice)' },
                        ]}
                        value={questionForm.type}
                        onChange={(value) =>
                            setQuestionForm({ ...questionForm, type: value as any, options: [] })
                        }
                    />

                    {(questionForm.type === 'radio' || questionForm.type === 'checkbox') && (
                        <div>
                            <label className={styles.label}>Options *</label>
                            <div className={styles.optionsContainer}>
                                {questionForm.options.map((option, index) => (
                                    <div key={index} className={styles.optionItem}>
                                        <span>{option}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(index)}
                                            className={styles.removeButton}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.addOptionRow}>
                                <Input
                                    type="text"
                                    value={optionInput}
                                    onChange={setOptionInput}
                                    placeholder="Enter option..."
                                />
                                <Button variant="secondary" onClick={handleAddOption}>
                                    Add Option
                                </Button>
                            </div>
                        </div>
                    )}

                    <Input
                        type="number"
                        label="Display Order *"
                        value={String(questionForm.order)}
                        onChange={(value) => setQuestionForm({ ...questionForm, order: parseInt(value) || 1 })}
                    />

                    <div className={styles.toggleSection}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={questionForm.required}
                                onChange={(e) => setQuestionForm({ ...questionForm, required: e.target.checked })}
                                className={styles.checkbox}
                            />
                            <span>Required field</span>
                        </label>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
