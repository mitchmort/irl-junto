# Junto MVP: Product Requirements Document

## Executive Summary

**Product**: Junto - Sports Event Coordination Platform  
**Vision**: Create games in 30 seconds, share one link, and show up to play  
**Mission**: Eliminate the coordination chaos of amateur sports organizing while ensuring reliable attendance  
**Target Release**: Q2 2025 MVP Launch  

## Problem Statement

Amateur sports organizers face significant challenges that prevent them from enjoying the activities they love:

**Current State**: 
- Organizers spend 7+ hours weekly coordinating events through fragmented group chats
- 37% of confirmed participants don't show up, often ruining games
- Manual tracking of RSVPs across WhatsApp, texts, and Facebook groups
- Constant reminders and follow-ups that still don't guarantee attendance
- Games cancelled last-minute due to insufficient players

**Root Causes**:
- No accountability for RSVPs made in casual group chats
- Scattered communication across multiple platforms
- No centralized way to track who's actually coming
- Participants forget commitments made days earlier
- No consequences for repeated no-shows

**Desired State**: 
- Create and share events in under 2 minutes
- Reliable attendance with <10% no-show rates
- Automated reminders and clear commitment tracking
- Organizers spend time playing, not coordinating

## Target Users & Market

### Primary User: Amateur Sports Organizers
- **Demographics**: Adults 25-45 who regularly organize recreational sports
- **Behavior**: Currently coordinate 2-4 events per week via group chats
- **Pain Points**: 
  - Spend more time organizing than playing
  - Frustrated by unreliable attendance
  - Tired of being the "default coordinator"
- **Motivation**: Want hassle-free coordination so they can enjoy their sport

### Secondary User: Sports Participants  
- **Demographics**: Adults 18-50 who join recreational sports activities
- **Behavior**: Respond to invites across multiple chat groups
- **Pain Points**: 
  - Lose track of commitments across different chats
  - Games cancelled due to others not showing
  - Unclear event details buried in message threads
- **Motivation**: Want reliable games with clear details and easy commitment tracking

### Market Opportunity
- **TAM**: 50M+ amateur athletes in the US participating in organized recreational sports
- **Growth**: 15% YoY increase in recreational sports participation post-pandemic
- **Competition**: Generic tools (Doodle, Facebook Events) not optimized for sports coordination
- **Differentiation**: Sports-specific features with focus on reliability and speed

## Success Metrics

### Primary KPIs
- **Event Completion Rate**: 85%+ of created events reach minimum participants and complete
- **Attendance Reliability**: 90%+ show-up rate for confirmed participants  
- **Organizer Efficiency**: <2 minutes average event creation time
- **User Retention**: 70%+ monthly active organizers after 3 months

### Secondary Metrics
- **Viral Coefficient**: Average 5+ new participants per organizer per month
- **Engagement**: 3+ events per organizer per month
- **Platform Growth**: 1,000+ active organizers within 6 months
- **Geographic Spread**: Active events in 25+ metro areas

### Qualitative Success
- Organizers report significant reduction in coordination burden
- Participants praise reliability and ease of use
- Organic growth through word-of-mouth in sports communities

## Core Value Proposition

### For Organizers
"Create your game in 30 seconds, share one link, and let Junto handle the rest. No more chasing RSVPs or dealing with no-shows."

### For Participants
"Never miss a game again. One-click RSVP, automatic reminders, and play with reliable people who actually show up."

### Key Differentiators
1. **Speed**: Fastest event creation in the market (30 seconds vs 5+ minutes)
2. **Reliability**: Phone verification and tracking ensure accountability
3. **Simplicity**: No app required, works instantly via web links
4. **Sports-Focused**: Optimized for the unique needs of recreational sports

## User Stories

### Organizer Stories

| User Type | Sport | Story |
|-----------|-------|-------|
| Basketball Organizer | Basketball | As a weekly pickup basketball organizer, I want to quickly create a 5v5 game for Saturday morning at the local gym, share it with my WhatsApp group, and know exactly who's coming so we have enough for full court. |
| Tennis Organizer | Tennis | As a tennis enthusiast, I want to organize doubles matches with players at my skill level (3.5 USTA), ensuring we have exactly 4 committed players who won't bail last minute. |
| Climbing Organizer | Rock Climbing | As a climbing group organizer, I want to coordinate gym sessions where I can specify the skill level (5.10-5.12), get RSVPs from regular partners, and add notes about which walls we'll focus on. |
| Soccer Organizer | Soccer | As a soccer organizer, I want to set up weekly 7v7 games, track who's bringing equipment (goals, cones, balls), and maintain a waitlist when we hit 14 players. |
| Volleyball Organizer | Volleyball | As a beach volleyball coordinator, I want to organize 4v4 games, specify the exact beach court location, note the skill level (intermediate), and handle the $5 per person court rental fee transparently. |
| Multi-Sport Organizer | Various | As someone who organizes multiple sports, I want to see all my upcoming events in one dashboard, clone successful past events, and build a reputation as a reliable organizer. |

### Participant Stories

| User Type | Sport | Story |
|-----------|-------|-------|
| New Basketball Player | Basketball | As someone new to the area, I want to join local pickup games via shared links in Facebook groups, see who else is playing, and add games directly to my calendar. |
| Casual Tennis Player | Tennis | As a casual tennis player, I want to RSVP to weekend doubles matches, get reminded the night before, and easily cancel if my plans change so someone else can take my spot. |
| Regular Climber | Rock Climbing | As a regular gym climber, I want to join sessions with climbers at my level, see who's attending before committing, and coordinate carpooling in the event chat. |
| Pickleball Enthusiast | Pickleball | As a pickleball player, I want to find games at convenient times, know the skill level expected, and build relationships with regular players in my area. |
| Busy Parent | Soccer | As a parent with limited free time, I want clear game details, reliable calendar integration, and the ability to join waitlists for popular time slots. |
| Multi-Sport Athlete | Various | As someone who plays multiple sports, I want to see all my upcoming games in one place, track my attendance reliability, and never double-book myself. |

### Edge Case Stories

| User Type | Scenario | Story |
|-----------|----------|-------|
| Organizer | Weather Concerns | As an organizer of outdoor sports, I want to easily communicate weather-related changes to all participants and make quick decisions about cancellations. |
| Participant | Last-Minute Schedule | As someone with an unpredictable schedule, I want to join waitlists for full events and get instantly notified if a spot opens up. |
| Organizer | Equipment Coordination | As a volleyball organizer, I want to assign who's bringing the net, balls, and lines, ensuring nothing is forgotten. |
| New User | First Experience | As someone who received an event link, I want to quickly understand what Junto is, RSVP without friction, and feel confident about attending. |

## Product Requirements

### MVP Scope: Must-Have Features

#### 1. Event Creation & Management
**User Story**: "As an organizer, I want to create events in 30 seconds so I can focus on playing"

**Requirements**:

[P0] **Quick Event Creation Flow**
- 11-step guided flow with smart defaults
- Auto-generated event titles (e.g., "Tuesday Evening Basketball - 5v5")
- Support for 6 sports: Basketball, Tennis, Pickleball, Volleyball, Soccer, Rock Climbing
- Mobile-optimized interface with large touch targets

[P0] **Event Details**
- Sport type and sub-category selection
- Date and time selection (30-minute increments, next 30 days)
- Location via Google Places API integration
- Participant slots (max 40 total to prevent misuse)
- Skill level indicators (Beginner, Casual, Intermediate, Advanced, Pro, All Welcome)

[P0] **Event Management**
- Unique shareable link generation (junto.app/event/[id])
- Real-time participant tracking
- Ability to modify event details after creation
- Manual participant removal capability
- Waitlist management controls

[P1] **Additional Event Options**
- Duration selection (30 min to 3+ hours)
- Cost per person (free or paid - organizer handles payment)
- Equipment requirements field
- Arrival instructions
- Event cloning for repeat games

**Acceptance Criteria**:
- Event creation completes in <30 seconds for experienced users
- All fields have sensible defaults based on sport type
- Mobile browser performance <3 second load time
- Changes trigger notifications to confirmed participants

#### 2. Frictionless RSVP System
**User Story**: "As a participant, I want to join games instantly without downloading an app"

**Requirements**:

[P0] **Web-Based RSVP Flow**
- No app download required
- View full event details before committing
- See current participants (with avatars/initials)
- One-click RSVP with phone/email verification
- Clear event status indicators (Open, Filling Fast, Full, Waitlist)

[P0] **Authentication**
- Phone or email authentication options
- SMS verification for phone numbers
- Persistent login across devices
- Guest viewing (no login required to see event details)

[P0] **RSVP Management**
- Cancel RSVP anytime before event
- Join waitlist when event is full
- Automatic promotion from waitlist
- Calendar integration (.ics download)

[P1] **Enhanced Calendar Integration**
- Auto-sync to linked calendars (Google, Apple, Outlook)
- Updates sync when event details change
- Remove from calendar if RSVP cancelled

**Acceptance Criteria**:
- RSVP process takes <1 minute for new users
- <2 clicks for returning users
- 98%+ SMS delivery success rate
- Calendar files compatible with major providers

#### 3. Reliability & Accountability System
**User Story**: "As an organizer, I want confident that people who RSVP will actually show up"

**Requirements**:

[P0] **Identity Verification**
- Phone number verification required for all users
- Name and phone displayed to organizers
- Optional ID verification badge (Phase 2)

[P0] **Reminder System**
- Automatic SMS reminders (24 hours and 2 hours before)
- Email reminders for email-authenticated users
- Customizable notification preferences
- In-app web notifications

[P0] **Event Communication**
- Organizer-initiated group messages
- Participants can respond but not initiate
- Event updates (time, location, cancellation)
- Message history preserved with event

[P1] **Reliability Tracking**
- Show-up rate tracked (Phase 2 public display)
- Organizer reliability score
- Event completion tracking
- No-show impact on future capabilities (Phase 2)

**Acceptance Criteria**:
- 95%+ reminder delivery rate
- All critical updates sent via SMS (mandatory)
- Message threads organized by event
- Reliability data private in MVP

#### 4. Dashboard & Analytics
**User Story**: "As a user, I want to track my sports activity and see upcoming games"

**Requirements**:

[P0] **Unified Dashboard**
- Combined view for organizers and participants
- Upcoming events carousel
- Past events history
- Personal statistics display

[P0] **Key Metrics Display**
- Games played counter
- Reliability score (Phase 2 public)
- Active streak tracking
- Sports breakdown (pie chart)
- Monthly activity summary

[P0] **Event Management View**
- "My Events" section for organizers
- Quick access to event pages
- Clone past events
- View participant lists

[P1] **Social Elements**
- Top teammates (most games together)
- Favorite venues
- Badge/achievement progress
- New players met counter

**Acceptance Criteria**:
- Dashboard loads in <2 seconds
- Real-time metric updates
- Mobile-responsive design
- Intuitive navigation between sections

### Phase 2: Post-MVP Features

[P2] **Enhanced Trust & Safety**
- Public reliability scores
- User blocking and reporting
- Verified organizer badges
- Community guidelines enforcement

[P2] **Advanced Features**
- Native mobile applications
- Recurring event templates
- Team/group management
- Skill-based matchmaking
- Payment processing integration

[P2] **Discovery Features**
- Opt-in public event browsing
- Sport-specific communities
- Organizer following
- Event recommendations

### Explicitly Out of Scope for MVP
- Native mobile apps (web-only)
- Payment processing
- Public event discovery/search
- Complex recurring event logic
- Email-only authentication
- Social features (friends, following)
- Event categories beyond 6 core sports
- Data import/export capabilities
- Multi-language support

## User Experience Requirements

### Design Principles
1. **Speed First**: Every interaction optimized for efficiency
2. **Mobile Native**: Designed for one-handed phone use
3. **Clear Visual Hierarchy**: Event status always obvious
4. **Minimal Cognitive Load**: Smart defaults, progressive disclosure
5. **Trust Building**: Show social proof, verified participants

### Core User Flows

#### Organizer Flow
1. Click "Create Event" → Sport selection → Details → Share link (30 seconds)
2. Monitor RSVPs via dashboard → Send updates if needed → Show up and play

#### Participant Flow  
1. Receive link → View details → RSVP → Add to calendar → Get reminders → Attend

### Mobile Requirements
- Responsive design for screens 320px and up
- Touch targets minimum 44px
- Optimized for slow 3G connections
- Progressive Web App capabilities
- Offline viewing of RSVP'd events

### Accessibility
- WCAG 2.1 AA compliance
- High contrast mode
- Screen reader support
- Keyboard navigation
- Clear error messages

## Technical Considerations

### Platform Requirements
- **Frontend**: Mobile-first responsive web application
- **Performance**: <3 second load time on 3G
- **Browsers**: Chrome, Safari, Firefox, Edge (latest 2 versions)
- **Authentication**: Phone (SMS via Twilio) and email options
- **Database**: Real-time updates for participant changes
- **Uptime**: 99.9% availability target

### Integrations
- **SMS**: Twilio for notifications and verification
- **Location**: Google Places API for venue selection
- **Calendar**: .ics file generation, OAuth for calendar sync
- **Analytics**: Event tracking for conversion optimization
- **Monitoring**: Error tracking and performance monitoring

### Security & Privacy
- HTTPS only
- Encrypted data storage
- GDPR compliance for user data
- Rate limiting on API endpoints
- Phone number privacy controls

### Scalability
- Support 100,000+ concurrent users
- Handle viral growth spikes
- Geographic distribution (CDN)
- Database sharding strategy
- Queue system for notifications

## Launch Strategy

### MVP Launch (Q2 2025)
**Week 1-2: Soft Launch**
- 100 beta organizers across 6 metro areas
- Focus on feedback and iteration
- Iron out notification reliability

**Week 3-4: Social Media Campaign**
- Target Facebook sports groups
- WhatsApp community outreach  
- Instagram reels showing 30-second creation
- TikTok "organizing chaos" before/after

**Month 2-3: Nationwide Rollout**
- PR push to sports blogs/podcasts
- Referral incentives for organizers
- Community ambassador program
- Success story amplification

### Growth Strategy
- **Viral Mechanics**: Every event shares = 5-10 new user exposures
- **Network Effects**: More reliable users = better experience
- **Community Building**: Local sports organizer spotlights
- **Retention**: Gamification and reliability scores

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| SMS delivery failures | Multi-provider backup, email fallback |
| Location API limits | Implement caching, backup provider |
| Viral traffic spikes | Auto-scaling, CDN, queue systems |
| Browser compatibility | Progressive enhancement, polyfills |

### Market Risks
| Risk | Mitigation |
|------|------------|
| Low organizer adoption | Direct outreach to existing coordinators |
| Platform trust issues | Verification badges, testimonials |
| Competition from big tech | Focus on sports-specific features |
| Seasonal usage drops | Multi-sport support, indoor options |

### Operational Risks
| Risk | Mitigation |
|------|------------|
| Support overload | Comprehensive FAQ, community forums |
| Abuse/spam | Rate limiting, verification requirements |
| Legal compliance | Clear terms, privacy policy, legal review |

## Next Steps

### Immediate Actions (Next 30 Days)
1. Finalize technical architecture and provider selection
2. Complete UI/UX designs for all flows
3. Begin development of core RSVP engine
4. Recruit 50 beta organizers across target sports
5. Establish Twilio account and test SMS reliability

### Key Milestones
- **Month 1**: Core event creation and RSVP complete
- **Month 2**: Dashboard and notifications ready
- **Month 3**: Beta launch with 100 organizers
- **Month 4**: Iterate based on feedback
- **Month 5**: Public launch preparation
- **Month 6**: Nationwide launch

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Owner**: Product Team  
**Stakeholders**: Engineering, Design, Marketing, Leadership