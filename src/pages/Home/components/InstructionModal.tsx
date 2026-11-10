import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertTriangle,
  CreditCard,
  Phone,
  Info,
  X,
} from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { downloadTrackSheetPdf } from '@/utils/trackSheetPdfGenerator'
import { INSTRUCTION_SHARED_DATES } from '@/constants/instructionDates'
import { getDefaultInstructionHtml } from '@/utils/defaultInstructionHtml'
import logoImg from '@/assets/images/logo.png'

interface InstructionSegment {
  text: string
  href?: string
  title?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

interface InstructionListItem {
  segments: InstructionSegment[]
  children: InstructionListItem[]
  childrenOrdered: boolean
}

interface InstructionContent {
  title: string
  standard: string
  academicYear: string
  registrationHeading: string
  registrationItems: InstructionListItem[]
  printDeadlineNote: string
  statusNotice: string
  trackSheetHeading: string
  trackSheetItems: InstructionListItem[]
  termsHeading: string
  termsItems: InstructionListItem[]
  helpdeskPrefix: string
  helpdeskNumber: string
  helpdeskSuffix: string
}

const getInstructionItemText = (item: InstructionListItem) =>
  item.segments.map((segment) => segment.text).join('').replace(/\s+/g, ' ').trim()

const getInstructionItemKey = (item: InstructionListItem): string =>
  getInstructionItemText(item).toLowerCase()

const parseInstructionContent = (html: string): InstructionContent => {
  const parsedDocument = new DOMParser().parseFromString(html, 'text/html')
  const sectionHeadings = [
    {
      key: 'registration',
      pattern: /^registration\s*:?$/i,
    },
    {
      key: 'trackSheet',
      pattern: /^track\s*sheet\s*submission\s*:?$/i,
    },
    {
      key: 'terms',
      pattern: /^terms\s*(?:&|and)\s*conditions\s*:?$/i,
    },
  ] as const
  const headingElements = Array.from(
    parsedDocument.body.querySelectorAll('h1,h2,h3,h4,h5,h6,p,strong,b,span,div'),
  )
  const headingMatches = sectionHeadings.map((section) => ({
    ...section,
    element: headingElements.find((element) => section.pattern.test(element.textContent?.trim() || '')),
  }))

  const parseListItem = (element: HTMLLIElement): InstructionListItem => {
    const segments: InstructionSegment[] = []
    const collectSegments = (
      node: Node,
      formatting: Pick<InstructionSegment, 'bold' | 'italic' | 'underline'> = {},
    ) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          if (child.textContent) segments.push({ text: child.textContent, ...formatting })
          return
        }

        if (child.nodeType !== Node.ELEMENT_NODE) return
        const childElement = child as Element
        if (childElement.tagName === 'UL' || childElement.tagName === 'OL') return
        if (childElement.tagName === 'A') {
          segments.push({
            text: childElement.textContent || '',
            href: childElement.getAttribute('href') || undefined,
            title: childElement.getAttribute('title') || undefined,
            ...formatting,
          })
          return
        }

        collectSegments(childElement, {
          bold: formatting.bold || childElement.tagName === 'B' || childElement.tagName === 'STRONG',
          italic: formatting.italic || childElement.tagName === 'I' || childElement.tagName === 'EM',
          underline: formatting.underline || childElement.tagName === 'U',
        })
      })
    }

    collectSegments(element)
    const nestedList = Array.from(element.children).find((child) =>
      child.tagName === 'UL' || child.tagName === 'OL',
    )
    const nestedItems = nestedList
      ? Array.from(nestedList.children)
        .filter((child): child is HTMLLIElement => child.tagName === 'LI')
        .map(parseListItem)
      : []

    return {
      segments,
      children: nestedItems,
      childrenOrdered: nestedList?.tagName === 'OL',
    }
  }

  const sectionItems = new Map<string, InstructionListItem[]>()
  sectionHeadings.forEach(({ key }) => sectionItems.set(key, []))
  const listItems = Array.from(parsedDocument.body.querySelectorAll('li'))
    .filter((item) => !item.parentElement?.closest('li'))

  listItems.forEach((item) => {
    const section = headingMatches
      .filter(({ element }) =>
        element &&
        Boolean(element.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING),
      )
      .at(-1)
    if (!section) return

    const parsedItem = parseListItem(item)
    const items = sectionItems.get(section.key)
    if (items && !items.some((existingItem) => getInstructionItemKey(existingItem) === getInstructionItemKey(parsedItem))) {
      items.push(parsedItem)
    }
  })

  const textFromElements = (selector: string, predicate: (text: string) => boolean) =>
    Array.from(parsedDocument.body.querySelectorAll(selector))
      .map((element) => element.textContent?.replace(/\s+/g, ' ').trim() || '')
      .filter((text) => text && predicate(text))
      .sort((left, right) => left.length - right.length)[0] || ''

  const bodyText = parsedDocument.body.textContent?.replace(/\s+/g, ' ').trim() || ''
  const academicYear = bodyText.match(/\b20\d{2}\s*[-–]\s*(?:20)?\d{2}\b/)?.[0] || ''
  const standard = bodyText.match(/\b(?:PRE[\s-]?KG|LKG|UKG|KG)\b/i)?.[0] || ''
  const rawPageTitle =
    parsedDocument.title.trim() ||
    textFromElements('h1,h2,h3', (text) => /general process|online registration/i.test(text))
  const pageTitle = rawPageTitle
    .replace(/\s*(?:[-–|]\s*)?(?:PRE[\s-]?KG|LKG|UKG|KG)\b.*$/i, '')
    .replace(/\s*[-–|]?\s*20\d{2}\s*[-–]\s*(?:20)?\d{2}\s*$/i, '')
    .trim()
  const printDeadlineNote = textFromElements('p,div,span', (text) => /^NOTE\s*:/i.test(text) && /print/i.test(text))
  const statusNotice = textFromElements('p,div,span', (text) => /registration process/i.test(text) && /complete/i.test(text))
  const helpdeskText = textFromElements('p,div,span', (text) => /contact/i.test(text) && /\d{7,}/.test(text))
  const helpdeskNumber = helpdeskText.match(/\+?[\d][\d\s()-]{6,}\d/)?.[0]?.trim() || ''
  const helpdeskNumberStart = helpdeskNumber ? helpdeskText.indexOf(helpdeskNumber) : -1

  return {
    title: pageTitle,
    standard,
    academicYear,
    registrationHeading: headingMatches.find(({ key }) => key === 'registration')?.element?.textContent?.trim() || '',
    registrationItems: sectionItems.get('registration') || [],
    printDeadlineNote,
    statusNotice,
    trackSheetHeading: headingMatches.find(({ key }) => key === 'trackSheet')?.element?.textContent?.trim() || '',
    trackSheetItems: sectionItems.get('trackSheet') || [],
    termsHeading: headingMatches.find(({ key }) => key === 'terms')?.element?.textContent?.trim() || '',
    termsItems: sectionItems.get('terms') || [],
    helpdeskPrefix: helpdeskNumberStart >= 0 ? helpdeskText.slice(0, helpdeskNumberStart) : helpdeskText,
    helpdeskNumber,
    helpdeskSuffix: helpdeskNumberStart >= 0 ? helpdeskText.slice(helpdeskNumberStart + helpdeskNumber.length) : '',
  }
}

export interface InstructionModalProps {
  isOpen: boolean
  onClose: () => void
  academicYear?: string
  onViewSampleRegistrationForm?: (academicYear: string) => void
  onDownloadTrackSheet?: (academicYear: string) => void | Promise<void>
}

export const InstructionModal: React.FC<InstructionModalProps> = ({
  isOpen,
  onClose,
  academicYear = INSTRUCTION_SHARED_DATES.academicYearShort,
  onViewSampleRegistrationForm,
  onDownloadTrackSheet,
}) => {
  const [instructionContent, setInstructionContent] = React.useState<InstructionContent | null>(null)

  React.useEffect(() => {
    if (!isOpen) return

    setInstructionContent(parseInstructionContent(getDefaultInstructionHtml()))
  }, [isOpen])

  const resolvedAcademicYear = instructionContent?.academicYear || academicYear

  const renderInstructionSegments = (
    segments: InstructionSegment[],
    boldPrefix = '',
  ) => {
    let remainingBoldPrefix = boldPrefix.length
    let boldPrefixStarted = false
    let segmentOffset = 0
    const fullText = segments.map((segment) => segment.text).join('')
    const registrationMatch = fullText.match(/click\s+here\s+to\s+view\s+the\s+sample\s+registration\s+form/i)
    const trackSheetPdfMatch = fullText.match(/(?:please\s+)?click\s+here\s+to\s+download\s+pdf/i)
    const actionMatch = registrationMatch || trackSheetPdfMatch
    const actionStart = actionMatch?.index ?? -1
    const actionEnd = actionStart + (actionMatch?.[0].length || 0)

    return (
      <>
        {segments.map((segment, index) => {
          const currentOffset = segmentOffset
          segmentOffset += segment.text.length
          const leadingWhitespace = boldPrefixStarted ? 0 : segment.text.match(/^\s*/)?.[0].length || 0
          const boldLength = Math.min(
            remainingBoldPrefix,
            Math.max(0, segment.text.length - leadingWhitespace),
          )
          remainingBoldPrefix -= boldLength
          if (boldLength > 0) boldPrefixStarted = true
          const segmentText = boldLength > 0
            ? <>
                {segment.text.slice(0, leadingWhitespace)}
                <strong>{segment.text.slice(leadingWhitespace, leadingWhitespace + boldLength)}</strong>
                {segment.text.slice(leadingWhitespace + boldLength)}
              </>
            : segment.text
          const segmentContent = segment.bold
            ? <strong>{segmentText}</strong>
            : segment.italic
              ? <em>{segmentText}</em>
              : segment.underline
                ? <u>{segmentText}</u>
                : segmentText

          const openLink = () => {
            if (!segment.href) {
              toast.error('The instruction link is unavailable.')
              return
            }
            try {
              const url = new URL(segment.href, window.location.origin)
              if (['http:', 'https:'].includes(url.protocol)) {
                window.open(url.href, '_blank', 'noopener,noreferrer')
              }
            } catch (error) {
              console.error('Unable to open instruction link:', error)
              toast.error('The instruction link could not be opened.')
            }
          }

          const actionLinkStart = Math.max(actionStart, currentOffset)
          const actionLinkEnd = Math.min(actionEnd, currentOffset + segment.text.length)
          const hasActionLink = actionStart >= 0 && actionLinkStart < actionLinkEnd

          if (hasActionLink) {
            const localStart = actionLinkStart - currentOffset
            const localEnd = actionLinkEnd - currentOffset
            const renderText = (text: string, start: number) => {
              const fragmentBoldStart = Math.max(leadingWhitespace, start)
              const fragmentBoldEnd = Math.min(leadingWhitespace + boldLength, start + text.length)
              const boldFragmentStart = fragmentBoldStart - start
              const boldFragmentEnd = fragmentBoldEnd - start
              const content = boldFragmentStart < boldFragmentEnd
                ? <>
                    {text.slice(0, boldFragmentStart)}
                    <strong>{text.slice(boldFragmentStart, boldFragmentEnd)}</strong>
                    {text.slice(boldFragmentEnd)}
                  </>
                : text
              if (segment.bold) return <strong>{content}</strong>
              if (segment.italic) return <em>{content}</em>
              if (segment.underline) return <u>{content}</u>
              return content
            }
            const isSampleRegistrationLink = Boolean(registrationMatch)
            const handleActionClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
              event.preventDefault()
              if (isSampleRegistrationLink) {
                if (onViewSampleRegistrationForm) {
                  onViewSampleRegistrationForm(resolvedAcademicYear)
                } else {
                  openLink()
                }
                return
              }

              try {
                if (onDownloadTrackSheet) {
                  await onDownloadTrackSheet(INSTRUCTION_SHARED_DATES.academicYearShort)
                } else {
                  await downloadTrackSheetPdf({
                    academicYear: INSTRUCTION_SHARED_DATES.academicYearShort,
                  })
                  toast.success('Blank Track Sheet PDF downloaded successfully!')
                }
              } catch (error) {
                console.error('Failed to download the blank Track Sheet PDF:', error)
                toast.error('The blank Track Sheet PDF could not be downloaded.')
              }
            }

            return (
              <React.Fragment key={index}>
                {localStart > 0 && renderText(segment.text.slice(0, localStart), 0)}
                <a
                  href="#"
                  id={actionLinkStart === actionStart
                    ? isSampleRegistrationLink ? 'btn-sample-registration-form' : 'btn-download-tracksheet-pdf'
                    : undefined}
                  onClick={handleActionClick}
                  className="text-[#1677FF] hover:text-[#0958D9] dark:text-blue-400 dark:hover:text-blue-300 font-bold underline underline-offset-2 cursor-pointer"
                  title={isSampleRegistrationLink ? 'Click to view Sample Registration Form' : 'Click to download Track Sheet PDF'}
                >
                  {renderText(segment.text.slice(localStart, localEnd), localStart)}
                </a>
                {localEnd < segment.text.length && renderText(segment.text.slice(localEnd), localEnd)}
              </React.Fragment>
            )
          }

          if (segment.href) {
            try {
              const url = new URL(segment.href, window.location.origin)
              if (['http:', 'https:'].includes(url.protocol)) {
                return (
                  <a
                    key={index}
                    href={url.href}
                    target={url.origin === window.location.origin ? undefined : '_blank'}
                    rel={url.origin === window.location.origin ? undefined : 'noopener noreferrer'}
                    className="text-[#1677FF] hover:text-[#0958D9] dark:text-blue-400 dark:hover:text-blue-300 font-bold underline underline-offset-2"
                  >
                    {segmentContent}
                  </a>
                )
              }
            } catch (error) {
              console.error('Invalid instruction link:', error)
            }
          }

          return <React.Fragment key={index}>{segmentContent}</React.Fragment>
        })}
      </>
    )
  }

  const renderInstructionItem = (
    item: InstructionListItem,
    nestedListClass?: string,
    boldPrefix = '',
  ) => (
    <>
      {renderInstructionSegments(item.segments, boldPrefix)}
      {item.children.length > 0 && (
        item.childrenOrdered ? (
          <ol className={nestedListClass || 'list-decimal pl-6 mt-1.5 space-y-1.5 text-slate-700 dark:text-slate-300'}>
            {item.children.map((child, index) => <li key={index}>{renderInstructionItem(child)}</li>)}
          </ol>
        ) : (
          <ul className={nestedListClass || 'list-disc pl-6 mt-1 space-y-1 text-slate-700 dark:text-slate-300'}>
            {item.children.map((child, index) => <li key={index}>{renderInstructionItem(child)}</li>)}
          </ul>
        )
      )}
    </>
  )

  // const handlePrint = () => {
  //   if (typeof window !== 'undefined') {
  //     window.print()
  //   }
  // }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="p-0 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 shadow-2xl"
        style={{
          maxWidth: '860px',
          width: '95vw',
        }}
      >
        {/* Top Header matching Official Banner */}
        <DialogHeader className="bg-[#0F294A] dark:bg-slate-950 px-6 py-3.5 border-b border-blue-900 flex-shrink-0 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="PSBB Logo" className="h-10 w-10 object-contain rounded bg-white p-0.5 shrink-0" />
              <div>
                <DialogTitle className="text-xs sm:text-sm md:text-base font-extrabold tracking-wide uppercase text-white leading-tight">
                  {instructionContent?.title}
                </DialogTitle>
                <p className="text-[11px] sm:text-xs font-bold text-blue-200 mt-0.5 tracking-wider">
                  {instructionContent?.standard}{resolvedAcademicYear ? ` (${resolvedAcademicYear})` : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white px-2.5 py-1 rounded-md text-xs font-bold hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/60 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs sm:text-[13px] leading-relaxed">
          {/* SECTION 1: REGISTRATION */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-extrabold text-[#0F294A] dark:text-blue-400 uppercase tracking-wide underline decoration-blue-500 underline-offset-4">
                {instructionContent?.registrationHeading}
              </h3>
            </div>

            <ul className="space-y-2 pl-4 list-disc marker:text-blue-600 dark:marker:text-blue-400">
              {instructionContent?.registrationItems.map((item, index) => (
                <li
                  key={index}
                  className={
                    /modification|not possible/i.test(getInstructionItemText(item))
                      ? 'font-semibold text-rose-700 dark:text-rose-400'
                      : /please ensure.*track sheet/i.test(getInstructionItemText(item))
                        ? 'font-semibold text-slate-900 dark:text-white'
                        : undefined
                  }
                >
                  {renderInstructionItem(
                    item,
                    undefined,
                    /^PRINT TRACK SHEET\b/i.test(getInstructionItemText(item))
                      ? 'PRINT TRACK SHEET'
                      : '',
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* BLUE NOTE BANNER */}
          <div className="p-3.5 rounded-xl bg-[#007ACC] text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-2xs">
            <Info className="h-5 w-5 shrink-0 text-white" />
            <span>{instructionContent?.printDeadlineNote}</span>
          </div>

          {/* STATUS NOTICE */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-xs sm:text-sm">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{instructionContent?.statusNotice}</span>
          </div>

          {/* SECTION 2: TRACK SHEET SUBMISSION */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-extrabold text-[#0F294A] dark:text-blue-400 uppercase tracking-wide underline decoration-blue-500 underline-offset-4">
                {instructionContent?.trackSheetHeading}
              </h3>
            </div>

            <ul className="space-y-3 pl-4 list-disc marker:text-blue-600 dark:marker:text-blue-400">
              {instructionContent?.trackSheetItems.map((item, index) => {
                const itemText = getInstructionItemText(item)
                const isFee = /processing fee|remitted|fee/i.test(itemText)
                const nestedListClass = /verification/i.test(itemText)
                  ? 'list-decimal pl-6 mt-1.5 space-y-1 text-slate-700 dark:text-slate-300'
                  : 'list-decimal pl-6 mt-1.5 space-y-1.5 text-slate-700 dark:text-slate-300'

                if (isFee) {
                  return (
                    <li key={index} className="font-bold text-[#0F294A] dark:text-blue-300">
                      <span className="inline-flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{renderInstructionSegments(item.segments)}</span>
                      </span>
                    </li>
                  )
                }

                return (
                  <li key={index}>
                    <span className={item.children.length > 0 ? 'font-semibold text-slate-900 dark:text-white' : undefined}>
                      {renderInstructionSegments(item.segments)}
                    </span>
                    {item.children.length > 0 && (
                      item.childrenOrdered ? (
                        <ol className={nestedListClass}>
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>{renderInstructionItem(child)}</li>
                          ))}
                        </ol>
                      ) : (
                        <ul className="list-disc pl-6 mt-1 space-y-1 text-slate-700 dark:text-slate-300">
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>{renderInstructionItem(child)}</li>
                          ))}
                        </ul>
                      )
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* SECTION 3: TERMS & CONDITIONS */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-extrabold text-[#0F294A] dark:text-blue-400 uppercase tracking-wide underline decoration-blue-500 underline-offset-4">
                {instructionContent?.termsHeading}
              </h3>
            </div>

            <ul className="space-y-2 pl-4 list-disc marker:text-blue-600 dark:marker:text-blue-400">
              {instructionContent?.termsItems.map((item, index) => (
                <li
                  key={index}
                  className={
                    /age eligibility/i.test(getInstructionItemText(item))
                      ? 'font-semibold text-slate-900 dark:text-white'
                      : /false|incomplete|vague/i.test(getInstructionItemText(item))
                        ? 'text-rose-700 dark:text-rose-400 font-medium'
                        : undefined
                  }
                >
                  {renderInstructionItem(item)}
                </li>
              ))}
            </ul>
          </div>

          {/* FOOTER HELPDESK CONTACT */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 flex items-center gap-3 text-slate-800 dark:text-slate-200 font-medium">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shrink-0">
              <Phone className="h-4 w-4" />
            </div>
            <p className="text-xs">
              {instructionContent?.helpdeskPrefix}
              {instructionContent?.helpdeskNumber && (
                <strong className="text-blue-700 dark:text-blue-400 font-extrabold text-sm">{instructionContent.helpdeskNumber}</strong>
              )}
              {instructionContent?.helpdeskSuffix}
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        {/* <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold cursor-pointer"
          >
            <X className="h-3.5 w-3.5 mr-1" /> Close
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="text-xs font-bold gap-1.5 text-white cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Instructions
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  )
}

export default InstructionModal
