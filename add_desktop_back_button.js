const fs = require('fs');
const path = require('path');

// 1. Create DesktopBackButton.tsx
const componentPath = path.join(__dirname, 'components', 'ui', 'DesktopBackButton.tsx');
const componentContent = `"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function DesktopBackButton() {
    const router = useRouter()

    return (
        <button
            onClick={(e) => {
                e.preventDefault()
                router.back()
            }}
            className="flex items-center gap-3 px-5 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors rounded-2xl border border-zinc-100 flex-shrink-0 cursor-pointer text-left"
        >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <ArrowLeft className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex flex-col pr-2">
                <span className="text-xs font-bold text-zinc-400 uppercase">Go Back</span>
                <span className="text-base font-semibold text-slate-700/80">Home</span>
            </div>
        </button>
    )
}
`;
fs.writeFileSync(componentPath, componentContent, 'utf8');
console.log('Successfully created DesktopBackButton.tsx');

// 2. Update app/activity/[slug]/page.tsx
const pagePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Add import
if (!pageContent.includes('DesktopBackButton')) {
    pageContent = pageContent.replace(
        `import { MobileBackButton } from "@/components/ui/MobileBackButton"`,
        `import { MobileBackButton } from "@/components/ui/MobileBackButton"\nimport { DesktopBackButton } from "@/components/ui/DesktopBackButton"`
    );
}

// Add component to Desktop Balloons section
const desktopBalloonsRegex = /\{\/\* Quick Info \(Desktop Balloons\) \*\/\}\s*<div className="hidden md:flex flex-wrap gap-4 w-full py-2">/;
const desktopBalloonsReplacement = `{/* Quick Info (Desktop Balloons) */}
                    <div className="hidden md:flex flex-wrap gap-4 w-full py-2">
                        <DesktopBackButton />`;

pageContent = pageContent.replace(desktopBalloonsRegex, desktopBalloonsReplacement);

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Successfully updated page.tsx');
