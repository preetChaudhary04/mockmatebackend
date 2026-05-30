const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job describe",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in the interview along with their intention and how to answer them",
    ),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe(
            "The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances",
          ),
      }),
    )
    .describe(
      "List of skill gaps in the candidate's profile along with their severity",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("The day number in the preparation plan, starting from 1"),
        focus: z
          .string()
          .describe(
            "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc.",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.",
          ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
    ),
  title: z
    .string()
    .describe(
      "The title of the job for which the interview report is generated",
    ),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `You are an expert technical interviewer. Generate a comprehensive interview report for the candidate below.
 
CANDIDATE INFORMATION:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
 
CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THIS EXACTLY:

Return ONLY valid raw JSON.

DO NOT:
- return markdown
- return code blocks
- return explanations
- return escaped JSON
- stringify objects
- wrap objects inside quotes
- return arrays of strings containing JSON

IMPORTANT:
technicalQuestions, behavioralQuestions, skillGaps, and preparationPlan MUST contain REAL JSON OBJECTS — NOT STRINGS.

CORRECT:
"technicalQuestions": [
  {
    "question": "Explain React reconciliation",
    "intention": "Assess React internals knowledge",
    "answer": "Candidate should explain virtual DOM diffing..."
  }
]

WRONG:
"technicalQuestions": [
  "{ \"question\": \"Explain React reconciliation\" }"
]

Every array item must be a proper JSON object.

The response MUST:
- start with {
- end with }
- be directly parsable using JSON.parse()
- contain NO escaped objects
- contain NO backticks
- contain NO comments
 
SCHEMA REQUIREMENTS:
 
1. matchScore: A number between 0-100
2. title: title: Plain string title only. Example: "Frontend Developer Interview Report"
3. technicalQuestions: Array of EXACTLY 4-5 objects. EACH object MUST have these THREE fields:
   - "question": The actual technical question to ask (specific to candidate's skills/resume)
   - "intention": WHY you're asking this (what skill/knowledge it tests)
   - "answer": HOW the candidate should answer - detailed guidance on key points they should cover
   
4. behavioralQuestions: Array of EXACTLY 3-4 objects. EACH object MUST have these THREE fields:
   - "question": The actual behavioral question
   - "intention": WHY you're asking this (what trait/skill it evaluates)
   - "answer": Guidance on how to answer with examples and key points
   
5. skillGaps: Array of objects with TWO fields:
   - "skill": Name of the skill gap
   - "severity": One of these exactly: "low", "medium", or "high"
   
6. preparationPlan: Array of objects with THREE fields:
   - "day": Number (1, 2, 3, 4, 5, etc.)
   - "focus": String describing the focus area for that day
   - "tasks": Array of strings - specific actionable tasks for that day
 
EXAMPLE OUTPUT (FOLLOW THIS STRUCTURE):
{
  "matchScore": 88,
  "title": "Interview Report for John Doe - Senior React Developer",
  "technicalQuestions": [
    {
      "question": "Can you explain how you would implement a complex state management solution in React for a large-scale application, and when would you choose Redux Toolkit over Context API?",
      "intention": "To assess understanding of state management patterns, scalability considerations, and architectural decision-making",
      "answer": "The candidate should explain the key differences between Redux Toolkit and Context API. They should discuss Redux Toolkit's benefits like middleware support, dev tools, and actions. For Context API, mention it's suitable for smaller apps. They should provide specific examples of when to use each. A strong answer would include performance considerations and when complexity warrants Redux."
    },
    {
      "question": "Walk me through how you would optimize the performance of a React application that is rendering thousands of items in a list.",
      "intention": "To evaluate knowledge of React optimization techniques and problem-solving approach",
      "answer": "Expected answer should cover: virtualization (react-window/react-virtualized), memoization (React.memo, useMemo), pagination, or lazy loading. They should discuss why each helps. A strong candidate would mention measuring performance first, identifying bottlenecks, then applying solutions."
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Tell me about a time when you received critical feedback on your code. How did you handle it and what did you learn?",
      "intention": "To assess receptiveness to feedback, growth mindset, and how they handle criticism professionally",
      "answer": "Look for: acknowledgment of the feedback, specific example, how they responded (positively, not defensively), concrete changes made, lessons learned. A great answer shows they view feedback as learning opportunity and provide evidence of improvement."
    }
  ],
  "skillGaps": [
    {
      "skill": "Microservices Architecture",
      "severity": "medium"
    },
    {
      "skill": "Kubernetes and Container Orchestration",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "Advanced React Patterns and State Management",
      "tasks": [
        "Review Redux Toolkit documentation and examples",
        "Study custom hooks for state management",
        "Practice implementing a complex form with multiple state scenarios"
      ]
    },
    {
      "day": 2,
      "focus": "Performance Optimization",
      "tasks": [
        "Read about React profiling tools",
        "Implement virtualization in a test project",
        "Study memoization and when to apply it"
      ]
    }
  ]
}

FINAL REMINDER:
Do NOT serialize nested objects as strings.
Nested structures must be proper JSON objects and arrays.

Now generate the interview report. Remember: ONLY output valid JSON. Start with { and end with }. No other text.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
}

module.exports = { generateInterviewReport };
