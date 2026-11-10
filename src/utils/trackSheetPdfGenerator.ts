import React from 'react'
import { createRoot } from 'react-dom/client'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { TrackSheet2Print } from '@/components/print/TrackSheet2Print'
import type { TrackSheetData } from '@/components/print/printMappers'
import logoImg from '@/assets/images/logo.png'

/**
 * Pre-converts an image URL to a Base64 data URL so that html2canvas
 * never encounters CORS or tainted canvas errors.
 */
async function getLogoBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(url)
      reader.readAsDataURL(blob)
    })
  } catch {
    return url
  }
}

/**
 * Builds a strictly empty TrackSheetData object so the downloaded PDF functions
 * as a clean, blank printable form matching the Track Sheet v2 print UI.
 */
export function buildEmptyTrackSheetData(academicYear: string = '2027-2028'): TrackSheetData {
  return {
    registrationNo: '',
    childName: '',
    dob: '',
    gender: '',
    motherTongue: '',
    religion: '',
    caste: '',
    residentialAddress: '',
    fatherMobile: '',
    motherMobile: '',
    distanceFromResidence: '',
    modeOfTransport: '',
    hasSiblings: 'No',
    hasSchoolGoingSiblings: false,
    siblings: [
      { name: '', school: '', usn: '', classSec: '', leavingYearAndClass: '' },
      { name: '', school: '', usn: '', classSec: '', leavingYearAndClass: '' },
      { name: '', school: '', usn: '', classSec: '', leavingYearAndClass: '' },
      { name: '', school: '', usn: '', classSec: '', leavingYearAndClass: '' },
    ],
    fatherName: '',
    fatherQualification: '',
    fatherDesignation: '',
    fatherIncome: '',
    motherName: '',
    motherQualification: '',
    motherDesignation: '',
    motherIncome: '',
    isFatherAlumnus: 'No',
    fatherAlumnus: false,
    isMotherAlumnus: 'No',
    motherAlumnus: false,
    fatherPassingYear: '',
    motherPassingYear: '',
    fatherYearsStudied: '',
    motherYearsStudied: '',
    fatherClassLastStudied: '',
    motherClassLastStudied: '',
    fatherBranch: '',
    motherBranch: '',
    fatherReasonForLeaving: '',
    fatherReasonLeaving: '',
    motherReasonForLeaving: '',
    motherReasonLeaving: '',
    isNormalHealthyChild: 'Yes',
    majorAilment: '',
    dateOfSubmission: '',
    submissionTimings: '',
    timings: '',
    schoolAppliedFor: 'Padma Seshadri Bala Bhavan Senior Secondary School',
    academicYear,
  }
}

/**
 * Generates and immediately downloads the official PSBB Track Sheet as an exact PDF replica
 * matching the Track Sheet v2 print UI layout (all 3 pages with exact CSS, tables, photos, signatures)
 * containing completely blank / empty data fields for manual filling.
 */
export async function downloadTrackSheetPdf(customData?: Partial<TrackSheetData>): Promise<void> {
  const academicYear = customData?.academicYear || '2027-2028'
  const cleanFileName = `PSBB_Empty_Track_Sheet_${academicYear}`
  const emptyData = {
    ...buildEmptyTrackSheetData(academicYear),
    ...(customData || {}),
  }

  // Ensure fields remain strictly empty if requested as blank form
  if (!customData?.registrationNo) emptyData.registrationNo = ''
  if (!customData?.childName) emptyData.childName = ''

  // Pre-convert logo to base64 data url so html2canvas never faces CORS or taint issues
  const base64Logo = await getLogoBase64(logoImg)

  // 1. Create a mounted container with exact A4 dimensions and real layout
  const container = document.createElement('div')
  container.id = 'offscreen-tracksheet-pdf-render'
  container.style.position = 'fixed'
  container.style.left = '0px'
  container.style.top = '0px'
  container.style.width = '794px' // exact A4 width at 96 DPI
  container.style.height = '3369px' // three A4 pages at 96 DPI
  container.style.backgroundColor = '#ffffff'
  container.style.zIndex = '99999'
  container.style.opacity = '0.001'
  container.style.pointerEvents = 'none'
  container.style.overflow = 'visible'
  document.body.appendChild(container)

  const root = createRoot(container)

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    root.render(React.createElement(TrackSheet2Print, { data: emptyData }))

    // Wait for fonts & DOM layout to fully settle
    if (document.fonts) {
      await document.fonts.ready
    }
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Ensure all images are loaded
    const images = Array.from(container.querySelectorAll('img'))
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve(true)
        return new Promise((resolve) => {
          img.onload = () => resolve(true)
          img.onerror = () => resolve(false)
        })
      })
    )
    await new Promise((resolve) => setTimeout(resolve, 100))

    const pageElements = Array.from(container.querySelectorAll<HTMLElement>('.print-page'))
    if (pageElements.length === 0) {
      throw new Error('Track Sheet v2 print pages were not found in rendered DOM')
    }

    // Capture each V2 page cleanly with crisp 2x resolution
    for (const [pageIndex, pageEl] of pageElements.entries()) {
      const pageNum = pageIndex + 1

      // Capture at crisp 2x resolution
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.98)

      if (pageNum > 1) {
        doc.addPage('a4', 'portrait')
      }

      // Exact A4 Page Dimensions in mm: 210 x 297
      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
    }

    // Trigger immediate browser download
    doc.save(`${cleanFileName}.pdf`)
  } catch (err) {
    console.error('Error generating Track Sheet PDF via html2canvas, running exact vector fallback:', err)
    generateVectorTrackSheetPdf(emptyData, cleanFileName, base64Logo)
  } finally {
    // Clean up offscreen container
    try {
      root.unmount()
      container.remove()
    } catch {
      // Ignore unmount warnings
    }
  }
}

/**
 * Fallback vector PDF generator matching the official print header and layout
 * with 100% empty fields (no sample values, no dark blue banners).
 */
function generateVectorTrackSheetPdf(
  data: Partial<TrackSheetData>,
  cleanFileName: string,
  logoBase64?: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const textDark = [0, 0, 0]
  const academicYear = data.academicYear || '2027-2028'

  const drawHeader = () => {
    // Logo if base64 available
    if (logoBase64 && logoBase64.startsWith('data:image')) {
      try {
        doc.addImage(logoBase64, 'PNG', 14, 12, 18, 18)
      } catch {
        // ignore image error in vector mode
      }
    }

    // Header matching PrintDocumentHeader
    doc.setFontSize(15)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(textDark[0], textDark[1], textDark[2])
    doc.text('Padma Seshadri Bala Bhavan Sr. Sec. School', 105, 18, { align: 'center' })

    const schoolAddress =
      data.schoolAddress ||
      (data.schoolAppliedFor?.toLowerCase().includes('k.k') || data.schoolAppliedFor?.toLowerCase().includes('kk')
        ? '29, Alagirisamy Salai, K.K. Nagar, Chennai - 600078'
        : 'No: 17, Thirumalai Road, T.Nagar, Chennai - 600017')

    doc.setFontSize(11)
    doc.text(schoolAddress, 105, 23, { align: 'center' })

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Track Sheet for Registration into Pre KG ${academicYear}`, 105, 29, { align: 'center' })

    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.4)
    doc.line(14, 33, 196, 33)
  }

  // Field helper
  const drawField = (label: string, value: string, x: number, y: number, width: number) => {
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(label, x, y + 4.5)

    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.text(':', x + width - 2, y + 4.5)

    if (value) {
      doc.text(value, x + width + 2, y + 4.5)
    }
  }

  // ================= PAGE 1 =================
  drawHeader()

  // Registration No. box
  drawField('Registration No.', '', 14, 37, 40)
  doc.setLineWidth(0.2)
  doc.rect(56, 37, 50, 7)

  drawField('Name of the Child', '', 14, 47, 40)
  doc.line(56, 53, 150, 53)

  // Applicant Photo box
  doc.rect(155, 37, 41, 48)
  doc.setFontSize(7.5)
  doc.text('Affix latest Passport size', 175.5, 55, { align: 'center' })
  doc.text('photo of the applicant with', 175.5, 59, { align: 'center' })
  doc.text('Reg No. at the back.', 175.5, 63, { align: 'center' })

  drawField('Date of Birth', '', 14, 57, 30)
  drawField('Gender', '', 70, 57, 20)
  drawField('Mother Tongue', '', 14, 67, 30)
  drawField('Religion', '', 14, 77, 30)
  drawField('Caste', '', 70, 77, 20)
  drawField('Residential Address', '', 14, 87, 35)

  drawField("Father's Mobile No", '', 14, 101, 35)
  drawField("Mother's Mobile No", '', 100, 101, 35)
  drawField('Distance from Residence', '', 14, 111, 40)
  drawField('Mode of Transport', '', 100, 111, 35)

  // Siblings Section
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Does the child have any school going Siblings?  [  ] Yes   [  ] No', 14, 125)

  autoTable(doc, {
    startY: 129,
    margin: { left: 14, right: 14 },
    head: [['Name of the Sibling', 'Name of the School', 'USN', 'Class / Sec', 'Year&Class Of Leaving If Former/Left Student']],
    body: [
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
    ],
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 8, fontStyle: 'bold', lineWidth: 0.2, lineColor: [0, 0, 0] },
    bodyStyles: { minCellHeight: 6, fontSize: 8, textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] },
  })

  // Parents Profile
  const curY = ((doc as any).lastAutoTable?.finalY || 165) + 6
  drawField("Father's Name", '', 14, curY, 35)
  drawField("Mother's Name", '', 105, curY, 35)
  drawField("Father's Qualification", '', 14, curY + 9, 35)
  drawField("Mother's Qualification", '', 105, curY + 9, 35)
  drawField("Father's Designation", '', 14, curY + 18, 35)
  drawField("Mother's Designation", '', 105, curY + 18, 35)
  drawField("Father's Income", '', 14, curY + 27, 35)
  drawField("Mother's Income", '', 105, curY + 27, 35)

  // Footer Page 1
  doc.setFontSize(8)
  doc.text('Page 1 of 3', 196, 288, { align: 'right' })

  // ================= PAGE 2 =================
  doc.addPage()
  drawHeader()

  drawField('Is Father an Alumnus?', '', 14, 38, 40)
  drawField('Is Mother an Alumnus?', '', 105, 38, 40)
  drawField('Year of Passing/ Leaving', '', 14, 46, 40)
  drawField('Year of Passing/ Leaving', '', 105, 46, 40)
  drawField('No of Years Studied', '', 14, 54, 40)
  drawField('No of Years Studied', '', 105, 54, 40)
  drawField('Class Last Studied', '', 14, 62, 40)
  drawField('Class Last Studied', '', 105, 62, 40)
  drawField('Branch', '', 14, 70, 40)
  drawField('Branch', '', 105, 70, 40)
  drawField('Reason for Leaving', '', 14, 78, 40)
  drawField('Reason for Leaving', '', 105, 78, 40)

  drawField('Is the child a normal healthy child', '', 14, 88, 50)
  drawField('Specify Major ailment, If any (Past/Present)', '', 14, 96, 60)

  // 3 Photo boxes
  doc.rect(25, 106, 38, 46)
  doc.setFontSize(7)
  doc.text('Affix latest Passport size photo', 44, 126, { align: 'center' })
  doc.text('of the Guardian (if applicable)', 44, 130, { align: 'center' })
  doc.text('with Reg No. at the back.', 44, 134, { align: 'center' })

  doc.rect(85, 106, 38, 46)
  doc.text('Affix latest Passport size photo', 104, 126, { align: 'center' })
  doc.text('of the Father with', 104, 130, { align: 'center' })
  doc.text('Reg No. at the back.', 104, 134, { align: 'center' })

  doc.rect(145, 106, 38, 46)
  doc.text('Affix latest Passport size photo', 164, 126, { align: 'center' })
  doc.text('of the Mother with', 164, 130, { align: 'center' })
  doc.text('Reg No. at the back.', 164, 134, { align: 'center' })

  // Declaration
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const declText =
    'We, the parents (father & mother) / guardian of _________________________________ seeking his / her admission to Pre-KG hereby solemnly declare that the information furnished above is absolutely true and that if found factually incorrect at any time after the admission during his / her stay in school, We shall abide by the orders of the school for withdrawal of our son/daughter/ward without any plea or protest. We also understand and accept that submission of online registration form and track sheet does not guarantee admission.'
  doc.text(doc.splitTextToSize(declText, 182), 14, 160)

  // Signatures
  doc.text('Date :', 14, 190)
  doc.line(70, 190, 105, 190)
  doc.line(115, 190, 150, 190)
  doc.line(160, 190, 195, 190)
  doc.setFontSize(7.5)
  doc.text('Signature of Father', 87.5, 194, { align: 'center' })
  doc.text('Signature of Mother', 132.5, 194, { align: 'center' })
  doc.text('Signature of Guardian', 177.5, 194, { align: 'center' })
  doc.text('(If Applicable)', 177.5, 197.5, { align: 'center' })

  doc.setFontSize(8)
  doc.text('Name in BLOCK LETTER :', 14, 206)

  // Bottom Submission Box
  doc.rect(14, 215, 182, 28)
  drawField('Date of Submission', '', 18, 220, 35)
  drawField('Timings', '', 18, 230, 35)
  drawField('Reg No.', '', 105, 220, 35)
  drawField("Child's Name", '', 105, 230, 35)

  doc.setFontSize(8)
  doc.text('Page 2 of 3', 196, 288, { align: 'right' })

  // ================= PAGE 3 =================
  doc.addPage()
  drawHeader()

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Instruction:', 14, 42)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const instructions = [
    '• Forms with False / Incomplete / Vague information will not be considered.',
    '• Submit the Track Sheet signed by both parents (to the school office of the branch applied for).',
    '• Documents to be submitted in person by the parent only (with authorization letter from parent, if guardian):',
    '    1. Track sheet signed by BOTH parents/guardian with recent photo of the child duly affixed',
    '        (please mention Reg No. at the back of the photo)',
    '    2. Birth Certificate of Child - COPY',
    '    3. Passport size photographs of both parents with Reg No. written at the back.',
    '    4. Address proof for both parents - COPY',
    '• Documents to be brought for verification:',
    '    1. Birth Certificate of Child - ORIGINAL',
    '    2. Proof of Address of both Parents – ORIGINAL',
    '    3. Photo ID of both parents - ORIGINAL',
    '• Rs. 500/- to be remitted through Debit/Credit card ONLY towards processing fee.',
  ]
  let insY = 48
  instructions.forEach((line) => {
    doc.text(line, 16, insY)
    insY += 6
  })

  doc.setFontSize(8)
  doc.text('Page 3 of 3', 196, 288, { align: 'right' })

  doc.save(`${cleanFileName}.pdf`)
}

export default downloadTrackSheetPdf
