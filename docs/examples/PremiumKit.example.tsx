/**
 * Example: a "Money in" phone screen and a settings screen built only from the premium patterns
 * (docs/PREMIUM_PATTERNS.md). Figures are sample values; real screens compute every number from loaded data.
 */
import {
  Button, CaredEmpty, HubCard, CodeChip, CountHero, DangerAction, DayCloseCard, DayGroup, DoneNote, Greeting, MoneyFigure, MoneyHero,
  NeedsYouCard, PersonCard, ProfileHero, ReceiptCard, ReceiptRow, RowGroup, SelectableRow, SettingsItem, SettingsList, SwitchRow, TapRow,
  TimeRow, TintChip, InitialsTile, formatMoney, useArrivals, whatsAppLink, ButtonLink,
} from '@blackpaw/ui'
import { Link } from 'react-router-dom'
import { Trash2, Wallet, ClipboardList } from 'lucide-react'
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

/** A detail screen names its record in the hero; a list that can be picked uses SelectableRow (pick vs open). */
export function OrdersExample({ onSend }: { onSend: (ids: number[]) => void }) {
  const orders = [
    { id: 18, customer: 'Lucy Njeri', name: 'SO2600134', items: '3 items', total: 15000, owed: 5000 },
    { id: 19, customer: 'Peter Kamau', name: 'SO2600135', items: '1 item', total: 4200, owed: 0 },
  ]
  const [picked, setPicked] = useState<number[]>([])
  const toggle = (id: number, on: boolean) => setPicked((p) => (on ? [...p, id] : p.filter((x) => x !== id)))
  return (
    <>
      <MoneyHero title="Order SO2600134" amount={5000} currency="KES" caption="still to pay of KES 15,000" />
      <RowGroup title={picked.length ? `${picked.length} of 2 orders picked` : '2 orders'}>
        {orders.map((o) => (
          <SelectableRow key={o.id} selected={picked.includes(o.id)} onSelectedChange={(on) => toggle(o.id, on)}
            href={`/orders/${o.id}`} renderLink={link} title={o.customer} meta={[o.name, o.items]}
            sub={o.owed ? `${formatMoney(o.owed)} owed` : 'Paid'} figure={<MoneyFigure amount={o.total} size={17} />} />
        ))}
      </RowGroup>
      {picked.length > 0 && <Button variant="primary" onClick={() => onSend(picked)}>Send {picked.length} to the supplier</Button>}
    </>
  )
}

/** A hub page: one HubCard per screen; a card with work waiting glows and says "2 need you". Lists use chips and empty. */
export function HubExample({ requests }: { requests: { id: number; customer: string; part: string; urgent: boolean }[] }) {
  return (
    <>
      <div style={{ display: 'grid', gap: 16 }}>
        <HubCard href="/payments" renderLink={link} icon={Wallet} title="Payments" line="Money in, money owed" figure="KES 16,500 to collect" />
        <HubCard href="/requests" renderLink={link} icon={ClipboardList} title="Part requests" line="Website and walk-in requests" waiting={requests.length} />
      </div>
      <RowGroup title="Open requests" aside={requests.length}
        empty={<CaredEmpty image={hakiWaving} title="Website requests land here">A request shows the moment a customer sends it.</CaredEmpty>}>
        {requests.map((r) => (
          <TapRow key={r.id} href={`/requests/${r.id}`} renderLink={link} title={r.customer} meta={[r.part]}
            chips={r.urgent ? [<TintChip key="u">Urgent</TintChip>] : undefined} />
        ))}
      </RowGroup>
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
