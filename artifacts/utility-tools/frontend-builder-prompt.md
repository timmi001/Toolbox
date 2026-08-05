# Frontend Builder Prompt

Redesign my frontend into a modern, ultra-minimal AI utility tools web app inspired by Apple’s simplicity and Linear’s clean interface. The design should feel premium, spacious, and extremely fast.

## Overall Style

- Minimal and elegant
- Lots of whitespace
- Soft shadows only
- Large rounded corners (20–28px)
- Glassmorphism only where necessary
- Smooth micro-interactions
- Clean typography (Inter)
- No clutter
- Mobile-first responsive
- Fast loading

## Color Palette

- Background: #FFFFFF
- Very light gray sections: #F8F9FC
- Accent: Purple (#6C4EFF)
- Soft blue
- Soft green
- Soft orange
- Soft pink
- Text: Black (#111111)
- Secondary: #666666
- Cards: White
- Thin border: #ECECEC
- Very subtle shadow

## Layout

Remove the traditional navigation-heavy design.

Keep only:
- Left: Logo
- Right: History, Theme Toggle

Do not include:
- Profile
- Pricing
- Blog
- Login button

The hero should occupy almost the entire first screen.

## Hero Section

Large heading:

All the Tools You Need, All in One Place

Highlight “All in One Place” using a purple gradient.

Small description underneath:

Free AI-powered utility tools that help you work faster and smarter.

Under the description place one large search bar:
- Rounded
- Search icon
- Placeholder: Search tools…

Under the search bar show 4 small pills:
- Free
- Fast
- Secure
- No Sign Up

## Floating Background

Around the hero section place soft floating colorful icons with blur:
- PDF
- Image
- Text
- Code
- Video
- Audio
- Calculator

Use low opacity and a slow floating animation.

## Categories

Under the hero place one horizontal category container.

Each category should be a clean rounded card.

Examples:
- Image
- PDF
- Text
- Video
- Audio
- Developer
- Calculator

Each icon should have its own dynamic pastel background color.

Cards should slightly enlarge on hover.

## Popular Tools

Below categories create a responsive grid.

- Desktop: 4 columns
- Tablet: 2 columns
- Mobile: 1 column

Each tool card should contain:
- Colorful icon
- Tool name
- One-line description
- Arrow icon

Hover animation:
- Lift 6px
- Shadow increases
- Arrow slides slightly

## Bottom Features

Four clean feature cards:
- 100% Free
- Fast & Secure
- Easy to Use
- Always Updated

## Animations

Use Framer Motion.

- Hero fades upward
- Cards stagger in
- Search bar expands on focus
- Floating icons slowly move
- Hover effects should be smooth (300ms ease)

## Responsive Design

- Mobile-first
- Search bar full width
- Category cards become horizontally scrollable
- Comfortable spacing throughout

## UI Components

- Rounded buttons
- Rounded inputs
- Soft shadows
- Minimal borders
- Glass effect only on floating elements
- No unnecessary gradients except headings

## UX

- Prioritize speed and usability
- Make the search bar the primary focus of the page
- Help users discover tools within seconds

## Technical Requirements

- React
- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Responsive layout
- Dark mode support
- Accessible components
- Clean component architecture
- Reusable card components
- Lazy-load non-critical sections
- Optimize for Lighthouse score above 95

The final result should look like a premium SaaS product rather than a typical utility tools website. Every element should feel intentional, modern, and polished, with a focus on simplicity, discoverability, and speed.
