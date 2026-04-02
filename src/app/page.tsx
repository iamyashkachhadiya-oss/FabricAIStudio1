'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    // If no Supabase configured (placeholder), go to demo
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      router.replace('/demo')
      return
    }

    // Otherwise try auth check
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace('/dashboard')
        } else {
          router.replace('/auth')
        }
      }).catch(() => {
        router.replace('/demo')
      })
    }).catch(() => {
      router.replace('/demo')
    })
  }, [router])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(145deg, #1B1F3B, #2A2F52)',
          margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(27,31,59,0.3)',
        }}>
          <span style={{ color: 'white', fontSize: 24, fontWeight: 700, fontFamily: 'serif' }}>ƒ</span>
        </div>
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Loading FabricAI Studio…</p>
      </div>
    </div>
  )
}
