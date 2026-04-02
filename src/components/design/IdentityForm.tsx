'use client'

import { useDesignStore } from '@/lib/store/designStore'

export default function IdentityForm() {
  const identity = useDesignStore((s) => s.identity)
  const updateIdentity = useDesignStore((s) => s.updateIdentity)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="section-header">Design Identity</div>

      <div>
        <label htmlFor="design-name">Design Name</label>
        <input
          id="design-name"
          type="text"
          value={identity.design_name}
          onChange={(e) => updateIdentity({ design_name: e.target.value })}
          placeholder="e.g. Pattu Dobby, Poly Stripe 24S"
        />
      </div>

      <div>
        <label htmlFor="design-number">Design Number / Style Code</label>
        <input
          id="design-number"
          type="text"
          value={identity.design_number}
          onChange={(e) => updateIdentity({ design_number: e.target.value })}
          placeholder="e.g. SD-2024-001"
        />
      </div>

      <div>
        <label htmlFor="quality-name">Quality Name</label>
        <input
          id="quality-name"
          type="text"
          value={identity.quality_name}
          onChange={(e) => updateIdentity({ quality_name: e.target.value })}
          placeholder="Grade reference for repeat orders"
        />
      </div>

      <div>
        <label htmlFor="customer-ref">Customer / Client Reference</label>
        <input
          id="customer-ref"
          type="text"
          value={identity.customer_ref}
          onChange={(e) => updateIdentity({ customer_ref: e.target.value })}
          placeholder="Buyer name for sampling approval"
        />
      </div>
    </div>
  )
}
