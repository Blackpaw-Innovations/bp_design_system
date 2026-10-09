/**
 * Example: VerticalHome snapshot for Properties (figures from the demo workspace).
 * Real code builds pages from useDomainAttention() / the KPI endpoints; never hard-code.
 */
import { SnapshotCarousel, formatMoney, fmtKM, type SnapshotPage } from '@blackpaw/ui'
import { Link } from 'react-router-dom'

export function PropertiesSnapshot({ onReviewOffer, onMatchBank }: { onReviewOffer: () => void; onMatchBank: () => void }) {
  const pages: SnapshotPage[] = [
    { title: 'Needs you', action: { label: 'Review the offer', onClick: onReviewOffer }, cards: [
      { id: 'crit', label: 'Critical work open', value: '0', note: 'Safety-critical, needs action', href: '/work/orders?severity=critical' },
      { id: 'overdue', label: 'Overdue work orders', value: '0', note: 'Past their target time', href: '/work/orders?overdue=1' },
      { id: 'offers', label: 'Offers to approve', value: '1', note: 'Imara Retail Ltd, Office 2B. Waiting for an approver', tone: 'attention', href: '/leasing/offers' },
    ] },
    { title: 'Money', action: { label: 'Match bank lines', onClick: onMatchBank }, cards: [
      { id: 'owed', label: 'Rent and service charge owed', unit: 'KES', value: '120,000', note: '2 invoices, by days past due', href: '/money/receivables',
        chart: { kind: 'bars', rows: [
          { label: '31–60 days', value: formatMoney(60000), pct: 50 },
          { label: '61–90 days', value: formatMoney(60000), pct: 50, tone: 'attention' },
        ] } },
      { id: 'exceptions', label: 'Receipts needing a person', value: '1', note: 'KES 500 by M-Pesa matches no invoice', tone: 'attention', href: '/money/exceptions' },
      { id: 'bank', label: 'Bank lines to match', value: '3', note: 'From the 5–8 Oct statement', tone: 'attention', href: '/money/bank' },
    ] },
    { title: 'Space', action: { label: 'See available units', href: '/portfolio/units?status=available' }, cards: [
      { id: 'occ', label: 'Occupancy', value: '33%', note: '2 of 6 units leased at Garden Court', href: '/portfolio/units',
        chart: { kind: 'split', segments: [ { label: 'Leased', n: 2 }, { label: 'Held', n: 1, tone: 'attention' }, { label: 'Available', n: 3, tone: 'positive' } ] } },
      { id: 'ready', label: 'Units ready to let', value: '3', note: 'Shop G12, Shop G13, Parking P1', href: '/portfolio/units?status=available' },
      { id: 'value', label: 'Portfolio value', unit: 'KES', value: fmtKM(192_500_000), note: '1 property valued. Plaza Two not yet', href: '/portfolio/valuations' },
    ] },
    { title: 'Leasing', action: { label: 'Follow up 2 enquiries', href: '/leasing/enquiries?overdue=1' }, cards: [
      { id: 'enq', label: 'Open enquiries', value: '5', note: 'By stage', href: '/leasing/pipeline',
        chart: { kind: 'columns', columns: [ { label: 'New', n: 1 }, { label: 'Viewing', n: 1 }, { label: 'Offer', n: 2, tone: 'attention' }, { label: 'Contract', n: 1 } ] } },
      { id: 'follow', label: 'Overdue next action', value: '2', note: 'Needs a follow-up today', tone: 'attention', href: '/leasing/enquiries?overdue=1' },
      { id: 'deposits', label: 'Deposit settlements', value: '1', note: 'KES 92,000 back to the tenant, settled', tone: 'positive', href: '/tenancies/deposits' },
    ] },
  ]
  return (
    <SnapshotCarousel
      pages={pages}
      showAllHref="/attention"
      renderLink={({ href, className, children, ...rest }) => <Link to={href} className={className} {...rest}>{children}</Link>}
    />
  )
}
