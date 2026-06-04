'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import { ColorCustomizer } from './ColorCustomizer'
import { LogoUploader } from './LogoUploader'

interface BrandingConfig {
  siteName: string
  siteDescription: string
  contactEmail: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  footerText: string
  footerLinks: Array<{ label: string; url: string }>
  favicon: string
  logo: string
  ogImage: string
}

interface BrandingSettingsProps {
  orgId: string
  onSave?: (config: BrandingConfig) => void
}

export function BrandingSettings({ orgId, onSave }: BrandingSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('general')

  const [config, setConfig] = useState<BrandingConfig>({
    siteName: 'DigitalBridge Learn',
    siteDescription: 'DigitalBridge - Hybrid Learning Platform',
    contactEmail: 'support@digitalbridge.ng',
    primaryColor: '#ee6c4d',
    secondaryColor: '#374151',
    accentColor: '#10B981',
    footerText: '© 2026 DigitalBridge. All rights reserved.',
    footerLinks: [
      { label: 'About', url: 'https://digitalbridge.ng/about' },
      { label: 'Privacy', url: 'https://digitalbridge.ng/privacy' },
      { label: 'Terms', url: 'https://digitalbridge.ng/terms' },
      { label: 'Contact', url: 'https://digitalbridge.ng/contact' },
    ],
    favicon: '/custom-assets/favicon.svg',
    logo: '/custom-assets/logo.svg',
    ogImage: '/custom-assets/og-image.png',
  })

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Update SEO config
      await fetch(`/api/v1/orgs/${orgId}/config/seo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: config.siteName,
          description: config.siteDescription,
          og_image_url: config.ogImage,
        }),
      })

      // Update color config
      await fetch(`/api/v1/orgs/${orgId}/config/color`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_color: config.primaryColor,
          secondary_color: config.secondaryColor,
          accent_color: config.accentColor,
        }),
      })

      // Update footer config
      await fetch(`/api/v1/orgs/${orgId}/config/footer-text`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          footer_text: config.footerText,
          footer_links: config.footerLinks,
        }),
      })

      // Update auth branding
      await fetch(`/api/v1/orgs/${orgId}/config/auth-branding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo_url: config.logo,
          favicon_url: config.favicon,
          primary_color: config.primaryColor,
        }),
      })

      setSuccess(true)
      onSave?.(config)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save branding configuration. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>DigitalBridge Branding Customization</CardTitle>
          <CardDescription>
            Manage how DigitalBridge appears across the LearnHouse platform. Changes apply
            instantly to your organization.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success && (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Branding configuration saved successfully!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <Input
                  type="text"
                  value={config.siteName}
                  onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                  placeholder="DigitalBridge Learn"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Shown in browser title and page headers
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <Textarea
                  value={config.siteDescription}
                  onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                  placeholder="DigitalBridge - Hybrid Learning Platform"
                  className="h-24"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used in search engine results and social media previews
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                  placeholder="support@digitalbridge.ng"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Displayed in footer and contact information
                </p>
              </div>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-4">
              <ColorCustomizer
                colors={{
                  primary: config.primaryColor,
                  secondary: config.secondaryColor,
                  accent: config.accentColor,
                }}
                onChange={(colors) =>
                  setConfig({
                    ...config,
                    primaryColor: colors.primary,
                    secondaryColor: colors.secondary,
                    accentColor: colors.accent,
                  })
                }
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                <strong>Tip:</strong> Colors are applied to navigation, buttons, links, and
                interactive elements. Use high-contrast colors for better accessibility.
              </div>
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="space-y-4">
              <LogoUploader
                orgId={orgId}
                currentLogo={config.logo}
                currentFavicon={config.favicon}
                onLogosChange={(logo, favicon) =>
                  setConfig({ ...config, logo, favicon })
                }
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Image URL
                </label>
                <Input
                  type="text"
                  value={config.ogImage}
                  onChange={(e) => setConfig({ ...config, ogImage: e.target.value })}
                  placeholder="/custom-assets/og-image.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Preview image for social media shares (1200x630px recommended)
                </p>
              </div>
            </TabsContent>

            {/* Footer Tab */}
            <TabsContent value="footer" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footer Text
                </label>
                <Textarea
                  value={config.footerText}
                  onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                  placeholder="© 2026 DigitalBridge. All rights reserved."
                  className="h-24"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Displayed at the bottom of every page
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footer Links
                </label>
                <div className="space-y-2">
                  {config.footerLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const updated = [...config.footerLinks]
                          updated[idx] = { ...link, label: e.target.value }
                          setConfig({ ...config, footerLinks: updated })
                        }}
                        placeholder="Link label"
                        className="w-1/3"
                      />
                      <Input
                        type="text"
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...config.footerLinks]
                          updated[idx] = { ...link, url: e.target.value }
                          setConfig({ ...config, footerLinks: updated })
                        }}
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const updated = config.footerLinks.filter((_, i) => i !== idx)
                          setConfig({ ...config, footerLinks: updated })
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setConfig({
                      ...config,
                      footerLinks: [...config.footerLinks, { label: '', url: '' }],
                    })
                  }}
                >
                  Add Link
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex gap-2 mt-6">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-db-primary hover:bg-db-secondary"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Saving...' : 'Save Branding'}
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>How your branding will appear to users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header Preview */}
            <div
              className="p-4 rounded-lg text-white"
              style={{ background: `linear-gradient(to right, ${config.primaryColor}, ${config.secondaryColor})` }}
            >
              <img src={config.logo} alt="Logo" className="h-8 mb-2" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }} />
              <h3 className="font-bold">{config.siteName}</h3>
              <p className="text-sm opacity-90">{config.siteDescription}</p>
            </div>

            {/* Buttons Preview */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Buttons & Controls</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: config.secondaryColor }}
                >
                  Secondary Button
                </button>
                <button
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: config.accentColor }}
                >
                  Accent Button
                </button>
              </div>
            </div>

            {/* Footer Preview */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 text-center">{config.footerText}</p>
              <div className="flex justify-center gap-4 mt-2 flex-wrap">
                {config.footerLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    className="text-xs underline"
                    style={{ color: config.primaryColor }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
