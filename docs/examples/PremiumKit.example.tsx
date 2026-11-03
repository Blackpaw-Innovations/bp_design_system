/**
 * Example: a "Money in" phone screen and a settings screen built only from the premium patterns
 * (docs/PREMIUM_PATTERNS.md). Figures are sample values; real screens compute every number from loaded data.
 */
import {
  Button, CaredEmpty, CodeChip, CountHero, DangerAction, DayCloseCard, DayGroup, DoneNote, Greeting, MoneyFigure, MoneyHero,
  NeedsYouCard, PersonCard, ProfileHero, ReceiptCard, ReceiptRow, RowGroup, SettingsItem, SettingsList, SwitchRow, TapRow,
  TimeRow, TintChip, InitialsTile, useArrivals, whatsAppLink, ButtonLink,
} from '@blackpaw/ui'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import hakiWaving from '@blackpaw/ui/assets/brand/hakiqa/mascot/haki-waving.png'

const link = ({ href, ...rest }: { href: string; className?: string; children: React.ReactNode }) => <Link to={href} {...rest} />

const receipts = [
  { id: 41, name: 'Amina Wanjiru', amount: 12000, meta: '14:23 · SO2600134', code: 'SAMPLE4AB4D51F' },
  { id: 40, name: 'Brian Otieno', amount: 4500, meta: '11:02 · SO2600131', code: 'SAMPLE9QW2E7RT', toConfirm: true },
]

export function MoneyInExample({ onReview }: { onReview: () => void }) {
  const fresh = useArrivals(receipts.map((r) => r.id), true)
  return (
    <>
      <Greeting name="Marvin Muriuki" image={hakiWaving}>3 orders to collect today, 2 have paid.</Greeting>
      <MoneyHero amount={16500} currency="KES" caption="in today from 2 payments"
        compare={{ direction: 'up', text: 'KES 3,500 more than yesterday by 14:30' }} renderLink={link}
        stats={[{ key: 'n', label: 'Payments today', value: 2 }, { key: 'c', label: 'To confirm', value: 1, href: '/money?state=matched' }]} />
      <NeedsYouCard title="1 payment needs a person" meta={['KES 4,500 from Brian Otieno', 'Today 11:02']}
        explanation="We could not match it to one order safely, so nothing was guessed."
        action={<Button variant="primary" onClick={onReview}>Look at it</Button>} renderLink={link}
        also={[{ count: 2, label: 'orders to collect today', href: '/orders?today' }, { count: 1, label: 'refund to approve', href: '/refunds' }]} />
      <DayGroup title="Today" aside="KES 16,500">
        {receipts.map((r) => (
          <ReceiptRow key={r.id} name={r.name} amount={r.amount} currency="KES" meta={r.meta} code={r.code} codeLabel="M-Pesa"
            status={r.toConfirm ? <TintChip>To confirm</TintChip> : undefined} fresh={fresh.has(r.id)} />
        ))}
      </DayGroup>
      <DayCloseCard date="3 Nov" message="Today: KES 16,500 in from 2 payments, 1 to confirm."
        lines={[{ label: 'In today', value: 'KES 16,500' }, { label: 'To confirm', value: '1' }, { label: 'Need a person', value: 'Nothing' }]} />
    </>
  )
}

export function ListExample({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <>
      <CountHero count={5} caption="of 17 bays free today" chip="Next: Grace at 15:00" progress={{ done: 3, total: 7, label: '3 of 7 done' }} />
      <RowGroup title="Branches">
        <TapRow href="/branches/1" renderLink={link} leading={<InitialsTile name="Westlands" filled={0.6} />} title="Westlands" meta={['12 of 20 booked', 'Open until 21:00']} figure={<MoneyFigure amount={84000} currency="KES" size={17} />} />
        <TapRow onClick={() => onOpen('2')} title="Karen" sub="Nothing booked yet" glow />
      </RowGroup>
      <DayGroup title="Collecting today">
        <PersonCard name="Lucy Njeri" sub="Order 18 · 14:30" figure={<TintChip tone="pos">Paid</TintChip>} chips={<TintChip>Details missing</TintChip>}
          action={<Button variant="quiet">Hand over</Button>} onOpen={() => onOpen('lucy')} />
      </DayGroup>
      <CaredEmpty image={hakiWaving} title="Your first order lands here">Orders from the shop and the counter appear the moment they are paid.</CaredEmpty>
    </>
  )
}

export function SettingsExample({ onCancel }: { onCancel: () => void }) {
  const [brief, setBrief] = useState(true)
  const [at, setAt] = useState('07:00')
  return (
    <>
      <ProfileHero name="Marvin Muriuki" detail="marvin@example.com" role="Manager, Owner" />
      <SettingsList title="Before collection" action={<Button variant="quiet">Change</Button>}>
        <SettingsItem label="Orders are paid before collection" value="Required" />
      </SettingsList>
      <SettingsList title="Notifications">
        <SwitchRow label="Morning brief" hint="What today holds, on WhatsApp." checked={brief} onChange={setBrief} />
        {brief && <TimeRow label="Arrives at" value={at} onChange={setAt} />}
      </SettingsList>
      <ReceiptCard title="Order 18" aside={<CodeChip label="Ref" value="SO2600134" />}
        lines={[{ label: 'Service', value: <MoneyFigure amount={12000} currency="KES" size={17} /> }]}
        totals={[{ label: 'Total', value: <MoneyFigure amount={12000} currency="KES" size={17} /> }, { label: 'Left to pay', value: 'Nothing' }]} />
      <DoneNote title="Confirmed: Nyokabi, 2 Nov" action={<ButtonLink variant="secondary" href={whatsAppLink('0712000000', 'Your order is confirmed.')}>Send on WhatsApp</ButtonLink>}>
        Emailed to Nyokabi.
      </DoneNote>
      <DangerAction icon={Trash2} onClick={onCancel}>Cancel this order</DangerAction>
    </>
  )
}
