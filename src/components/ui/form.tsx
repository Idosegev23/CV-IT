"use client"

import * as React from "react"
import type { ComponentPropsWithoutRef, ElementRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { Label } from "@/components/theme/ui/label"
import { cn } from "@/lib/utils"

const Form = React.forwardRef<HTMLFormElement, ComponentPropsWithoutRef<"form">>(
  ({ className, ...props }, ref) => (
    <form
      ref={ref}
      className={cn("space-y-8", className)}
      {...props}
    />
  )
)
Form.displayName = "Form"

const FormItem = React.forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
)
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  ElementRef<typeof Label>,
  ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  ElementRef<typeof Slot>,
  ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => (
  <Slot ref={ref} {...props} />
))
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<"p">>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<"p">>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    />
  )
)
FormMessage.displayName = "FormMessage"

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}