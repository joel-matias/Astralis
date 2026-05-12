'use client'

import { useState, useRef, useEffect } from 'react'

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

interface Feature {
    id: string
    place_name: string
    text: string
}

interface Props {
    name?: string
    defaultValue?: string
    value?: string
    onChange?: (value: string) => void
    onSelect?: (value: string) => void
    placeholder?: string
    required?: boolean
    className?: string
}

export function CityInput({ name, defaultValue, value, onChange, onSelect, placeholder, required, className }: Props) {
    const [inputValue, setInputValue] = useState(value ?? defaultValue ?? '')
    const [suggestions, setSuggestions] = useState<Feature[]>([])
    const [open, setOpen] = useState(false)
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (value !== undefined) setInputValue(value)
    }, [value])

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [])

    function updateDropdownPosition() {
        if (!inputRef.current) return
        const rect = inputRef.current.getBoundingClientRect()
        setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
        })
    }

    function fetchSuggestions(query: string) {
        if (timerRef.current) clearTimeout(timerRef.current)
        if (query.length < 2 || !token) { setSuggestions([]); return }

        timerRef.current = setTimeout(async () => {
            try {
                const q = encodeURIComponent(query)
                const res = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?country=mx&types=place&language=es&limit=5&access_token=${token}`
                )
                const data = await res.json()
                setSuggestions(data.features ?? [])
                updateDropdownPosition()
                setOpen(true)
            } catch {
                setSuggestions([])
            }
        }, 300)
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const v = e.target.value
        setInputValue(v)
        onChange?.(v)
        fetchSuggestions(v)
    }

    function handleSelect(feature: Feature) {
        const cityState = feature.place_name
            .replace(/, Mexico$/, '')
            .replace(/, México$/, '')
        setInputValue(cityState)
        onChange?.(cityState)
        onSelect?.(cityState)
        setSuggestions([])
        setOpen(false)
    }

    const stateHint = (feature: Feature) =>
        feature.place_name
            .replace(feature.text, '')
            .replace(/^,\s*/, '')
            .replace(/, Mexico$/, '')
            .replace(/, México$/, '')

    return (
        <div ref={containerRef} className="relative">
            <input
                ref={inputRef}
                name={name}
                value={inputValue}
                onChange={handleChange}
                onFocus={() => { if (suggestions.length > 0) { updateDropdownPosition(); setOpen(true) } }}
                placeholder={placeholder}
                required={required}
                className={className}
                autoComplete="off"
            />
            {open && suggestions.length > 0 && (
                <ul style={dropdownStyle} className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-lg overflow-hidden">
                    {suggestions.map(f => (
                        <li key={f.id}>
                            <button
                                type="button"
                                onMouseDown={() => handleSelect(f)}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-container-low transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm text-outline">location_on</span>
                                <span>
                                    <span className="font-medium text-on-surface">{f.text}</span>
                                    {stateHint(f) && (
                                        <span className="text-outline ml-1 text-xs">{stateHint(f)}</span>
                                    )}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
