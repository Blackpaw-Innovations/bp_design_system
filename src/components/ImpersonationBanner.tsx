import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

/**
 * PROPOSED — new component, not yet used by any product. Built to close a
 * P0 gap identified in the brand-system audit: authorized Blackpaw staff
 * will be able to impersonate a PWA tenant user or a Managed Odoo user, and
 * no shared pattern existed for the unmissable "you are not yourself"
 * banner that has to accompany every screen of that session. Land this
 * once, here, before the first product builds its own ad hoc version — the
 * exact failure mode this whole audit found repeated across the org.
 *
 * Deliberately styled off the `.chip.warning` tone (tokens/components.css),
 * not a new color — impersonation is a "pay attention" state, not an error.
 * Fixed to the top of the viewport, above everything else (`z-index: 70`,
 * one above SlideOver's overlay at 60/61) — it must survive every
 * navigation within the impersonated session, not just the page that
 * triggered it.
 */
export interface ImpersonationBannerProps {
  /** The person being viewed as — e.g. "Amina Yusuf". */
  impersonatedName: string
  /** The tenant/organization the impersonated user belongs to, if the
   *  product has that concept (a Managed Odoo instance, a multi-tenant PWA).
   *  Omit for a product with no tenant boundary. */
  tenantName?: string
  /** The staff member doing the impersonating, if worth surfacing alongside
   *  who they're viewing as (audit-log style products may want this). */
  staffName?: string
  onExit: () => void
  /** Defaults to "Exit Impersonation". */
  exitLabel?: ReactNode
  className?: string
}

export function ImpersonationBanner({
  impersonatedName,
  tenantName,
  staffName,
  onExit,
  exitLabel = 'Exit Impersonation',
  className,
}: ImpersonationBannerProps) {
  return (
    <div role="status" className={cn('impersonation-banner', className)}>
      <div className="ib-body">
        <span className="ib-line">
          You are viewing this account as: <strong>{impersonatedName}</strong>
        </span>
        {tenantName && (
          <span className="ib-line ib-tenant">
            Tenant: <strong>{tenantName}</strong>
          </span>
        )}
        {staffName && <span className="ib-staff">as {staffName}</span>}
      </div>
      <button type="button" onClick={onExit} className="ib-exit">
        {exitLabel}
      </button>
    </div>
  )
}
