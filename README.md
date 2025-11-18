# Football Manager 2K26

A comprehensive football management simulation game built with HTML5, CSS3, and vanilla JavaScript. Features include squad management, tactical setup, real-time 2D match simulation, transfers, staff management, and career mode.

## Features

### Core Systems

- **Player Database with 198 Max Rating System**
  - 25-35 attributes per player including physical, technical, mental, and defensive stats
  - Detailed player profiles with positions, nationality, age, value, and wages
  - Hidden attributes like consistency, important matches, and injury proneness

- **Squad Management**
  - Interactive player cards with key attributes
  - Search, filter, and sort functionality
  - Detailed player views with attribute breakdowns
  - Visual attribute bars and ratings

- **Formation & Tactics System**
  - 7 different formations (4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 4-1-4-1, 3-4-3, 5-3-2)
  - Visual formation display on pitch
  - Tactical instructions with sliders:
    - Passing Directness
    - Tempo
    - Risk Taking
    - Attacking Width
    - Pressing Intensity
    - Defensive Line

- **2D Match Engine**
  - Real-time match simulation with HTML5 Canvas
  - Attribute-based player behavior and decisions
  - Dynamic player positioning and movement
  - Ball physics and possession logic
  - Match events (goals, shots, tackles, cards)
  - Adjustable match speed (1x, 2x, 4x, 8x)
  - Stamina system affecting player performance

- **Transfer Market**
  - Browse available players from other clubs
  - Filter by position, budget range, and search
  - View player details before making offers
  - Transfer values based on player ratings

- **Staff Management**
  - Hire fitness, tactical, and goalkeeping coaches
  - Chief scout and medical staff
  - Staff attributes affecting team performance

- **League Table**
  - Full Premier League standings
  - Track your team's progress
  - Points, goals, and goal difference tracking

- **Save/Load System**
  - Automatic save every 30 seconds
  - Local storage persistence
  - Save squad, tactics, budget, and progress

## Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
3. No build process or dependencies required!

### How to Play

1. **Squad Management**: Browse your squad, view player details, and understand your team's strengths
2. **Set Tactics**: Choose a formation and adjust tactical instructions to match your play style
3. **Play Matches**: Start a match to see your tactics in action with real-time 2D simulation
4. **Transfer Market**: Scout and sign new players to improve your squad
5. **Manage Staff**: Hire coaches and staff to enhance training and player development
6. **League Progress**: Track your position in the league table

## Technical Details

### Architecture

- **Pure Vanilla JavaScript**: No frameworks or libraries required
- **HTML5 Canvas**: Used for pitch rendering and match visualization
- **CSS3 Animations**: Smooth transitions and modern UI
- **LocalStorage API**: For save/load functionality
- **Event-Driven Architecture**: Clean separation of concerns

### File Structure

```
Football-manager-2k26/
├── index.html              # Main HTML structure
├── styles.css              # All styling and animations
├── data/
│   ├── players.js          # Player database with 198 max rating
│   └── teams.js            # Teams, staff, and league data
├── js/
│   ├── formations.js       # Formation system and tactics
│   ├── matchEngine.js      # 2D match simulation engine
│   └── app.js              # Main application logic
└── README.md
```

### Player Rating System

The game uses a 0-198 rating system (similar to FM's 1-20 but scaled):
- 198: World Class (Mbappe, Haaland level)
- 185-197: Elite (Top players)
- 170-184: Very Good (Quality starters)
- 155-169: Good (Squad players)
- 140-154: Average (Rotation options)
- Below 140: Below Average

### Match Engine Logic

The match engine uses attribute-based calculations for:
- **Pass Success**: Based on passing, technique, decisions, pressure, and distance
- **Shot Success**: Based on finishing, positioning, composure, and distance to goal
- **Tackle Success**: Based on tackling, positioning, anticipation
- **Player Movement**: Zone-based AI with stamina affecting speed
- **Possession**: Dynamic based on team performance and tactics

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Player database structure
- [x] Basic UI framework
- [x] Squad view and filtering
- [x] Formation system
- [x] 2D match engine basics

### Phase 2: Core Gameplay ✅
- [x] Match simulation with events
- [x] Tactical instructions
- [x] Staff management
- [x] Transfer market
- [x] League table

### Phase 3: Advanced Features (Coming Soon)
- [ ] Contract negotiations
- [ ] Training system
- [ ] Player morale and form
- [ ] Injuries and fitness
- [ ] Advanced scouting
- [ ] Multiple seasons
- [ ] Champions League
- [ ] Financial management
- [ ] Press conferences
- [ ] Player development and growth

### Phase 4: Polish (Future)
- [ ] Match highlights replay
- [ ] Advanced statistics and analytics
- [ ] Multiplayer mode
- [ ] Mobile responsive design
- [ ] Sound effects and commentary
- [ ] More leagues and competitions
- [ ] Custom team creation
- [ ] Mod support

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Performance

- Optimized for 60 FPS match rendering
- Handles 500+ players without lag
- Efficient canvas rendering
- LocalStorage for instant saves

## Credits

Built by following industry best practices and inspired by:
- Football Manager series by Sports Interactive
- FIFA Ultimate Team player rating systems
- Modern web game development techniques

## License

This is a demonstration project for educational purposes.

## Contributing

Feel free to fork, modify, and improve! Some ideas:
- Add more players to the database
- Create new formations and tactical options
- Improve match engine AI
- Add new features from the roadmap
- Enhance UI/UX design

## Support

For issues or questions, please refer to the game's documentation or create an issue in the repository.

---

**Enjoy managing your team to glory!** ⚽🏆
