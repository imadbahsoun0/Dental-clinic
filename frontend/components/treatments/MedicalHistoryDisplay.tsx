'use client';

import React from 'react';
import { MedicalHistorySubmission, MedicalHistoryQuestion } from '@/types';
import styles from './MedicalHistory.module.css';

interface MedicalHistoryDisplayProps {
    medicalHistory?: MedicalHistorySubmission;
    questions: MedicalHistoryQuestion[];
}

export const MedicalHistoryDisplay: React.FC<MedicalHistoryDisplayProps> = ({
    medicalHistory,
    questions,
}) => {
    if (!medicalHistory) {
        return (
            <div className={styles.emptyState}>
                <p>No medical history submitted yet</p>
            </div>
        );
    }

    const getQuestionText = (response: { questionId: string; questionText?: string }): string => {
        // First, try to use the stored questionText
        if (response.questionText) {
            return response.questionText;
        }
        
        // Fallback: try to find in current questions array
        const question = questions.find(q => q.id === response.questionId);
        if (question) {
            return question.question;
        }
        
        // Last resort: show a descriptive message
        return `Question (ID: ${response.questionId.substring(0, 8)}...)`;
    };

    const formatAnswer = (answer: string | string[]): string => {
        // Handle array answers (checkboxes)
        if (Array.isArray(answer)) {
            return answer.length > 0 ? answer.join(', ') : 'None selected';
        }

        // Handle boolean-like string answers
        if (answer === 'true' || answer === 'Yes') return 'Yes';
        if (answer === 'false' || answer === 'No') return 'No';

        return answer || '-';
    };

    return (
        <div className={styles.medicalHistory}>
            <div className={styles.submissionInfo}>
                <span className={styles.label}>Submitted:</span>
                <span className={styles.value}>
                    {new Date(medicalHistory.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            </div>

            {/* Medical History Questions Section */}
            <div className={styles.questionsSection}>
                <h3 className={styles.sectionTitle}>Medical History Responses</h3>
                <div className={styles.questionsGrid}>
                    {!medicalHistory.responses || medicalHistory.responses.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>
                            No responses submitted
                        </p>
                    ) : (
                        medicalHistory.responses.map((response, index) => {
                            const questionText = getQuestionText(response);
                            const answerDisplay = formatAnswer(response.answer);

                            return (
                                <div key={response.questionId || index} className={styles.questionItem}>
                                    <div className={styles.questionContent}>
                                        <span className={styles.questionText}>{questionText}</span>
                                        <span className={styles.answerText}>{answerDisplay}</span>
                                        {response.answerText && (
                                            <div className={styles.additionalDetails}>
                                                <span className={styles.detailsLabel}>Additional details:</span>
                                                <span className={styles.detailsText}>{response.answerText}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
