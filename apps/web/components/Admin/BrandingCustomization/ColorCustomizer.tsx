'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Pipette } from 'lucide-react'

const PRESET_PALETTES = [
  {
    name: 'DigitalBridge (Default)',
    colors: { primary: '#4F46E5', secondary: '#EC4899', accent: '#10B981' },
  },
  {
    name: 'Professional Blue',
    colors: { primary: '#0066CC', secondary: '#003D99', accent: '#00B4D8' },
  },
  {
    name: 'Modern Purple',
    colors: { primary: '#7C3AED', secondary: '#D946EF', accent: '#06B6D4' },
  },
  {
    name: 'Vibrant Orange',
    colors: { primary: '#EA580C', secondary: '#F97316', accent: '#FBBF24' },
  },
  {
    name: 'Teal Green',
    colors: { primary: '#0D9488', secondary: '#14B8A6', accent: '#2DD4BF' },
  },
  {
    name: 'Deep Red',
    colors: { primary: '#DC2626', secondary: '#EF4444', accent: '#FB7185' },
  },
]

interface ColorCustomizerProps {
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  onChange: (colors: { primary: string; secondary: string; accent: string }) => void
}

export function ColorCustomizer({ colors, onChange }: ColorCustomizerProps) {
  const [showPalettes, setShowPalettes] = useState(false)

  // Hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return { r: 0, g: 0, b: 0 }
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
  }

  // Calculate contrast ratio for accessibility
  const getContrastRatio = (color: string) => {
    const rgb = hexToRgb(color)
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
    return luminance > 0.5 ? 'light' : 'dark'
  }

  const contrastClass = (color: string) => {
    return getContrastRatio(color) === 'light'
      ? 'text-gray-900'
      : 'text-white'
  }

  return (
    <div className="space-y-4">
      {/* Color Inputs */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="color"
                value={colors.primary}
                onChange={(e) => onChange({ ...colors, primary: e.target.value })}
                className="h-10 w-full cursor-pointer"
              />
            </div>
            <Input
              type="text"
              value={colors.primary}
              onChange={(e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  onChange({ ...colors, primary: e.target.value })
                }
              }}
              placeholder="#000000"
              className="font-mono text-sm w-24"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Color
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="color"
                value={colors.secondary}
                onChange={(e) => onChange({ ...colors, secondary: e.target.value })}
                className="h-10 w-full cursor-pointer"
              />
            </div>
            <Input
              type="text"
              value={colors.secondary}
              onChange={(e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  onChange({ ...colors, secondary: e.target.value })
                }
              }}
              placeholder="#000000"
              className="font-mono text-sm w-24"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accent Color
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="color"
                value={colors.accent}
                onChange={(e) => onChange({ ...colors, accent: e.target.value })}
                className="h-10 w-full cursor-pointer"
              />
            </div>
            <Input
              type="text"
              value={colors.accent}
              onChange={(e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  onChange({ ...colors, accent: e.target.value })
                }
              }}
              placeholder="#000000"
              className="font-mono text-sm w-24"
            />
          </div>
        </div>
      </div>

      {/* Preset Palettes */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">Preset Palettes</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPalettes(!showPalettes)}
            className="text-xs"
          >
            {showPalettes ? 'Hide' : 'Show'} Presets
          </Button>
        </div>

        {showPalettes && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PRESET_PALETTES.map((palette) => (
              <button
                key={palette.name}
                onClick={() => onChange(palette.colors)}
                className="text-left hover:shadow-md transition-shadow"
              >
                <div className="rounded-lg overflow-hidden border border-gray-200 h-24">
                  <div className="flex h-full">
                    <div
                      className="flex-1"
                      style={{ backgroundColor: palette.colors.primary }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: palette.colors.secondary }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: palette.colors.accent }}
                    />
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-700 mt-1 truncate">
                  {palette.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color Swatches & Preview */}
      <div className="border-t pt-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Preview</h4>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Primary', color: colors.primary },
            { label: 'Secondary', color: colors.secondary },
            { label: 'Accent', color: colors.accent },
          ].map(({ label, color }) => (
            <div
              key={label}
              className={`p-3 rounded-lg text-center text-sm font-medium transition-colors ${contrastClass(
                color
              )}`}
              style={{ backgroundColor: color }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Accessibility Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-900">
            <strong>Accessibility Tip:</strong> Use colors with high contrast ratios for better
            readability. Primary colors appear on backgrounds, so ensure text remains legible.
          </p>
        </div>
      </div>

      {/* Gradient Preview */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Gradient Preview</p>
        <div
          className="w-full h-16 rounded-lg shadow-sm"
          style={{
            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
          }}
        />
        <p className="text-xs text-gray-500 mt-2">
          This gradient will be used in headers and hero sections
        </p>
      </div>
    </div>
  )
}
