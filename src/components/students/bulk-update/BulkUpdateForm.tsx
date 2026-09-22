import React from 'react'
import { Field, SelectField } from '@/components/FormPrimitives'

export interface BulkFieldConfig {
  key: string
  label: string
  options: { label: string; value: any }[]
}

export const BULK_UPDATE_FIELDS: BulkFieldConfig[] = [
  {
    key: 'applicationStatus',
    label: 'Application Status',
    options: [
      { label: 'Pending', value: 'Pending' },
      { label: 'Approved', value: 'Approved' },
      { label: 'Declared', value: 'Declared' },
      { label: 'Draft', value: 'Draft' },
      { label: 'Rejected', value: 'Rejected' },
    ],
  },
  {
    key: 'schoolBranch',
    label: 'School Branch',
    options: [
      { label: 'T.Nagar-PSBB', value: 'T.Nagar-PSBB' },
      { label: 'KK Nagar-PSBB', value: 'KK Nagar-PSBB' },
      { label: 'Nungambakkam-PSBB', value: 'Nungambakkam-PSBB' },
    ],
  },
  {
    key: 'academicYear',
    label: 'Academic Year / Class',
    options: [
      { label: '2025-26', value: '2025-26' },
      { label: '2024-25', value: '2024-25' },
    ],
  },
  {
    key: 'status1',
    label: 'Document Status 1',
    options: [
      { label: 'Verified (Yes)', value: true },
      { label: 'Not Verified (No)', value: false },
    ],
  },
  {
    key: 'status2',
    label: 'Document Status 2',
    options: [
      { label: 'Verified (Yes)', value: true },
      { label: 'Not Verified (No)', value: false },
    ],
  },
  {
    key: 'gender',
    label: 'Gender',
    options: [
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' },
    ],
  },
  {
    key: 'motherTongue',
    label: 'Mother Tongue',
    options: [
      { label: 'Tamil', value: 'Tamil' },
      { label: 'English', value: 'English' },
      { label: 'Malayalam', value: 'Malayalam' },
      { label: 'Telugu', value: 'Telugu' },
      { label: 'Hindi', value: 'Hindi' },
      { label: 'Gujarati', value: 'Gujarati' },
    ],
  },
  {
    key: 'community',
    label: 'Community',
    options: [
      { label: 'FC', value: 'FC' },
      { label: 'BC', value: 'BC' },
      { label: 'MBC', value: 'MBC' },
      { label: 'SC', value: 'SC' },
      { label: 'ST', value: 'ST' },
    ],
  },
  {
    key: 'religion',
    label: 'Religion',
    options: [
      { label: 'Hindu', value: 'Hindu' },
      { label: 'Christian', value: 'Christian' },
      { label: 'Muslim', value: 'Muslim' },
      { label: 'Jain', value: 'Jain' },
      { label: 'Sikh', value: 'Sikh' },
    ],
  },
]

interface BulkUpdateFormProps {
  selectedFieldKey: string
  onFieldKeyChange: (key: string) => void
  selectedValue: string
  onValueChange: (val: string) => void
  disabled?: boolean
}

export const BulkUpdateForm: React.FC<BulkUpdateFormProps> = ({
  selectedFieldKey,
  onFieldKeyChange,
  selectedValue,
  onValueChange,
  disabled = false,
}) => {
  const currentFieldConfig = BULK_UPDATE_FIELDS.find((f) => f.key === selectedFieldKey)

  return (
    <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
      <Field label="Field To Update" required>
        <SelectField
          value={selectedFieldKey}
          onChange={(val) => {
            onFieldKeyChange(val)
            onValueChange('') // Reset value selection when field changes
          }}
          disabled={disabled}
          placeholder="-- Select Field --"
          options={BULK_UPDATE_FIELDS.map((f) => ({ label: f.label, value: f.key }))}
        />
      </Field>

      <Field label="New Value" required error={!selectedValue && !!selectedFieldKey} errorText="Please select a new value to apply">
        <SelectField
          value={selectedValue}
          onChange={(val) => onValueChange(val)}
          disabled={disabled || !selectedFieldKey}
          placeholder={selectedFieldKey ? '-- Select New Value --' : 'Select a field first'}
          options={
            currentFieldConfig
              ? currentFieldConfig.options.map((opt) => ({
                  label: opt.label,
                  value: String(opt.value),
                }))
              : []
          }
        />
      </Field>
    </div>
  )
}
