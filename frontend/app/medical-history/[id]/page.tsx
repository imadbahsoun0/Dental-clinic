'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import styles from './medical-history.module.css';

interface MedicalHistoryQuestion {
    id: string;
    question: string;
    type: 'text' | 'radio' | 'checkbox' | 'textarea' | 'radio_with_text';
    options?: string[];
    required: boolean;
    order: number;
    textTriggerOption?: string;
    textFieldLabel?: string;
}

export default function MedicalHistoryPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const patientId = params.id as string;
    const orgId = searchParams.get('orgId');

    const [medicalHistoryQuestions, setMedicalHistoryQuestions] = useState<MedicalHistoryQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [existingSubmission, setExistingSubmission] = useState<boolean>(false);
    const [patientName, setPatientName] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [email, setEmail] = useState('');
    const [bloodType, setBloodType] = useState('');
    const [address, setAddress] = useState('');
    const [responses, setResponses] = useState<Record<string, string | string[]>>({});
    const [responseTexts, setResponseTexts] = useState<Record<string, string>>({});
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!orgId) {
            toast.error('Organization ID is required');
            return;
        }
        fetchQuestions();
        fetchPatientName();
        fetchOrganizationDetails();
        checkExistingSubmission();
    }, [orgId, patientId]);

    const fetchPatientName = async () => {
        try {
            const response = await api.api.patientsControllerFindOne(patientId);
            if (response.success && response.data) {
                setPatientName(`${response.data.firstName} ${response.data.lastName}`);
            }
        } catch (error) {
            console.error('Error fetching patient name:', error);
        }
    };

    const fetchOrganizationDetails = async () => {
        try {
            const response = await api.api.organizationsControllerGetById(orgId!);
            if (response.success && response.data) {
                setOrganizationName(response.data.name);
                setOrganizationLogo(response.data.logo);
            }
        } catch (error) {
            console.error('Error fetching organization details:', error);
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await api.api.medicalHistoryControllerFindAllPublic({ orgId: orgId! });
            
            if (response.success && response.data) {
                setMedicalHistoryQuestions(response.data);
            }
        } catch (error) {
            console.error('Error fetching medical history questions:', error);
            toast.error('Failed to load medical history questions');
        } finally {
            setLoading(false);
        }
    };

    const checkExistingSubmission = async () => {
        try {
            const response = await api.api.patientsControllerGetMedicalHistory(patientId);
            
            if (response.success && response.data) {
                setExistingSubmission(true);
                // Pre-fill the form with existing data
                setDateOfBirth(response.data.dateOfBirth || '');
                setEmergencyContact(response.data.emergencyContact || '');
                setEmail(response.data.email || '');
                setBloodType(response.data.bloodType || '');
                setAddress(response.data.address || '');
                const existingResponses: Record<string, string | string[]> = {};
                const existingTexts: Record<string, string> = {};
                if (Array.isArray(response.data.responses)) {
                    response.data.responses.forEach((r: any) => {
                        existingResponses[r.questionId] = r.answer;
                        if (r.answerText) {
                            existingTexts[r.questionId] = r.answerText;
                        }
                    });
                }
                setResponses(existingResponses);
                setResponseTexts(existingTexts);
                
                // Load signature if available
                if (response.data.signature && canvasRef.current) {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        const img = new Image();
                        img.onload = () => {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        };
                        img.src = response.data.signature;
                    }
                }
            }
        } catch (error) {
            console.error('Error checking existing submission:', error);
            // Not an error if no submission exists yet
        }
    };

    const handleResponseChange = (questionId: string, answer: string | string[]) => {
        if (existingSubmission) return; // Prevent changes after submission
        setResponses({ ...responses, [questionId]: answer });
    };

    const handleResponseTextChange = (questionId: string, text: string) => {
        if (existingSubmission) return; // Prevent changes after submission
        setResponseTexts({ ...responseTexts, [questionId]: text });
    };

    const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
        if (existingSubmission) return; // Prevent changes after submission
        const currentAnswers = (responses[questionId] as string[]) || [];
        if (checked) {
            setResponses({ ...responses, [questionId]: [...currentAnswers, option] });
        } else {
            setResponses({ ...responses, [questionId]: currentAnswers.filter((a) => a !== option) });
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (existingSubmission) return; // Prevent drawing after submission
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
        if (existingSubmission) return; // Prevent clearing after submission
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const handleSubmit = async () => {
        if (!dateOfBirth) {
            toast.error('Please enter your date of birth');
            return;
        }

        if (!emergencyContact) {
            toast.error('Please enter an emergency contact number');
            return;
        }

        if (!bloodType) {
            toast.error('Please select your blood type');
            return;
        }

        if (!address) {
            toast.error('Please enter your address');
            return;
        }

        // Validate required questions
        for (const question of medicalHistoryQuestions) {
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

        const canvas = canvasRef.current;
        if (!canvas) {
            toast.error('Signature is required');
            return;
        }

        const signatureData = canvas.toDataURL();
        
        // Check if signature is empty (all white)
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let isEmpty = true;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] < 255 || data[i + 1] < 255 || data[i + 2] < 255) {
                    isEmpty = false;
                    break;
                }
            }
            if (isEmpty) {
                toast.error('Please provide your signature');
                return;
            }
        }

        setSubmitting(true);
        try {
            const submitData = {
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
                signature: signatureData,
            };

            const response = await api.api.patientsControllerSubmitMedicalHistory(patientId, submitData);

            if (response.success) {
                toast.success(existingSubmission 
                    ? 'Medical history updated successfully!' 
                    : 'Medical history submitted successfully!');
                setExistingSubmission(true);
            } else {
                toast.error(response.message || 'Failed to submit medical history');
            }
        } catch (error) {
            console.error('Error submitting medical history:', error);
            toast.error('Failed to submit medical history');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.formCard}>
                    <p>Loading medical history form...</p>
                </div>
            </div>
        );
    }

    if (!orgId) {
        return (
            <div className={styles.container}>
                <div className={styles.formCard}>
                    <p>Error: Organization ID is required</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                {/* Doctor Logo & Clinic Name */}
                <div className={styles.logoSection}>
                    {organizationLogo ? (
                        <div className={styles.logoWithName}>
                            <img 
                                src={organizationLogo} 
                                alt={organizationName || 'Clinic Logo'} 
                                className={styles.organizationLogo}
                            />
                            <div className={styles.clinicName}>{organizationName}</div>
                        </div>
                    ) : (
                        <div className={styles.logoPlaceholder}>
                            🦷 {organizationName || 'DentaCare Pro'}
                        </div>
                    )}
                </div>

                <h1 className={styles.title}>Medical History Form</h1>
                {patientName && (
                    <p className={styles.patientName}>Patient: {patientName}</p>
                )}
                <p className={styles.subtitle}>
                    {existingSubmission 
                        ? 'Your medical history has been submitted and cannot be edited.' 
                        : 'Please fill out the following information accurately'}
                </p>

                {existingSubmission && (
                    <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#f0f9ff', 
                        border: '1px solid #3b82f6', 
                        borderRadius: '8px', 
                        marginBottom: '20px',
                        color: '#1e40af'
                    }}>
                        ✓ This form has already been submitted and is now read-only.
                    </div>
                )}

                {/* Date of Birth */}
                <div className={styles.section}>
                    <Input
                        type="date"
                        label="Date of Birth"
                        value={dateOfBirth}
                        onChange={setDateOfBirth}
                        required
                        disabled={existingSubmission}
                    />
                </div>

                {/* Emergency Contact */}
                <div className={styles.section}>
                    <Input
                        type="tel"
                        label="Emergency Contact Phone Number"
                        value={emergencyContact}
                        onChange={setEmergencyContact}
                        placeholder=""
                        required
                        disabled={existingSubmission}
                    />
                </div>

                {/* Email */}
                <div className={styles.section}>
                    <Input
                        type="email"
                        label="Email (Optional)"
                        value={email}
                        onChange={setEmail}
                        placeholder=""
                        disabled={existingSubmission}
                    />
                </div>

                {/* Address */}
                <div className={styles.section}>
                    <label className={styles.label}>Address *</label>
                    <textarea
                        className={styles.textarea}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your full address..."
                        rows={3}
                        disabled={existingSubmission}
                        required
                    />
                </div>

                {/* Blood Type */}
                <div className={styles.section}>
                    <label className={styles.label}>Blood Type *</label>
                    <select
                        className={styles.select}
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        disabled={existingSubmission}
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
                    <h2 className={styles.sectionTitle}>Medical History</h2>
                    {medicalHistoryQuestions.length === 0 ? (
                        <p>No medical history questions available.</p>
                    ) : (
                        medicalHistoryQuestions
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
                                                        disabled={existingSubmission}
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
                                                            disabled={existingSubmission}
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
                                                        disabled={existingSubmission}
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
                                                        disabled={existingSubmission}
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
                                            disabled={existingSubmission}
                                        />
                                    )}

                                    {question.type === 'textarea' && (
                                        <textarea
                                            className={styles.textarea}
                                            value={(responses[question.id] as string) || ''}
                                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                            placeholder="Your answer..."
                                            rows={4}
                                            disabled={existingSubmission}
                                        />
                                    )}
                                </div>
                            ))
                    )}
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
                            style={{ cursor: existingSubmission ? 'not-allowed' : 'crosshair', opacity: existingSubmission ? 0.7 : 1 }}
                        />
                    </div>
                    {!existingSubmission && (
                        <Button variant="secondary" onClick={clearSignature}>Clear Signature</Button>
                    )}
                </div>

                {/* Submit Button */}
                {!existingSubmission && (
                    <div className={styles.submitSection}>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Medical History'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
