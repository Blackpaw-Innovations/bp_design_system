/**
 * Example: the Olympus kit page (Wave 0b). Every component, in light and dark side by side.
 * bp_projects mounts this as its kit page. Figures and names are the renders' sample values.
 *
 * Images are the renders' local stand-ins (olympus-renders/renders/img, craft); pass the app's own.
 * The page column is a stacking context (`isolation: isolate`) so the header's band sits behind it.
 */
import {
  AppTile, Bar, Callout, Card, CardTitle, Chip, FilterPills, Hero, HermesMark, Mast, NeedsYou, OlAvatar, Pills, Ring, Row,
} from '@blackpaw/ui'
import { useState } from 'react'

export interface KitAssets { craft: string; heroCraft: string; photo: string; tiles: string[] }

const tabs = [{ id: 'week', label: 'This week' }, { id: 'people', label: 'People' }, { id: 'history', label: 'History' }]
const filters = [{ id: 'all', label: 'All' }, { id: 'mine', label: 'Mine' }, { id: 'waiting', label: 'Waiting' }]
const apps = ['Athena', 'Argus', 'Apollo', 'Gym']

function Kit({ mode, assets }: { mode: 'lt' | 'dk'; assets: KitAssets }) {
  const [tab, setTab] = useState('week')
  const [filter, setFilter] = useState('all')
  return (
    <div className={mode} style={{ background: 'var(--ol-field)', color: 'var(--ol-ink)', padding: '90px 40px 40px 40px', isolation: 'isolate', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'var(--bp-font-ui)' }}>
      <Mast seed="F37TeamBoard" craft={assets.craft} title="Team" strong="board" sub="This week by person. Taller cards take more hours."        right={<HermesMark needsYou />}
        kpis={[
          { value: <>121<small>/140</small></>, label: 'hours booked' },
          { value: '9 h', label: 'free with Adrian' },
          { value: '2 h', label: 'over with Carlton Mark', note: '-move one task' },
          { value: '3', label: 'tasks with Hermes', note: '1 waits for you' },
        ]} />
      <Pills label="Team board views" items={tabs} value={tab} onChange={setTab} />

      <Hero craft={assets.heroCraft} kicker="Tuesday 10 November" title={<>Good morning, Marvin.<br /></>} strong="Five things need you."
        figures={[{ value: '5', label: 'need you' }, { value: '36', label: 'points today' }]}
        actions={<><button type="button">Start with the design audit</button><button type="button">See my day</button></>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22 }}>
        <Card interactive aria-label="Needs you">
          <CardTitle>Needs you</CardTitle>
          <Row left={<OlAvatar name="Marvin Muriuki" />} title="Designs to audit" detail="Athena 2.7 adds new screens" right={<Chip tone="warn">2 open</Chip>} />
          <Row selected left={<OlAvatar name="Adrian" />} title="App name to approve" detail="A new repo looks like an app" right={<Chip tone="info">Doing</Chip>} />
          <Row left={<Ring value={2} total={4} size={34} stroke={3} label="2/4" color="var(--ol-accent)" />} title="Ideas to review" detail="The work carries on meanwhile" />
        </Card>
        <Card selected aria-label="Selected card">
          <span className="ol-kick">Locked</span>
          <span className="ol-hl">The inverted card</span>
          <p className="ol-stand">Night card on light pages, light card on dark. Every child's text inverts.</p>
          <span className="ol-byl">By Hermes · 2 min read</span>
          <Chip tone="ok">Ready</Chip>
        </Card>
        <Card aria-label="Type and progress">
          <span className="ol-key">Week · 14/20 h</span>
          <Bar value={14} total={20} tone="ok" label="Week booked" />
          <span className="ol-hl ol-hl-s">A smaller headline</span>
          <span className="ol-med">Medium line</span>
          <span className="ol-light">Light line, the secondary text.</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Chip>Neutral</Chip><Chip tone="ok">ok</Chip><Chip tone="warn">warn</Chip><Chip tone="bad">bad</Chip><Chip tone="info">info</Chip>
          </div>
          <FilterPills label="Filter" items={filters} value={filter} onChange={setFilter} />
        </Card>
      </div>

      <Callout title="This one is yours to decide">New features on a live app go to the owner of that kind of work. Nothing waits on you meanwhile.</Callout>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, padding: 8 }}>
        {apps.map((name, i) => {
          const tile = <AppTile key={name} name={name} image={assets.tiles[i % assets.tiles.length]} hovered={i === 0} badge={i === 0 ? 2 : undefined}
            details="Design audit: 2 screens · 2.7 in testing" href="#" />
          return i === 3 ? <NeedsYou key={name}>{tile}</NeedsYou> : tile
        })}
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <OlAvatar name="Marvin Muriuki" size={24} /><OlAvatar name="Adrian" size={34} /><OlAvatar name="Carlton Mark" size={44} />
        <HermesMark /><HermesMark needsYou />
      </div>

      {/* The band bleeds 90 px up behind the top bar; here it gets its own room. */}
      <div style={{ paddingTop: 90, isolation: 'isolate' }}>
        <Mast seed="S08AppPage" photo={assets.photo} title="Athena" strong="app" sub="Photo band: dark scrim in both modes"
          kpis={[{ value: '2.7', label: 'in testing' }, { value: '12', label: 'open tasks', note: '-3 late' }]} />
      </div>
    </div>
  )
}

export function OlympusKitExample({ assets }: { assets: KitAssets }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 1280 }}>
      <Kit mode="lt" assets={assets} />
      <Kit mode="dk" assets={assets} />
    </div>
  )
}
