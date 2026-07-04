# Design System: SAHAYA

## 1. Visual Theme & Atmosphere
Clean, trustworthy, and modern healthcare aesthetic. The atmosphere is warm but authoritative, avoiding the sterile feeling of traditional clinical software. It balances vibrant colors for urgency with generous whitespace and soft surfaces to reduce cognitive load. The feeling is "compassionate efficiency".

## 2. Color Palette & Roles

**Primary Actions & Trust**
- Healing Teal (#0D9488) - Used for primary actions, trust, medical authority, selected states
- Deep Teal (#0F766E) - Used for hover states on primary actions
- Soft Teal Background (#F0FDFA) - Used for highlighted/active card backgrounds

**Urgency & Status**
- Vital Green (#10B981) - Used for healthy status, "Self-Care" triage, success states
- Warm Amber (#F59E0B) - Used for "Visit PHC" triage, moderate warnings, ASHA branding
- Alert Red (#EF4444) - Used for "Visit Hospital" and "Emergency" triage, critical vitals

**Interface & Surfaces**
- Soft Cloud (#F8FAFC) - Used for main app background (body)
- Clean White (#FFFFFF) - Used for cards, modals, elevated surfaces
- Whisper Gray (#E2E8F0) - Used for dividers, subtle card borders, inactive tab indicators

**Typography**
- Deep Slate (#0F172A) - Used for primary text, headings, prominent data
- Muted Slate (#64748B) - Used for secondary text, labels, subtle instructions, timestamps

**Accents**
- Calm Indigo (#6366F1) - Used for AI indicators, doctor dashboard accents, "Video Consultation" triage

## 3. Typography Rules
- Font Family: Inter (or a clean sans-serif like Roboto if Inter is unavailable)
- Display/H1: 700 (Bold) for major page titles and prominent metric numbers (e.g., Vitals)
- H2/H3: 600 (Semi-bold) for card titles and section headers
- Body: 400 (Regular) for main content
- Small/Caption: 500 (Medium) for labels, tags, and secondary metadata with slightly increased letter-spacing

## 4. Component Stylings
* **Buttons:**
  - Primary: Solid Healing Teal (#0D9488) background, white text, 8px border radius (subtly rounded).
  - Secondary/Ghost: Transparent background, Healing Teal text, 8px border radius.
* **Cards/Containers:**
  - Standard Card: Clean White (#FFFFFF) background, 12px border radius, very subtle shadow (0 1px 3px rgba(0,0,0,0.08)), Whisper Gray (#E2E8F0) 1px border.
* **Tags/Badges:**
  - Pill-shaped (fully rounded ends, 9999px), background uses a 10-15% opacity of the brand color (e.g., light green for healthy), text uses the solid brand color.
* **Chips (Selectable):**
  - Unselected: Soft Cloud or White background, Whisper Gray border.
  - Selected: Soft Teal Background (#F0FDFA) with Healing Teal (#0D9488) border and text.

## 5. Layout Principles
- **Spacing:** Generous and consistent. Use 16px or 24px padding within cards. Maintain 16px to 24px gaps between components.
- **Hierarchy:** Data is prioritized visually. Key metrics (like Urgency Level or Heart Rate) are much larger than surrounding text.
- **Alignment:** Clean left alignment for readability, center alignment reserved for empty states or major primary actions.

## 6. Design System Notes for Stitch Generation
**DESIGN SYSTEM (REQUIRED):**
- Platform: Mobile-first for Patient, Tablet for ASHA, Desktop for Doctor
- Theme: Light, clean, trustworthy, warm healthcare vibe
- Background: Soft Cloud (#F8FAFC)
- Surface: Clean White (#FFFFFF) with subtle shadows (0 1px 3px rgba(0,0,0,0.08)) and 12px rounded corners
- Primary Accent: Healing Teal (#0D9488) for primary buttons, active tabs, selected chips
- Urgency Colors: Vital Green (#10B981), Warm Amber (#F59E0B), Alert Red (#EF4444)
- Text Primary: Deep Slate (#0F172A)
- Text Secondary: Muted Slate (#64748B)
- Font: Inter (Sans-serif)
- Elements: Inputs and Buttons have 8px radius; Badges/Tags are pill-shaped
