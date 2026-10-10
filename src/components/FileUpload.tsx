import { useRef, useState } from 'react'
import { Camera, FileText, Upload } from 'lucide-react'
import { Button } from './Guarded'
import { useIsPhone } from './Overlay'

/**
 * FileUpload (standards §17.19).
 *   - Desktop: a dashed drop zone that is one big button, stating types, size and count limits up front.
 *   - Phone: no drop zone. "Take photo" (rear camera) is the main button; "Choose from gallery" is text.
 *     Document fields say "Scan document" (same camera input).
 *   - Each file is a row: thumbnail or type, name, size, progress, Remove (Cancel while uploading).
 *   - A rejected file stays listed with a crit border and what to do; the others carry on.
 *   - Photos are resized on the device to 2000 px on the long side before upload (`resizeImage`).
 */
export type UploadState = 'queued' | 'uploading' | 'done' | 'error'
export interface UploadItem { id: string; file: File; state: UploadState; progress?: number; error?: string; previewUrl?: string }

export interface FileUploadProps {
  label: string
  /** e.g. ".jpg,.jpeg,.png,.pdf" */
  accept: string
  /** Shown before anyone tries: "JPG, PNG or PDF". */
  typesText: string
  maxMB?: number
  maxFiles?: number
  items: UploadItem[]
  onAdd: (accepted: File[], rejected: { file: File; reason: string }[]) => void
  onRemove: (id: string) => void
  kind?: 'files' | 'photos' | 'documents'
}

const fmtSize = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`)

export function FileUpload({ label, accept, typesText, maxMB = 10, maxFiles = 5, items, onAdd, onRemove, kind = 'files' }: FileUploadProps) {
  const phone = useIsPhone()
  const pick = useRef<HTMLInputElement>(null)
  const cam = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const take = (list: FileList | null) => {
    if (!list) return
    const okTypes = accept.split(',').map((s) => s.trim().toLowerCase())
    const acc: File[] = [], rej: { file: File; reason: string }[] = []
    Array.from(list).forEach((f) => {
      const ext = '.' + (f.name.split('.').pop() ?? '').toLowerCase()
      if (!okTypes.includes(ext) && !okTypes.some((t) => t.endsWith('/*') && f.type.startsWith(t.slice(0, -1)))) rej.push({ file: f, reason: `${ext.slice(1).toUpperCase()} files aren't accepted. Choose ${typesText}.` })
      else if (f.size > maxMB * 1e6 && !f.type.startsWith('image/')) rej.push({ file: f, reason: `Over ${maxMB} MB. Choose a smaller file or take a photo instead.` })
      else if (items.length + acc.length >= maxFiles) rej.push({ file: f, reason: `${maxFiles} files at most. Remove one first.` })
      else acc.push(f)
    })
    onAdd(acc, rej)
  }
  const inputs = (
    <>
      <input ref={pick} type="file" accept={accept} multiple={maxFiles > 1} hidden onChange={(e) => { take(e.target.files); e.target.value = '' }} />
      <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { take(e.target.files); e.target.value = '' }} />
    </>
  )
  return (
    <div className="bp-field">
      <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span>
      {inputs}
      {phone ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Button variant="secondary" size="lg" fullWidth icon={Camera} onClick={() => cam.current?.click()}>{kind === 'documents' ? 'Scan document' : 'Take photo'}</Button>
          <Button variant="tertiary" fullWidth onClick={() => pick.current?.click()}>{kind === 'documents' ? 'Choose a file' : 'Choose from gallery'}</Button>
        </div>
      ) : (
        <button type="button" className="bp-drop" data-over={over || undefined} onClick={() => pick.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files) }}>
          <Upload size={28} aria-hidden="true" style={{ color: 'var(--c-muted)' }} />
          <span>Drop files here or <span style={{ color: 'var(--c-signal-text)', textDecoration: 'underline', textUnderlineOffset: 3 }}>choose files</span></span>
          <span className="bp-help" style={{ fontSize: 15, fontWeight: 600 }}>{typesText}, up to {maxMB} MB each, {maxFiles} files at most</span>
        </button>
      )}
      {items.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((it) => (
            <li key={it.id} className="bp-file" data-error={it.state === 'error' || undefined}>
              <span className="bp-file-thumb" style={it.previewUrl ? { backgroundImage: `url(${it.previewUrl})` } : undefined}>{!it.previewUrl && (it.file.name.split('.').pop()?.toUpperCase() ?? <FileText size={18} />)}</span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}><span style={{ fontSize: 16, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.file.name}</span><span className="bp-help" style={{ whiteSpace: 'nowrap' }}>{fmtSize(it.file.size)}</span></span>
                {it.state === 'uploading' && <span className="bp-progress" style={{ height: 6 }} role="progressbar" aria-valuenow={it.progress ?? 0}><span style={{ width: `${it.progress ?? 0}%` }} /></span>}
                {it.state === 'done' && <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--v-pos)' }}>Uploaded</span>}
                {it.state === 'error' && <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--v-crit)' }}>{it.error}</span>}
              </span>
              <Button variant="tertiary" onClick={() => onRemove(it.id)}>{it.state === 'uploading' ? 'Cancel' : 'Remove'}</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Resize a photo on the device before upload: 2000 px on the long side, JPEG 0.85. */
export async function resizeImage(file: File, longSide = 2000, quality = 0.85): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  const bmp = await createImageBitmap(file)
  const s = Math.min(1, longSide / Math.max(bmp.width, bmp.height))
  if (s === 1 && file.size < 10e6) return file
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), 'image/jpeg', quality))
  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
}
