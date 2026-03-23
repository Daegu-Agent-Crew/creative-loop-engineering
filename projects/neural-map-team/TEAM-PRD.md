# Neural Map v10 - Team Edition

## 팀 구성

Create an agent team with 3 teammates to build an OpenClaw visualization dashboard.

## Teammate Roles

### Teammate A: "Structure Expert"
- Build the HTML structure and layout (3-zone: brain map / cortex theater / deep stats)
- Create the simulation engine with 4 scenarios
- Implement the chat stream UI (bottom input bar)
- Build navigation tabs

### Teammate B: "Animation Expert"  
- Design and implement all CSS animations:
  - Thought Cascade (6 phases with card entry animations)
  - Synapse lines with particle effects (sin wave)
  - Agent avatar with 5 states (idle/thinking/tool_calling/speaking/error)
  - Speech bubble with typing effect
  - Floating, glow, pulse effects
- Neural Dark theme (deep blue gradient + glassmorphism)

### Teammate C: "Data Expert"
- Implement decision tree visualization (interactive nodes)
- Memory graph (semantic connections)
- Token lifecycle waterfall chart (Canvas)
- Context influence score heatmap
- Tool call log table with filters
- CSV/JSON export functionality

## Rules

1. Teammate A creates `structure.html` with HTML + basic CSS + simulation JS
2. Teammate B creates `animations.css` with all CSS animations + themes
3. Teammate C creates `data-viz.js` with all Canvas charts + data components
4. All files must work together as a single page (structure.html links CSS and JS)
5. Pure HTML/CSS/JS only - NO external libraries
6. Korean UI, Neural Dark theme (#0a0e1a base)
7. Mobile responsive (768px breakpoint)
8. Each teammate must NOT modify other teammates' files

## Integration

After all teammates complete their parts, the Team Lead should create a final `index.html` that combines:
- structure.html content (HTML body)
- animations.css content (in <style> tag)
- data-viz.js content (in <script> tag)

This creates the single-file deliverable.
