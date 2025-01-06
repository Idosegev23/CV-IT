"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export interface ThemeProviderProps {
 children: React.ReactNode;
 defaultTheme?: string;
 storageKey?: string;
 enableSystem?: boolean;
 disableTransitionOnChange?: boolean;
 forcedTheme?: string;
 themes?: string[];
 attribute?: 'class' | 'data-theme';
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
 return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}