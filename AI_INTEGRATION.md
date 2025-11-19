# AI Agent Integration

This document explains how the AI agent is integrated into the Code Battle Platform for dynamic problem generation.

## Overview

The platform now uses an AI agent to generate unique coding problems for each match based on the players' trophy levels. This ensures fresh challenges and appropriate difficulty scaling.

## How It Works

1. **Matchmaking**: When two players are matched, their average trophy count is calculated
2. **Problem Generation**: The AI agent receives the trophy count and generates a problem with:
   - Appropriate difficulty level
   - 4 test cases with explanations
   - Time estimates
   - Hints and constraints
   - Relevant tags
3. **Problem Storage**: Generated problems are saved to MongoDB for the match
4. **Fallback**: If AI generation fails, the system falls back to existing problems

## AI Agent Configuration

### Environment Variables
```env
AI_AGENT_API_URL=https://agent-prod.studio.lyzr.ai/v3/inference/chat/
AI_AGENT_API_KEY=sk-default-EiUxVZWVhWT0SRuI7bHOK4oKm7oUoNzD
AI_AGENT_ID=691ce37f499310d238fb1c96
```

### Trophy to Difficulty Mapping
- **0-999 trophies**: Easy (difficulty_score 2-3)
- **1000-1999 trophies**: Medium (difficulty_score 4-5)
- **2000-2999 trophies**: Hard (difficulty_score 6-7)
- **3000-3999 trophies**: Very Hard (difficulty_score 8)
- **4000+ trophies**: Expert (difficulty_score 9-10)

## Files Modified

### Backend
- `src/config/env.ts` - Added AI agent environment variables
- `src/services/aiAgent.service.ts` - New service for AI agent communication
- `src/services/problemGeneration.service.ts` - Problem generation and conversion logic
- `src/models/Problem.model.ts` - Updated schema for AI-generated problems
- `src/socket/handlers/matchmaking.handler.ts` - Integrated AI problem generation
- `.env` and `.env.example` - Added AI agent configuration

### Frontend
- `src/types/game.ts` - Updated Problem interface and Difficulty type
- Game page automatically works with new problem format

### Shared
- `shared/types/common.ts` - Updated Difficulty type

## Testing

Run the AI agent test:
```bash
cd backend
npm run test-ai
```

This will test:
- AI agent responses for different trophy levels
- Database integration
- Error handling and fallbacks

## Error Handling

The system includes robust error handling:
1. **AI Agent Timeout**: 30-second timeout for AI requests
2. **Invalid Responses**: JSON parsing validation
3. **Fallback System**: Uses existing problems if AI generation fails
4. **Logging**: All errors are logged for debugging

## API Response Format

The AI agent returns problems in this format:
```json
{
  "id": "unique-problem-id",
  "title": "Problem Title",
  "description": "Full problem description with input/output format",
  "difficulty": "Medium",
  "difficulty_score": 5,
  "estimated_time_seconds": 1200,
  "hint": "Short helpful hint",
  "constraints": "Input constraints and limits",
  "testcases": [
    {
      "stdin": "input data",
      "expected_stdout": "expected output",
      "explanation": "Why this test case is important"
    }
  ],
  "tags": ["arrays", "sorting"],
  "generation_notes": "Brief algorithmic notes"
}
```

## Benefits

1. **Fresh Content**: Every match has a unique problem
2. **Appropriate Difficulty**: Problems scale with player skill
3. **Rich Metadata**: Includes hints, explanations, and time estimates
4. **Reliability**: Fallback system ensures matches always have problems
5. **Performance**: Problems are generated quickly and cached in database