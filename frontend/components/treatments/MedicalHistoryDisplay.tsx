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

    const getQuestionText = (questionId: string) => {
        const question = questions.find(q => q.id === questionId);
        return question?.question || 'Unknown Question';
    };

    const getAnswer = (questionId: string) => {
        const response = medicalHistory.responses.find(r => r.questionId === questionId);
        if (!response) return '-';

        // Handle array answers (checkboxes)
        if (Array.isArray(response.answer)) {
            return response.answer.join(', ');
        }

        // Handle boolean-like string answers
        if (response.answer === 'true' || response.answer === 'Yes') return 'Yes';
        if (response.answer === 'false' || response.answer === 'No') return 'No';

        return response.answer || '-';
    };

    return (
        <div className={styles.medicalHistory}>
            <div className={styles.submissionInfo}>
                <span className={styles.label}>Submitted:</span>
                <span className={styles.value}>
                    {new Date(medicalHistory.submittedAt).toLocaleDateString()}
                </span>
            </div>

            <div className={styles.questionsGrid}>
                {questions.map((question) => (
                    <div key={question.id} className={styles.questionItem}>
                        <span className={styles.questionText}>{question.question}</span>
                        <span className={styles.answerText}>{getAnswer(question.id)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
