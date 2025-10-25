'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [status, setStatus] = useState('Testing...')
  const [images, setImages] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        setStatus('Testing Supabase connection...')
        
        // Test basic connection
        const { data, error } = await supabase
          .from('images')
          .select('id, title, image_url')
          .limit(3)

        if (error) {
          throw error
        }

        setImages(data || [])
        setStatus('Connection successful!')
        setError(null)
      } catch (err: any) {
        console.error('Connection test failed:', err)
        setError(err.message || 'Unknown error')
        setStatus('Connection failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="mb-4">
        <p className="text-lg">Status: <span className={status.includes('successful') ? 'text-green-600' : status.includes('failed') ? 'text-red-600' : 'text-yellow-600'}>{status}</span></p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Retrieved Images:</h3>
          <ul className="space-y-2">
            {images.map((image) => (
              <li key={image.id} className="p-2 bg-gray-100 rounded">
                <strong>{image.title}</strong> - {image.id}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Environment Variables:</h3>
        <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not set'}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'}</p>
      </div>
    </div>
  )
}