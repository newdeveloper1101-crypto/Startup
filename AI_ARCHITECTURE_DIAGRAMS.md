# 🏗️ AI SALES AUTOMATION - ARCHITECTURE DIAGRAMS

## 1. SYSTEM FLOW DIAGRAM

```mermaid
graph TD
    A[Customer sends Telegram message] -->|Webhook| B[telegram.controller.ts]
    B -->|Find/Create| C[Lead & Conversation]
    C -->|Save| D[Message - CLIENT]
    
    D -->|Check Mode| E{BOT or HUMAN?}
    
    E -->|BOT MODE| F[generateSalesReply]
    F -->|Fetch History| G[getConversationContext]
    G -->|Read from DB| H[(Prisma Database)]
    
    F -->|Use Prompts| I[ai.prompts.ts<br/>SYSTEM_PROMPT<br/>SHOP_CONTEXT]
    I -->|Call OpenAI| J[gpt-4o-mini]
    J -->|Return| K[Sales Reply]
    K -->|Save| L[Message - SYSTEM]
    L -->|Send| M[Telegram API]
    M -->|Show to Customer| N[✅ Customer receives AI reply]
    
    E -->|HUMAN MODE| O[Skip AI Reply]
    O -->|Notify| P[Dashboard Agent]
    P -->|Optional: AI Assist| Q{Agent Action?}
    Q -->|Get Suggestion| R[suggestAgentReply]
    Q -->|Get Summary| S[summarizeConversation]
    R -->|Draft for editing| T[Agent types custom reply]
    S -->|Quick context| T
    T -->|Human sends| U[Message - AGENT]
    U -->|Save| H
    U -->|Send| M
```

## 2. FILE DEPENDENCIES DIAGRAM

```mermaid
graph LR
    A[Telegram Webhook] -->|uses| B[telegram.controller.ts]
    B -->|calls| C[ai.service.ts]
    C -->|imports| D[ai.prompts.ts]
    C -->|imports| E[ai.context.ts]
    
    E -->|reads from| F[(Prisma Database)]
    C -->|writes to| F
    
    C -->|calls| G[OpenAI API]
    
    H[API Routes] -->|GET /suggest-reply| C
    H -->|GET /summary| C
    I[Frontend Dashboard] -->|HTTP| H
    I -->|HTTP| B
```

## 3. DATA FLOW - AUTO REPLY SEQUENCE

```mermaid
sequenceDiagram
    participant C as Customer<br/>Telegram
    participant W as Webhook<br/>Controller
    participant DB as Database<br/>Prisma
    participant AI as AI Service<br/>OpenAI
    participant T as Telegram<br/>Bot

    C->>W: Send message
    W->>DB: Get/Create conversation
    W->>DB: Save CLIENT message
    W->>AI: Call generateSalesReply()
    AI->>DB: Fetch conversation history
    DB-->>AI: Message array
    AI->>AI: Format with SYSTEM_PROMPT<br/>+ SHOP_CONTEXT
    AI->>OpenAI: Call chat.completions.create()
    OpenAI-->>AI: Generated reply
    AI-->>W: Return reply string
    W->>DB: Save SYSTEM message
    W->>T: sendTelegramMessage()
    T->>C: Display AI reply to customer
```

## 4. DATA FLOW - AGENT ASSIST SEQUENCE

```mermaid
sequenceDiagram
    participant A as Agent<br/>Dashboard
    participant API as Express<br/>API
    participant AI as AI Service
    participant DB as Database
    participant OpenAI

    A->>API: GET /conversations/:id/suggest-reply
    API->>DB: Check conversation ownership
    DB-->>API: ✅ Verified
    API->>AI: Call suggestAgentReply()
    AI->>DB: Fetch conversation history
    DB-->>AI: Messages
    AI->>AI: Format with<br/>AGENT_SUGGESTION_PROMPT<br/>+ SHOP_CONTEXT
    AI->>OpenAI: Generate suggestion
    OpenAI-->>AI: Draft reply
    AI-->>API: Return suggestion
    API-->>A: { suggestion: "..." }
    A->>A: Show in panel
    A->>A: Agent edits & sends
```

## 5. BOT/HUMAN MODE STATE MACHINE

```mermaid
stateDiagram-v2
    BOT --> HUMAN: Customer types<br/>"agent"/"human"<br/>"support"
    HUMAN --> BOT: Toggle OR auto-reset
    
    state BOT {
        [*] --> Listening
        Listening --> Processing: Message received
        Processing --> Replying: AI generates
        Replying --> Listening: Sent to customer
    }
    
    state HUMAN {
        [*] --> Waiting
        Waiting --> OptionA: Agent asks for<br/>suggestion
        Waiting --> OptionB: Agent asks for<br/>summary
        OptionA --> Draft: Show suggestion
        OptionB --> Draft: Show summary
        Draft --> Sending: Agent types reply
        Sending --> Waiting: Message sent
    }
```

## 6. DATABASE SCHEMA FLOW

```mermaid
graph TD
    Company[Company<br/>name<br/>telegramBotToken] -->|owns| User[User<br/>email<br/>role<br/>companyId]
    Company -->|owns| Lead[Lead<br/>contact<br/>channel<br/>companyId]
    Company -->|owns| Conversation[Conversation<br/>leadId<br/>mode:BOT/HUMAN<br/>channel<br/>companyId]
    
    Lead -->|has many| Conversation
    Conversation -->|has many| Message[Message<br/>content<br/>sender:CLIENT/AGENT/SYSTEM<br/>conversationId<br/>createdAt]
    
    Message -->|role mapping| OpenAI["OpenAI Format<br/>CLIENT → user<br/>AGENT → assistant<br/>SYSTEM → assistant"]
```

## 7. AI PROMPTS ARCHITECTURE

```mermaid
graph TD
    A[ai.prompts.ts<br/>MASTER PROMPTS] -->|SYSTEM_PROMPT| B[Professional Sales<br/>Assistant Behavior]
    A -->|SHOP_CONTEXT| C[Best-Selling Products<br/>Payment/Delivery Options<br/>Policies]
    
    B -->|Used by| D[generateSalesReply]
    C -->|Used by| D
    
    B -->|Used by| E[suggestAgentReply]
    C -->|Used by| E
    
    A -->|AGENT_SUGGESTION_PROMPT| E
    A -->|SUMMARY_PROMPT| F[summarizeConversation]
    
    D -->|Output| G["AI Reply to Customer<br/>Temperature: 0.4<br/>Max Tokens: 300"]
    E -->|Output| H["Suggestion for Agent<br/>Max Tokens: 200"]
    F -->|Output| I["Conversation Summary<br/>Max Tokens: 250"]
```

## 8. API ENDPOINT ARCHITECTURE

```mermaid
graph LR
    A[Express Router] -->|GET /conversations| B["Fetch All<br/>Conversations"]
    A -->|GET /conversations/:id/messages| C["Fetch Messages"]
    A -->|GET /conversations/:id/suggest-reply| D["🤖 Suggest Reply<br/>Agent-Assist"]
    A -->|GET /conversations/:id/summary| E["🧠 Summarize<br/>Agent-Assist"]
    A -->|PUT /conversations/:id| F["Toggle Mode<br/>BOT/HUMAN"]
    
    B -->|requires| G[authMiddleware]
    C -->|requires| G
    D -->|requires| G
    E -->|requires| G
    F -->|requires| G
```

## 9. ERROR HANDLING FLOW

```mermaid
graph TD
    A[AI Operation] -->|Try| B{Success?}
    B -->|Yes| C[Return Result]
    B -->|No| D{Error Type?}
    
    D -->|OPENAI_API_KEY missing| E["isAIEnabled() = false<br/>Return fallback message"]
    D -->|OpenAI timeout/error| F["Log error<br/>Return fallback<br/>Continue gracefully"]
    D -->|DB connection error| G["Log error<br/>Return 500<br/>Alert admins"]
    D -->|Invalid input| H["Return 400<br/>Validation error"]
    D -->|Unauthorized| I["Return 401<br/>Redirect to login"]
    
    C -->|Return to| J[Controller/Route Handler]
    E -->|Return to| J
    F -->|Return to| J
```

## 10. TEMPERATURE & CREATIVITY SPECTRUM

```mermaid
graph LR
    A["🔴 0.0<br/>Most Focused<br/>Deterministic"] -->|"↑ Creativity"| B["0.3-0.4<br/>Sales Mode<br/>Controlled"]
    B -->|↑| C["0.5-0.6<br/>Balanced<br/>Natural"]
    C -->|↑| D["0.8-1.0<br/>🟢 Most Creative<br/>Unpredictable"]
    
    B -.->|"✅ Used by<br/>generateSalesReply"| E["Sales automation<br/>consistency matters"]
    C -.->|"Used by<br/>suggestAgentReply"| F["Suggestions need<br/>some variety"]
```

## 11. MESSAGE LIFECYCLE

```mermaid
graph TD
    A["Customer sends<br/>message to Telegram"] -->|"1. Receive"| B[Telegram Webhook]
    B -->|"2. Save"| C["Message<br/>sender: CLIENT"]
    C -->|"3. Check Mode"| D{BOT?}
    
    D -->|"4. Generate"| E[generateSalesReply]
    E -->|"5. Create"| F["Message<br/>sender: SYSTEM"]
    F -->|"6. Send"| G[Telegram API]
    
    D -->|"Waiting..."| H[Agent takes over]
    H -->|"4b. Compose"| I[Custom reply]
    I -->|"5b. Create"| J["Message<br/>sender: AGENT"]
    J -->|"6b. Send"| G
    
    G -->|"7. Delivered"| K["Customer sees<br/>response"]
```

## 12. DEPLOYMENT TOPOLOGY

```mermaid
graph TB
    A["Railway / Vercel<br/>Production Server"]
    
    B["Backend<br/>Node.js/Express"]
    C["Database<br/>PostgreSQL"]
    D["Cache<br/>Redis<br/>Optional"]
    
    E["Frontend<br/>React/Vite"]
    F["CDN<br/>Static Assets"]
    
    G["Telegram<br/>Servers"]
    H["OpenAI<br/>API"]
    
    A -->|contains| B
    A -->|connected to| C
    B -->|calls| H
    B -->|receives webhooks from| G
    B -->|serves| E
    E -->|fetches from| F
    B -->|optional cache| D
```

---

## Summary

These diagrams show:
1. **End-to-end flow** from customer message to AI reply
2. **File dependencies** and module relationships
3. **Sequence diagrams** for both auto-reply and agent-assist
4. **State machine** for BOT/HUMAN mode switching
5. **Database schema** and relationships
6. **Prompt layering** architecture
7. **API endpoint** structure
8. **Error handling** paths
9. **Creativity spectrum** for temperature settings
10. **Message lifecycle** tracking
11. **Production deployment** topology

All components work together to create a scalable, maintainable AI sales automation system.
