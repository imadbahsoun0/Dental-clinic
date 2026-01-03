import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import toast from 'react-hot-toast';
import { MedicalHistorySubmission, MedicalHistoryQuestion } from '@/types';
import styles from './MedicalHistoryEditModal.module.css';

interface MedicalHistoryEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    medicalHistory: MedicalHistorySubmission;
    questions: MedicalHistoryQuestion[];
    onSave: (data: UpdateMedicalHistoryData) => Promise<void>;
}

interface UpdateMedicalHistoryData {
    dateOfBirth?: string;
    emergencyContact?: string;
    email?: string;
    bloodType?: string;
    address?: string;
    responses: Array<{
        questionId: string;
        answer: string | string[];
        answerText?: string;
    }>;
}

export const MedicalHistoryEditModal: React.FC<MedicalHistoryEditModalProps> = ({
    isOpen,
    onClose,
    medicalHistory,
    questions,
    onSave,
}) => {
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [email, setEmail] = useState('');
    const [bloodType, setBloodType] = useState('');
    const [address, setAddress] = useState('');
    const [responses, setResponses] = useState<Record<string, string | string[]>>({});
    const [responseTexts, setResponseTexts] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && medicalHistory) {
            setDateOfBirth(medicalHistory.dateOfBirth || '');
            setEmergencyContact(medicalHistory.emergencyContact || '');
            setEmail(medicalHistory.email || '');
            setBloodType(medicalHistory.bloodType || '');
            setAddress(medicalHistory.address || '');

            const existingResponses: Record<string, string | string[]> = {};
            const existingTexts: Record<string, string> = {};
            
            if (Array.isArray(medicalHistory.responses)) {
                medicalHistory.responses.forEach((r) => {
                    existingResponses[r.questionId] = r.answer;
                    if (r.answerText) {
                        existingTexts[r.questionId] = r.answerText;
                    }
                });
            }
            
            setResponses(existingResponses);
            setResponseTexts(existingTexts);
        }
    }, [isOpen, medicalHistory]);

    const handleResponseChange = (questionId: string, answer: string | string[]) => {
        setResponses({ ...responses, [questionId]: answer });
    };

    const handleResponseTextChange = (questionId: string, text: string) => {
        setResponseTexts({ ...responseTexts, [questionId]: text });
    };

    const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
        const currentAnswers = (responses[questionId] as string[]) || [];
        if (checked) {
            setResponses({ ...responses, [questionId]: [...currentAnswers, option] });
        } else {
            setResponses({ ...responses, [questionId]: currentAnswers.filter((a) => a !== option) });
        }
    };

    const handleSubmit = async () => {
        if (!dateOfBirth) {
            toast.error('Please enter date of birth');
            return;
        }

        if (!emergencyContact) {
            toast.error('Please enter emergency contact number');
            return;
        }

        if (!bloodType) {
            toast.error('Please select blood type');
            return;
        }

        if (!address) {
            toast.error('Please enter address');
            return;
        }

        // Validate required questions
        for (const question of questions) {
            if (question.required && !responses[question.id]) {
                toast.error(`Please answer: ${question.question}`);
                return;
            }
            // Validate radio_with_text: if trigger option is selected, text is required
            if (question.type === 'radio_with_text' && 
                question.textTriggerOption && 
                responses[question.id] === question.textTriggerOption && 
                question.required && 
                !responseTexts[question.id]) {
                toast.error(`Please provide additional details for: ${question.question}`);
                return;
            }
        }

        setSubmitting(true);
        try {
            const submitData: UpdateMedicalHistoryData = {
                dateOfBirth,
                emergencyContact,
                email: email || undefined,
                bloodType,
                address,
                responses: Object.entries(responses).map(([questionId, answer]) => ({
                    questionId,
                    answer,
                    ...(responseTexts[questionId] && { answerText: responseTexts[questionId] })
                })),
            };

            await onSave(submitData);
            toast.success('Medical history updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error updating medical history:', error);
            toast.error('Failed to update medical history');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Medical History"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </>
            }
        >
            <div className={styles.form}>
                {/* Date of Birth */}
                <Input
                    type="date"
                    label="Date of Birth"
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                    required
                />

                {/* Emergency Contact */}
                <Input
                    type="tel"
                    label="Emergency Contact Phone Number"
                    value={emergencyContact}
                    onChange={setEmergencyContact}
                    required
                />

                {/* Email */}
                <Input
                    type="email"
                    label="Email (Optional)"
                    value={email}
                    onChange={setEmail}
                />

                {/* Address */}
                <div>
                    <label className={styles.label}>Address *</label>
                    <textarea
                        className={styles.textarea}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter full address..."
                        rows={3}
                        required
                    />
                </div>

                {/* Blood Type */}
                <div>
                    <label className={styles.label}>Blood Type *</label>
                    <select
                        className={styles.select}
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                    >
                        <option value="">Select blood type...</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>

                {/* Medical History Questions */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Medical History Questions</h3>
                    {questions.length === 0 ? (
                        <p>No medical history questions available.</p>
                    ) : (
                        questions
                            .sort((a, b) => a.order - b.order)
                            .map((question) => (
                                <div key={question.id} className={styles.questionGroup}>
                                    <label className={styles.questionLabel}>
                                        {question.question}
                                        {question.required && <span className={styles.required}>*</span>}
                                    </label>

                                    {question.type === 'radio' && question.options && (
                                        <div className={styles.radioGroup}>
                                            {question.options.map((option) => (
                                                <label key={option} className={styles.radioOption}>
                                                    <input
                                                        type="radio"
                                                        name={question.id}
                                                        value={option}
                                                        checked={responses[question.id] === option}
                                                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {question.type === 'radio_with_text' && question.options && (
                                        <div>
                                            <div className={styles.radioGroup}>
                                                {question.options.map((option) => (
                                                    <label key={option} className={styles.radioOption}>
                                                        <input
                                                            type="radio"
                                                            name={question.id}
                                                            value={option}
                                                            checked={responses[question.id] === option}
                                                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                                        />
                                                        {option}
                                                    </label>
                                                ))}
                                            </div>
                                            {question.textTriggerOption && responses[question.id] === question.textTriggerOption && (
                                                <div style={{ marginTop: '12px', marginLeft: '24px' }}>
                                                    <Input
                                                        type="text"
                                                        label={question.textFieldLabel || 'Please specify'}
                                                        value={responseTexts[question.id] || ''}
                                                        onChange={(value) => handleResponseTextChange(question.id, value)}
                                                        placeholder="Enter details..."
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {question.type === 'checkbox' && question.options && (
                                        <div className={styles.checkboxGroup}>
                                            {question.options.map((option) => (
                                                <label key={option} className={styles.checkboxOption}>
                                                    <input
                                                        type="checkbox"
                                                        checked={(responses[question.id] as string[] || []).includes(option)}
                                                        onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {question.type === 'text' && (
                                        <Input
                                            type="text"
                                            value={(responses[question.id] as string) || ''}
                                            onChange={(value) => handleResponseChange(question.id, value)}
                                            placeholder="Your answer..."
                                        />
                                    )}

                                    {question.type === 'textarea' && (
                                        <textarea
                                            className={styles.textarea}
                                            value={(responses[question.id] as string) || ''}
                                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                            placeholder="Your answer..."
                                            rows={4}
                                        />
                                    )}
                                </div>
                            ))
                    )}
                </div>
            </div>
        </Modal>
    );
};
