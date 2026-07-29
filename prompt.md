Build a production-quality web application prototype called "DriveMind AI – AI-Powered Driving Companion".

IMPORTANT:
This is NOT a website or admin dashboard.
This is a realistic prototype of an AI-powered in-car infotainment system intended for Smart India Hackathon (SIH).

The prototype must look and behave like software that could be integrated into the infotainment system of a modern vehicle.

=====================================================
PRIMARY GOAL
=====================================================

Create a fully interactive prototype where a user can enter any source and destination within India.

The application must calculate and display:

• Real route
• Accurate driving distance
• Estimated travel time
• Turn-by-turn route visualization
• Current traffic conditions (when available)
• Weather at source and destination
• Route summary

The source and destination search must support places across India.

Examples:

Chennai → Bengaluru
Delhi → Jaipur
Madurai → Coimbatore
Kolkata → Bhubaneswar
Kashmir → Kanyakumari

The calculations should be geographically accurate.

=====================================================
MAP REQUIREMENTS
=====================================================

Use Google Maps Platform (preferred).

Implement:

• Place Autocomplete
• Geocoding
• Directions API
• Route Rendering
• Distance Matrix
• Interactive map

The map should display:

Current location

Destination

Entire driving route

Distance

Estimated arrival time

Alternative routes (if available)

Traffic visualization

=====================================================
AI COMPANION
=====================================================

The AI assistant is the core innovation.

It should provide conversational assistance during the journey.

Examples:

"I found a route that saves 12 minutes."

"Traffic congestion detected ahead."

"There is a fuel station 3 km ahead."

"A hospital is available nearby."

"Rain is expected along your route."

"You have been driving continuously for two hours. Consider taking a short break."

The AI should feel proactive rather than reactive.

=====================================================
EMERGENCY MODE
=====================================================

Include an SOS screen.

Capabilities:

Locate nearest hospitals

Locate nearest police station

Share current GPS location

Call emergency contact (simulation)

Emergency instructions

=====================================================
JOURNEY SUMMARY
=====================================================

At the end of the journey display:

Total distance

Travel time

Average speed (estimated)

Traffic encountered

Weather

AI recommendations

Journey timeline

=====================================================
USER INTERFACE
=====================================================

Create a futuristic automotive infotainment UI.

Dark theme.

Blue accent colors.

Minimalistic.

Glassmorphism.

Large touch-friendly buttons.

Responsive.

Smooth animations.

Do NOT make it look like a website.

It should resemble Tesla, Mercedes MBUX, Tata Curvv EV, or Hyundai infotainment software.

=====================================================
TECH STACK
=====================================================

React

TypeScript

Vite

Tailwind CSS

Framer Motion

Google Maps JavaScript API

Google Places API

Google Directions API

Google Distance Matrix API

React Router

Lucide Icons

=====================================================
CODE QUALITY
=====================================================

Use reusable components.

Use TypeScript.

Use proper folder structure.

Separate services.

Separate map logic.

Separate AI logic.

No hardcoded routes.

No fake distance calculations.

=====================================================
OBJECTIVE
=====================================================

The prototype should be realistic enough that a Smart India Hackathon judge believes it could evolve into an actual automotive infotainment product.

Focus on technical realism, accurate navigation across India, and an AI companion that enhances safety and the overall driving experience.