# Radio with Text Question Type - Usage Guide

## Overview
The `radio_with_text` question type allows you to create radio button questions where selecting a specific option (e.g., "Other") reveals an additional text input field for the user to provide more details.

## Backend Changes

### 1. New Question Type
Added `RADIO_WITH_TEXT` to the `QuestionType` enum in `medical-history-question.entity.ts`

### 2. New Fields
Added two new optional fields to `MedicalHistoryQuestion` entity:
- `textTriggerOption`: Specifies which option triggers the text input (e.g., "Other")
- `textFieldLabel`: Label for the conditional text field (e.g., "Please specify")

### 3. DTO Updates
- `MedicalHistoryAnswerDto`: Added optional `answerText` field
- `MedicalHistorySubmissionResponseDto`: Added optional `answerText` field

### 4. Database Migration
Migration `Migration20260101131418` adds the new fields to the `medical_history_questions` table

## Frontend Changes

### 1. Updated Interface
Added support for the new type and fields in the `MedicalHistoryQuestion` interface

### 2. State Management
- Added `responseTexts` state to store text values for radio_with_text questions
- Loads and saves `answerText` values alongside regular answers

### 3. UI Rendering
- Shows radio options as normal
- When the trigger option is selected, displays a text input field below
- Text field is indented and clearly associated with the selected option
- Respects read-only state after submission

### 4. Validation
- Validates that required text is provided when the trigger option is selected

## Example Usage

### Creating a Question in the Database

```typescript
// Example: "Do you have any allergies?"
{
  question: "Do you have any allergies?",
  type: QuestionType.RADIO_WITH_TEXT,
  options: ["No", "Yes", "Other"],
  textTriggerOption: "Other", // Shows text field when "Other" is selected
  textFieldLabel: "Please specify the allergy", // Label for text field
  required: true,
  order: 5,
  orgId: "your-org-id"
}
```

### How It Works

1. **User sees radio options**: No, Yes, Other
2. **User selects "Other"**
3. **Text field appears** with label "Please specify the allergy"
4. **User enters**: "Penicillin allergy"
5. **Data stored**:
   ```json
   {
     "questionId": "question-id",
     "answer": "Other",
     "answerText": "Penicillin allergy"
   }
   ```

## Use Cases

This question type is perfect for:
- **Allergies**: "No / Yes / Other" + specify which allergy
- **Medical Conditions**: "None / Diabetes / Heart Disease / Other" + specify
- **Medications**: "None / Pain relievers / Antibiotics / Other" + specify
- **Emergency Contact Relationship**: "Spouse / Parent / Sibling / Other" + specify
- Any scenario where you need predefined options plus a catch-all "Other"

## API Changes

### Submit Medical History
```typescript
POST /api/v1/patients/:id/medical-history
{
  "dateOfBirth": "1990-01-15",
  "responses": [
    {
      "questionId": "uuid",
      "answer": "Other",
      "answerText": "Penicillin allergy"  // Optional field
    }
  ],
  "signature": "data:image/png;base64,..."
}
```

### Get Medical History
```typescript
GET /api/v1/patients/:id/medical-history
Response:
{
  "dateOfBirth": "1990-01-15",
  "responses": [
    {
      "questionId": "uuid",
      "answer": "Other",
      "answerText": "Penicillin allergy"
    }
  ],
  "signature": "data:image/png;base64,...",
  "submittedAt": "2026-01-01T12:00:00Z"
}
```

## Testing

1. Create a medical history question with type `radio_with_text`
2. Set `textTriggerOption` to one of the options (e.g., "Other")
3. Set `textFieldLabel` (e.g., "Please specify")
4. Open the medical history form
5. Select the trigger option
6. Verify text field appears
7. Enter text and submit
8. Verify both answer and answerText are saved correctly
9. Reload the form and verify data is displayed correctly
