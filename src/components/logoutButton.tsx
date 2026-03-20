'use client';

import { logoutUser } from '@/app/users/actions';
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await logoutUser();
      }}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-red-100 bg-transparent"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" height="18" 
        viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="2" 
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </svg>
      Logout
    </Button>
  );
}