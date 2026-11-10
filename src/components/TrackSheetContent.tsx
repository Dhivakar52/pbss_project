import React from 'react'

const TrackSheetContent: React.FC = () => {
    return (
        <ul className="list-disc pl-5 space-y-2 marker:text-[#08698c]">
            <li>
                Submit the Track Sheet signed by <strong>both parents</strong> to the school office of the
                branch applied for.
            </li>
            <li className="text-red-600 font-bold">
                Documents to be submitted in person by the parent only (with authorization letter from
                parent, if guardian):
            </li>
            <li>
                1. Track sheet signed by BOTH parents/guardian with recent photo of the child duly affixed
                (please mention Reg.No. at the back of the photo)
            </li>
            <li>2. Birth Certificate of Child - COPY</li>
            <li>3. Passport size photographs of both parents with Reg.No. written at the back</li>
            <li>4. Address proof for both parents - COPY</li>
            <li className="text-red-600 font-bold">Documents to be brought for verification:</li>
            <li>1. Birth Certificate of Child - ORIGINAL</li>
            <li>2. Proof of Address of both Parents - ORIGINAL</li>
            <li>3. Photo ID of both parents - ORIGINAL</li>
            <li className="text-green-600 font-bold">
                ₹ Rs. 500/- to be remitted through Debit / Credit card ONLY towards processing fee.
            </li>
        </ul>
    )
}

export default TrackSheetContent