'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard route error:', error)
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold">Ocorreu um erro na Dashboard</h2>
        <p className="text-sm text-muted-foreground">Tente recarregar a página. Se persistir, faça logout e login novamente.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => reset()}>Tentar novamente</Button>
        </div>
      </div>
    </div>
  )
}
