# JUNTO Settings Pages Specification

## Overview

This document outlines the simplified settings structure for JUNTO's sports event coordination platform. The settings have been streamlined to 3 focused pages for optimal user experience.

## Design Principles

- **Sports-Focused**: Settings tailored specifically for sports coordination
- **Simple & Clear**: Essential features only, no unnecessary complexity
- **User-Friendly**: Intuitive organization and minimal cognitive load
- **Privacy-Aware**: Clear controls for safety and visibility

## Settings Structure

### Navigation Order
1. **Profile & Sports** - Who you are as a player
2. **Notifications** - How you want to be contacted
3. **Account & Privacy** - Account management and safety

---

## 1. Profile & Sports Page

**Purpose**: Your sports identity and public information

### Fields

#### Basic Profile
- **Name**: Display name (how others see you)
- **Bio**: Short description about yourself as a player
- **Photo**: Profile picture upload

#### Sports Information
- **Sports Played**: Multi-select from available sports
  - Basketball
  - Tennis
  - Pickleball
  - Volleyball
  - Soccer
  - Climbing
- **Proficiency** (optional): Skill level for each sport
  - Learning
  - Casual
  - Intermediate
  - Advanced
  - Pro

#### Social Links
- **Instagram**: Sports-related social media
- **Other**: Additional social/fitness profiles


---

## 2. Notifications Page

**Purpose**: Control how and when you receive notifications

### Fields

#### Notification Medium
- **Text**: SMS notifications
- **Email**: Email notifications  
- **Both**: Receive via both text and email

#### Notification Types
- **Marketing**: Promotional emails and updates
- **Invites**: Game invitations and event requests
- **Event Reminders**: Upcoming game reminders
- **Messages**: Event chat and communication

#### Calendar Integration
- **Link Calendar**: Connect to Google Calendar, Apple Calendar, etc.



---

## 3. Account & Privacy Page

**Purpose**: Account management and privacy controls

### Fields

#### Account Management
- **Reset Email**: Send password reset to email
- **Change Password**: Update account password
- **Change Email/Phone**: Update contact information
- **Age**: Date of birth for age verification

#### Privacy & Safety
- **Public/Private Profile**: Control who can see your profile
- **Verification**: Account verification status
- **Blocked Users**: Manage blocked user list



## Design & Component Preservation

### Maintain Existing Architecture
- **Keep Current Navigation**: Use existing SidebarNav component and routing structure
- **Preserve Layout Pattern**: Maintain the Card → CardContent → Form structure
- **Use Existing Components**: Leverage current Button, Input, Textarea, Select, Switch components
- **Keep Form Handling**: Continue using React Hook Form + Zod validation approach
- **Maintain Styling**: Use existing CSS classes and theme system

### Modification Approach
- **Extend, Don't Replace**: Add new fields to existing forms rather than rebuilding
- **Update Content Only**: Change form labels, placeholders, and options while keeping structure
- **Preserve Page Structure**: Keep the same page layout and navigation patterns
- **Maintain Responsiveness**: Ensure all changes work with existing mobile/desktop layouts
- **Use Existing Patterns**: Follow current toast notification and error handling patterns

### Component Reuse Strategy
- **Settings Layout**: Keep existing settings page wrapper and sidebar navigation
- **Form Components**: Use current FormField, FormItem, FormLabel, FormControl components
- **Buttons & Actions**: Maintain existing button styles and action patterns
- **Cards & Sections**: Use current Card components for section organization
- **Validation**: Extend existing Zod schemas rather than creating new ones

## Notes

- **Minimize Breaking Changes**: Work within existing settings page structure and navigation
- **Component Consistency**: Use established design system components throughout
- **Form Pattern Adherence**: Maintain React Hook Form + Zod validation patterns
- **Style Preservation**: Keep current theming and responsive design approach
- **Route Compatibility**: Ensure all changes work with existing routing structure
- **Progressive Enhancement**: Add JUNTO-specific features while preserving core functionality
- **Design System Compliance**: Follow existing component usage patterns and styling conventions 