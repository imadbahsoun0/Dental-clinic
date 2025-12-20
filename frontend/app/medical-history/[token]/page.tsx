'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useSettingsStore } from '@/store/settingsStore';
import styles from './medical-history.module.css';

export default function MedicalHistoryPage({ params }: { params: { token: string } }) {
    const medicalHistoryQuestions = useSettingsStore((state) => state.medicalHistoryQuestions);
    const doctorLogo = useSettingsStore((state) => state.doctorLogo);

    const [dateOfBirth, setDateOfBirth] = useState('');
    const [responses, setResponses] = useState<Record<string, string | string[]>>({});
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleResponseChange = (questionId: string, answer: string | string[]) => {
        setResponses({ ...responses, [questionId]: answer });
    };

    const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
        const currentAnswers = (responses[questionId] as string[]) || [];
        if (checked) {
            setResponses({ ...responses, [questionId]: [...currentAnswers, option] });
        } else {
            setResponses({ ...responses, [questionId]: currentAnswers.filter((a) => a !== option) });
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const rect = canvas.getBoundingClientRect();
                ctx.beginPath();
                ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
            }
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const rect = canvas.getBoundingClientRect();
                ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                ctx.stroke();
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const handleSubmit = () => {
        if (!dateOfBirth) {
            alert('Please enter your date of birth');
            return;
        }

        const canvas = canvasRef.current;
        if (canvas) {
            const signatureData = canvas.toDataURL();
            console.log('Submitting medical history:', { dateOfBirth, responses, signature: signatureData });
            alert('Medical history submitted successfully!');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                {/* Doctor Logo */}
                <div className={styles.logoSection}>
                    {doctorLogo ? (
                        <img src={doctorLogo} alt="Doctor Logo" className={styles.logo} />
                    ) : (
                        <div className={styles.logoPlaceholder}>🦷 DentaCare Pro</div>
                    )}
                </div>

                <h1 className={styles.title}>Medical History Form</h1>
                <p className={styles.subtitle}>Please fill out the following information accurately</p>

                {/* Date of Birth */}
                <div className={styles.section}>
                    <Input
                        type="date"
                        label="Date of Birth"
                        value={dateOfBirth}
                        onChange={setDateOfBirth}
                        required
                    />
                </div>

                {/* Medical History Questions */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Medical History</h2>
                    {medicalHistoryQuestions
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
                                                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {question.type === 'checkbox' && question.options && (
                                    <div className={styles.checkboxGroup}>
                                        {question.options.map((option) => (
                                            <label key={option} className={styles.checkboxOption}>
                                                <input
                                                    type="checkbox"
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
                        ))}
                </div>

                {/* Signature */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Signature</h2>
                    <p className={styles.signatureNote}>Please sign below to confirm the accuracy of the information provided</p>
                    <div className={styles.signatureContainer}>
                        <canvas
                            ref={canvasRef}
                            width={500}
                            height={200}
                            className={styles.signatureCanvas}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                        />
                    </div>
                    <Button variant="secondary" onClick={clearSignature}>Clear Signature</Button>
                </div>

                {/* Submit Button */}
                <div className={styles.submitSection}>
                    <Button onClick={handleSubmit}>Submit Medical History</Button>
                </div>
            </div>
        </div>
    );
}
