'use client'

import { usePathname } from 'next/navigation'
import AdminNav from './AdminNav'
import SignOutButton from '@/components/host/SignOutButton'
import React from 'react'

interface AdminLayoutWrapperProps {
  children: React.ReactNode
  isAdmin: boolean
  userEmail: string
  displayRole: string
}

export default function AdminLayoutWrapper({ children, isAdmin, userEmail, displayRole }: AdminLayoutWrapperProps) {
  const pathname = usePathname()
  
  // List of auth pages that should NOT have the admin navigation and identity badge
  const isAuthPage = ['/admin/login', '/admin/setup-account', '/admin/forgot-password', '/admin/update-password'].includes(pathname)

  if (isAuthPage) {
    return (
      <div className="relative w-full">
        <div className="relative z-0">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* Top right flex container for the sign out button and identity badge */}
      <div className="absolute top-0 left-0 right-0 w-full flex justify-end items-start gap-3 p-6 md:p-8 z-50 pointer-events-none">
        {userEmail && (
          <div className="pointer-events-auto bg-gray-100 text-xs px-3 py-1.5 rounded-full flex flex-col text-right shadow-sm border border-gray-200">
            <span className="font-bold text-gray-900">{userEmail}</span>
            <span className="text-gray-500 uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>{displayRole}</span>
          </div>
        )}
        <div className="pointer-events-auto">
          <SignOutButton />
        </div>
      </div>
      
      <div className="w-full bg-zinc-50 pt-24 pb-0 z-10 relative">
        <div className="max-w-7xl mx-auto px-4">
          <AdminNav isAdmin={isAdmin} />
        </div>
      </div>
      
      <div className="-mt-24 relative z-0">
        {children}
      </div>
    </div>
  )
}
