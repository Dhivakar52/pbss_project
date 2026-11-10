import React from 'react'
import { INSTRUCTION_DATES } from '@/constants/instructionDates'

const RegistrationContent: React.FC = () => {
    return (
        <>
            <ul className="list-disc pl-5 space-y-2 marker:text-[#08698c]">
                <li>
                    Register yourself to get user id and password (
                    <a href="#" className="text-blue-600 underline font-bold">
                        click here to view the Sample Registration Form
                    </a>
                    ).
                </li>
                <li>Create separate user id and password for applying in case of twins / triplets.</li>
                <li>Ensure you furnish all details as required in the registration form.</li>
                <li>Make all the corrections (if any) before accepting the declaration.</li>
                <li className="text-red-600 font-bold">
                    Modification of details is not possible after accepting the declaration.
                </li>
                <li className="text-red-600 font-bold">
                    PRINT TRACK SHEET: If Adobe Acrobat Reader is not available in your system,{' '}
                    <a href="#" className="text-blue-600 underline font-bold">
                        please click here to download PDF
                    </a>
                </li>
                <li>
                    During the process of filling the online Registration form, if there is any interruption
                    restart the process using the same user id and password.
                </li>
                <li>
                    To print the Track Sheet later (if not done immediately after submitting the Online
                    Registration Form) :
                    <ul className="list-[circle] pl-5 mt-1 space-y-1 marker:text-[#08698c]">
                        <li>Login again with the given user id and password</li>
                        <li>"Print Track Sheet"</li>
                    </ul>
                </li>
                <li>Please ensure "Track Sheet" is printed as soon as Online Registration Form is submitted.</li>
            </ul>

            {/* Blue NOTE badge */}
            <div className="mt-3 block w-full px-3 py-2 rounded-md text-xs font-bold bg-blue-600 text-white">
                ℹ️ <strong>NOTE:</strong> *Print* option will not be available after midnight of{' '}
                <strong>{INSTRUCTION_DATES.registration.printDeadlineDate}</strong>.
            </div>

            {/* Yellow warning badge */}
            <div className="block w-full px-3 py-2 rounded-md text-xs font-semibold bg-yellow-50 border border-yellow-400 text-yellow-800">
                ⚠ Registration process is considered to be complete only on submission of Track sheet
            </div>
        </>
    )
}

export default RegistrationContent;