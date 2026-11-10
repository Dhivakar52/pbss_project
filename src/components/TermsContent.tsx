import React from 'react'
import { INSTRUCTION_DATES } from '@/constants/instructionDates'

const TermsContent: React.FC = () => {
    return (
        <ul className="list-disc pl-5 space-y-2 marker:text-[#08698c]">
            <li>The Birth certificate should have the Child's Name</li>
            <li>
                <strong className="text-red-600">Age eligibility:</strong> minimum 3 years and 6 months as
                on {INSTRUCTION_DATES.termsAndConditions.asOnDate} (i.e. Only Children born between{' '}
                {INSTRUCTION_DATES.registration.dateOfBirthFrom} to{' '}
                {INSTRUCTION_DATES.registration.dateOfBirthTo} - <strong>both days inclusive</strong>) ONLY
                are eligible for registration.
            </li>
            <li>
                Name of the child and Date of Birth should be filled exactly as given in the birth
                certificate.
            </li>
            <li className="text-red-600 font-bold">
                Registration forms with false / incomplete or vague information will not be considered.
            </li>
            <li>Please adhere to the instructions given under "Track Sheet Submission".</li>
        </ul>
    )
}

export default TermsContent