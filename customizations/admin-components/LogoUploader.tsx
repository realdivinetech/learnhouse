'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, AlertCircle, Check } from 'lucide-react'
import Image from 'next/image'

interface LogoUploaderProps {
  orgId: string
  currentLogo: string
  currentFavicon: string
  onLogosChange: (logo: string, favicon: string) => void
}

export function LogoUploader({
  orgId,
  currentLogo,
  currentFavicon,
  onLogosChange,
}: LogoUploaderProps) {
  const [logoLoading, setLogoLoading] = useState(false)
  const [faviconLoading, setFaviconLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Logo must be an image file (PNG, SVG, JPG)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Logo file must be less than 5MB')
      return
    }

    setLogoLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/v1/orgs/${orgId}/logo`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload logo')

      const data = await response.json()
      const logoUrl = data.logo_url || `/custom-assets/${file.name}`

      onLogosChange(logoUrl, currentFavicon)
      setSuccess('Logo uploaded successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo')
    } finally {
      setLogoLoading(false)
    }
  }

  const handleFaviconUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Favicon must be an image file (PNG, SVG, ICO)')
      return
    }

    if (file.size > 1 * 1024 * 1024) {
      setError('Favicon file must be less than 1MB')
      return
    }

    setFaviconLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/v1/orgs/${orgId}/favicon`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload favicon')

      const data = await response.json()
      const faviconUrl = data.favicon_url || `/custom-assets/${file.name}`

      onLogosChange(currentLogo, faviconUrl)
      setSuccess('Favicon uploaded successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload favicon')
    } finally {
      setFaviconLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleLogoUpload(file)
  }

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFaviconUpload(file)
  }

  return (
    <div className="space-y-4">
      {success && (
        <Alert className="border-green-500 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization Logo</CardTitle>
            <CardDescription>
              Used in headers and navigation (recommended: 200x50px)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Preview */}
            {currentLogo && (
              <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center h-32">
                <img
                  src={currentLogo}
                  alt="Current Logo"
                  className="max-h-28 max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer transition-colors"
              onClick={() => logoInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, SVG, JPG (max 5MB)</p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>

            {/* Current Logo URL */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Logo URL (if not uploading)
              </label>
              <Input
                type="text"
                defaultValue={currentLogo}
                placeholder="/custom-assets/logo.svg"
                readOnly
                className="text-xs"
              />
            </div>

            <Button
              onClick={() => logoInputRef.current?.click()}
              disabled={logoLoading}
              className="w-full"
            >
              {logoLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {logoLoading ? 'Uploading Logo...' : 'Choose Logo'}
            </Button>
          </CardContent>
        </Card>

        {/* Favicon Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Favicon</CardTitle>
            <CardDescription>
              Browser tab icon (recommended: 32x32px or SVG)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Favicon Preview */}
            {currentFavicon && (
              <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center h-32">
                <div className="flex items-center gap-4">
                  <img
                    src={currentFavicon}
                    alt="Current Favicon"
                    className="h-16 w-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div>
                    <p className="text-xs text-gray-600">Favicon Preview</p>
                    <p className="text-xs font-mono text-gray-500 truncate max-w-xs">
                      {currentFavicon}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer transition-colors"
              onClick={() => faviconInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, SVG, ICO (max 1MB)</p>
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*"
                onChange={handleFaviconChange}
                className="hidden"
              />
            </div>

            {/* Current Favicon URL */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Favicon URL (if not uploading)
              </label>
              <Input
                type="text"
                defaultValue={currentFavicon}
                placeholder="/custom-assets/favicon.svg"
                readOnly
                className="text-xs"
              />
            </div>

            <Button
              onClick={() => faviconInputRef.current?.click()}
              disabled={faviconLoading}
              className="w-full"
            >
              {faviconLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {faviconLoading ? 'Uploading Favicon...' : 'Choose Favicon'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upload Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-blue-900">
            <p>
              <strong>Logo Tips:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Use transparent PNG or SVG for best results</li>
              <li>Dimensions: 200x50px or similar aspect ratio</li>
              <li>Will scale responsively on mobile devices</li>
            </ul>
            <p className="mt-3">
              <strong>Favicon Tips:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Use PNG, SVG, or ICO format</li>
              <li>Dimensions: 32x32px or larger square</li>
              <li>Will appear in browser tabs and bookmarks</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
