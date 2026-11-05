import { Task, Reminder, Memory, ActionReceipt, Priority, Category } from '@/types';
import * as storage from './storage';

export interface AIResponse {
  text: string;
  receipt?: ActionReceipt;
}

// Helper to extract relative dates
function parseTemporalExpression(input: string): { dateStr: string; timeStr: string; fullIso: string } {
  const now = new Date();
  const lower = input.toLowerCase();
  
  const targetDate = new Date(now);
  let timeStr = '10:00 AM';

  // 1. Time extraction
  const timeMatch = lower.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridiem = timeMatch[3].toLowerCase();

    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    targetDate.setHours(hours, minutes, 0, 0);
    
    // Format friendly time string
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    timeStr = `${displayHours}:${displayMinutes} ${hours >= 12 ? 'PM' : 'AM'}`;
  } else {
    // Default 10 AM
    targetDate.setHours(10, 0, 0, 0);
  }

  // 2. Date offset extraction
  if (lower.includes('tomorrow')) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (lower.includes('day after tomorrow')) {
    targetDate.setDate(targetDate.getDate() + 2);
  } else if (lower.includes('next week')) {
    targetDate.setDate(targetDate.getDate() + 7);
  } else {
    // Check specific days of week: monday, tuesday, etc.
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      if (lower.includes(days[i])) {
        const currentDay = now.getDay();
        let diff = i - currentDay;
        if (diff <= 0) diff += 7; // Next occurrence
        targetDate.setDate(now.getDate() + diff);
        break;
      }
    }
  }

  const dateStr = targetDate.toISOString().split('T')[0];
  const fullIso = targetDate.toISOString();

  return { dateStr, timeStr, fullIso };
}

// Category extraction helper
function detectCategory(text: string): Category {
  const lower = text.toLowerCase();
  if (lower.includes('study') || lower.includes('assignment') || lower.includes('homework') || lower.includes('exam') || lower.includes('class') || lower.includes('learn')) {
    return 'Study';
  }
  if (lower.includes('meeting') || lower.includes('call') || lower.includes('sync') || lower.includes('interview')) {
    return 'Meeting';
  }
  if (lower.includes('workout') || lower.includes('gym') || lower.includes('cardio') || lower.includes('health') || lower.includes('doctor') || lower.includes('water') || lower.includes('walk')) {
    return 'Health';
  }
  if (lower.includes('budget') || lower.includes('finance') || lower.includes('tax') || lower.includes('expense') || lower.includes('pay') || lower.includes('invoice') || lower.includes('bill')) {
    return 'Finance';
  }
  if (lower.includes('design') || lower.includes('write') || lower.includes('idea') || lower.includes('creative') || lower.includes('blog') || lower.includes('video')) {
    return 'Creative';
  }
  if (lower.includes('groceries') || lower.includes('friend') || lower.includes('family') || lower.includes('shopping') || lower.includes('personal')) {
    return 'Personal';
  }
  return 'Work';
}

// Priority extraction helper
function detectPriority(text: string): Priority {
  const lower = text.toLowerCase();
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('high priority') || lower.includes('important') || lower.includes('critical')) {
    return 'high';
  }
  if (lower.includes('low priority') || lower.includes('when possible') || lower.includes('minor') || lower.includes('someday')) {
    return 'low';
  }
  return 'medium';
}

/**
 * Executes a confirmed destructive action or pending command
 */
export async function executeConfirmedAction(payload: { action: string; targetId: string }): Promise<AIResponse> {
  if (payload.action === 'delete_task') {
    const task = await storage.getTaskById(payload.targetId);
    const success = await storage.deleteTask(payload.targetId);
    if (!success) {
      return {
        text: `Failed to delete task. The item may have already been removed.`,
        receipt: { type: 'delete_task', summary: 'Deletion failed in database', success: false },
      };
    }
    return {
      text: `Deleted task **"${task?.title || payload.targetId}"** as requested.`,
      receipt: {
        type: 'delete_task',
        summary: `Task "${task?.title}" permanently deleted`,
        success: true,
        confirmed: true,
      },
    };
  }

  if (payload.action === 'delete_reminder') {
    const success = await storage.deleteReminder(payload.targetId);
    return {
      text: success ? `Reminder removed successfully.` : `Could not remove reminder from database.`,
      receipt: { type: 'delete_reminder', summary: 'Reminder deleted', success },
    };
  }

  return {
    text: `Unknown confirmation action.`,
    receipt: { type: 'confirmation_required', summary: 'Action not recognized', success: false },
  };
}

/**
 * Intelligent Natural Language Processing Engine for LifeOS
 */
export async function processUserMessage(message: string): Promise<AIResponse> {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // Load live database state
  const tasks = await storage.getTasks();
  const reminders = await storage.getReminders();
  const memories = await storage.getMemories();
  const profile = await storage.getUserProfile();
  const todayStr = new Date().toISOString().split('T')[0];

  // Try external OpenAI API if API key is present
  const apiKey = profile.openaiApiKey || process.env.OPENAI_API_KEY;
  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const llmResult = await callOpenAIAssistant(trimmed, { tasks, reminders, memories, profile, todayStr }, apiKey);
      if (llmResult) {
        return llmResult;
      }
    } catch (err) {
      console.warn('OpenAI API call failed or timed out, gracefully falling back to LifeOS Native Engine:', err);
    }
  }

  // -------------------------------------------------------------
  // LIFEOS NATIVE INTELLIGENT RULE & INTENT ENGINE
  // -------------------------------------------------------------

  // 1. DELETE / REMOVE TASK (Safety guardrail: requires confirmation)
  if (lower.startsWith('delete task') || lower.startsWith('remove task')) {
    const query = trimmed.replace(/^(delete|remove)\s+task\s+/i, '').trim();
    if (!query) {
      return {
        text: 'Which task would you like to delete? Please specify the task title or ID.',
      };
    }

    const matchedTask = tasks.find(
      t => t.id === query || t.title.toLowerCase().includes(query.toLowerCase())
    );

    if (!matchedTask) {
      return {
        text: `I couldn't find a task matching "${query}". Here are your pending tasks:\n` +
          tasks.filter(t => t.status !== 'completed').slice(0, 4).map(t => `• ${t.title}`).join('\n'),
      };
    }

    return {
      text: `Are you sure you want to permanently delete **"${matchedTask.title}"**? This action cannot be undone.`,
      receipt: {
        type: 'confirmation_required',
        summary: `Confirmation needed to delete "${matchedTask.title}"`,
        success: true,
        requiresConfirmation: true,
        confirmationPayload: {
          action: 'delete_task',
          targetId: matchedTask.id,
          targetTitle: matchedTask.title,
        },
      },
    };
  }

  // 2. COMPLETE / FINISH TASK ("I completed my React assignment", "Mark task as done", etc.)
  if (
    lower.startsWith('i completed') ||
    lower.startsWith('i finished') ||
    lower.startsWith('complete task') ||
    lower.startsWith('mark done') ||
    lower.startsWith('mark completed') ||
    lower.includes('completed my')
  ) {
    let query = trimmed
      .replace(/^i\s+(completed|finished)\s+(my\s+)?/i, '')
      .replace(/^(complete\s+task|mark\s+done|mark\s+completed)\s+/i, '')
      .trim();

    // Clean common prefixes
    query = query.replace(/^the\s+/i, '');

    const matchedTask = tasks.find(
      t => t.title.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(t.title.toLowerCase())
    );

    if (matchedTask) {
      const updated = await storage.updateTask(matchedTask.id, { status: 'completed' });
      if (!updated) {
        return {
          text: `Attempted to mark **"${matchedTask.title}"** as completed, but the database update failed. Please try again.`,
          receipt: { type: 'update_task', summary: 'Database update failed', success: false },
        };
      }

      return {
        text: `🎉 Awesome work! I've marked **"${matchedTask.title}"** as completed. Your daily productivity progress has been updated!`,
        receipt: {
          type: 'update_task',
          summary: `Completed task: "${matchedTask.title}"`,
          success: true,
          data: updated,
        },
      };
    } else {
      return {
        text: `I couldn't find a task matching "${query}". Did you mean one of these?\n` +
          tasks.filter(t => t.status !== 'completed').map(t => `• ${t.title}`).join('\n'),
      };
    }
  }

  // 3. REMIND ME ("Remind me to complete my assignment tomorrow at 10 AM", "Remind me to call my friend at 8 PM")
  if (lower.startsWith('remind me') || lower.startsWith('set reminder') || lower.startsWith('create reminder')) {
    const cleanPrompt = trimmed.replace(/^(remind me to|remind me|set reminder to|create reminder to)\s+/i, '');
    const temporal = parseTemporalExpression(cleanPrompt);

    // Extract title by stripping temporal clauses
    let reminderTitle = cleanPrompt
      .replace(/\s+(tomorrow|today|yesterday|next week|day after tomorrow).*/i, '')
      .replace(/\s+(at\s+)?\d{1,2}(:\d{2})?\s*(am|pm).*/i, '')
      .replace(/\s+(on|for)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday).*/i, '')
      .trim();

    if (!reminderTitle) {
      reminderTitle = cleanPrompt;
    }

    // Capitalize first letter
    reminderTitle = reminderTitle.charAt(0).toUpperCase() + reminderTitle.slice(1);
    const priority = detectPriority(trimmed);

    try {
      const newReminder = await storage.createReminder({
        title: reminderTitle,
        dateTime: temporal.fullIso,
        priority,
        isCompleted: false,
      });

      return {
        text: `⏰ Got it! I have set a reminder: **"${newReminder.title}"** for **${temporal.dateStr} at ${temporal.timeStr}**. I'll alert you when it's due!`,
        receipt: {
          type: 'create_reminder',
          summary: `Reminder created for ${temporal.dateStr} at ${temporal.timeStr}`,
          success: true,
          data: newReminder,
        },
      };
    } catch (err: any) {
      return {
        text: `Failed to save reminder in the database: ${err.message}`,
        receipt: { type: 'create_reminder', summary: 'Database write error', success: false },
      };
    }
  }

  // 4. WHAT ARE MY TASKS FOR TODAY? ("What are my tasks for today?", "Tasks today", "Show today's tasks")
  if (
    lower.includes('tasks for today') ||
    lower.includes('tasks today') ||
    lower.includes("what's on my schedule today") ||
    lower.includes('show today')
  ) {
    const todayTasks = tasks.filter(t => t.dueDate === todayStr || (!t.dueDate && t.status !== 'completed'));
    const pendingToday = todayTasks.filter(t => t.status !== 'completed');
    const completedToday = todayTasks.filter(t => t.status === 'completed');

    if (todayTasks.length === 0) {
      return {
        text: `You have no tasks scheduled for today! Would you like me to schedule something, or would you like to review your upcoming deadlines?`,
      };
    }

    let summaryText = `Here is your schedule for today (${todayStr}):\n\n`;
    if (pendingToday.length > 0) {
      summaryText += `**Pending Tasks (${pendingToday.length}):**\n` +
        pendingToday.map(t => `• [${t.priority.toUpperCase()}] **${t.title}** ${t.dueTime ? `at ${t.dueTime}` : ''} (${t.category})`).join('\n');
    } else {
      summaryText += `All of today's tasks are completed! 🏆\n`;
    }

    if (completedToday.length > 0) {
      summaryText += `\n\n**Completed Today (${completedToday.length}):**\n` +
        completedToday.map(t => `• ✅ ~~${t.title}~~`).join('\n');
    }

    return {
      text: summaryText,
    };
  }

  // 5. WHAT IMPORTANT WORK IS PENDING? ("What important work is pending?", "Show pending tasks", "Pending work")
  if (
    lower.includes('important work is pending') ||
    lower.includes('what is pending') ||
    lower.includes('what work is pending') ||
    lower.includes('pending tasks')
  ) {
    const pending = tasks.filter(t => t.status !== 'completed');
    const highPriority = pending.filter(t => t.priority === 'high');
    const mediumPriority = pending.filter(t => t.priority === 'medium');

    if (pending.length === 0) {
      return {
        text: `Great news! You have **no pending work**. Your task backlog is completely clear! 🌟`,
      };
    }

    let reply = `You currently have **${pending.length} pending tasks**.\n\n`;
    if (highPriority.length > 0) {
      reply += `🚨 **High Priority / Critical:**\n` +
        highPriority.map(t => `• **${t.title}** (Due: ${t.dueDate || 'No date'}, Category: ${t.category})`).join('\n') + '\n\n';
    }
    if (mediumPriority.length > 0) {
      reply += `⚡ **Medium Priority:**\n` +
        mediumPriority.map(t => `• **${t.title}** (Due: ${t.dueDate || 'No date'})`).join('\n');
    }

    return { text: reply };
  }

  // 6. WHAT SHOULD I FOCUS ON TODAY? ("What should I focus on today?", "Suggest priorities", "Focus today")
  if (
    lower.includes('what should i focus on') ||
    lower.includes('suggest priorities') ||
    lower.includes('focus on today') ||
    lower.includes('focus priority')
  ) {
    const pending = tasks.filter(t => t.status !== 'completed');
    const todayTasks = pending.filter(t => t.dueDate === todayStr);
    const highPriority = pending.filter(t => t.priority === 'high');

    // Pick top 3 recommendations
    const focusCandidates = Array.from(new Set([...highPriority, ...todayTasks, ...pending])).slice(0, 3);

    if (focusCandidates.length === 0) {
      return {
        text: `You have cleared all pending tasks! I suggest spending time on learning, reading, or planning your goals for next week.`,
      };
    }

    let reply = `🎯 **Here are your top ${focusCandidates.length} priorities to focus on today:**\n\n`;
    focusCandidates.forEach((task, idx) => {
      reply += `${idx + 1}. **${task.title}**\n   • Priority: \`${task.priority.toUpperCase()}\` | Category: ${task.category}\n   • Target: ${task.dueTime ? `Complete by ${task.dueTime}` : 'Complete today'}\n`;
    });
    reply += `\n*Tip: Start with task #1 in a dedicated 45-minute focus block without distractions.*`;

    return { text: reply };
  }

  // 7. CREATE A STUDY PLAN FOR THE NEXT 7 DAYS ("Create a study plan for the next 7 days", "7-day study plan", etc.)
  if (lower.includes('study plan') || lower.includes('plan for the next 7 days')) {
    // Generate 7-day study plan tasks
    const daysPlan = [
      { day: 1, title: 'Day 1: Foundations & Core Concepts Review', focus: 'Review architecture, key terminology, and set up project boilerplate' },
      { day: 2, title: 'Day 2: Component Design & State Hierarchy', focus: 'Build modular layouts, atomic components, and wire data props' },
      { day: 3, title: 'Day 3: Deep Dive into API Integration & Edge Cases', focus: 'Implement REST/GraphQL endpoints, error handling, and latency management' },
      { day: 4, title: 'Day 4: Performance Optimization & Testing', focus: 'Profiling renders, optimizing bundle size, writing unit & integration tests' },
      { day: 5, title: 'Day 5: User Interface Polish & Animations', focus: 'Framer motion micro-interactions, responsive breakpoints, accessibility' },
      { day: 6, title: 'Day 6: Mock Exam / Real-World Project Simulation', focus: 'Simulate high-pressure sprint problem solving and complete capstone' },
      { day: 7, title: 'Day 7: Comprehensive Review & Knowledge Retention', focus: 'Final audit, flashcards review, and preparation for deployment/presentation' },
    ];

    const createdTasks: Task[] = [];
    const now = new Date();

    for (let i = 0; i < daysPlan.length; i++) {
      const planItem = daysPlan[i];
      const taskDate = new Date(now);
      taskDate.setDate(now.getDate() + i);
      const dateStr = taskDate.toISOString().split('T')[0];

      const t = await storage.createTask({
        title: planItem.title,
        description: planItem.focus,
        category: 'Study',
        priority: i === 0 || i === 5 ? 'high' : 'medium',
        dueDate: dateStr,
        dueTime: '09:00 AM',
        recurrence: 'none',
        subtasks: [
          { id: `sp-sub-1-${i}`, title: 'Review notes & documentation (30 min)', completed: false },
          { id: `sp-sub-2-${i}`, title: 'Hands-on practice & exercises (60 min)', completed: false },
          { id: `sp-sub-3-${i}`, title: 'Daily self-quiz & recap (15 min)', completed: false },
        ],
        tags: ['StudyPlan', '7-DayChallenge'],
        estimatedMinutes: 105,
        status: 'pending',
      });
      createdTasks.push(t);
    }

    return {
      text: `📚 I have generated and scheduled a **7-Day Intensive Study Plan** with structured daily tasks and checklists starting from today!\n\n` +
        daysPlan.map(d => `• **${d.title}** - *${d.focus}*`).join('\n') +
        `\n\nAll 7 tasks have been saved directly to your database. You can view them in your Task Manager!`,
      receipt: {
        type: 'study_plan',
        summary: '7-Day Study Plan created and scheduled in database',
        success: true,
        data: createdTasks,
      },
    };
  }

  // 8. MOVE PENDING TASK TO TOMORROW ("Move my pending task to tomorrow", "Reschedule task to tomorrow")
  if (lower.includes('move') && lower.includes('to tomorrow')) {
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const pendingTasks = tasks.filter(t => t.status !== 'completed');

    if (pendingTasks.length === 0) {
      return { text: 'You have no pending tasks to reschedule!' };
    }

    // Check if user specified a task name
    let target = pendingTasks[0];
    const query = trimmed.replace(/move\s+(my\s+)?(pending\s+task|task)?/i, '').replace(/to\s+tomorrow/i, '').trim();

    if (query) {
      const matched = pendingTasks.find(t => t.title.toLowerCase().includes(query.toLowerCase()));
      if (matched) target = matched;
    }

    const updated = await storage.updateTask(target.id, { dueDate: tomorrowStr });
    if (!updated) {
      return {
        text: `Failed to move task in the database.`,
        receipt: { type: 'reschedule', summary: 'Reschedule failed', success: false },
      };
    }

    return {
      text: `📅 Rescheduled **"${target.title}"** to tomorrow (${tomorrowStr}). Take a breather today!`,
      receipt: {
        type: 'reschedule',
        summary: `Task "${target.title}" moved to ${tomorrowStr}`,
        success: true,
        data: updated,
      },
    };
  }

  // 9. SCHEDULE A MEETING ("Schedule a meeting for Friday", "Schedule meeting with team at 2 PM")
  if (lower.startsWith('schedule a meeting') || lower.startsWith('schedule meeting') || lower.startsWith('set a meeting')) {
    const temporal = parseTemporalExpression(trimmed);
    const titleMatch = trimmed.match(/meeting(?:\s+with|\s+about|\s+for)?\s+([^,.]+)/i);
    let meetingTitle = titleMatch && titleMatch[1] ? `Meeting: ${titleMatch[1].trim()}` : 'Scheduled Meeting';

    // Capitalize properly
    meetingTitle = meetingTitle.replace(/\s+(for|at|on)\s+(friday|tomorrow|next week|\d+).*/i, '');
    if (!meetingTitle.toLowerCase().includes('meeting')) {
      meetingTitle = `Meeting: ${meetingTitle}`;
    }

    const newTask = await storage.createTask({
      title: meetingTitle,
      description: `Meeting scheduled via LifeOS Assistant for ${temporal.dateStr} at ${temporal.timeStr}`,
      status: 'pending',
      priority: 'medium',
      category: 'Meeting',
      dueDate: temporal.dateStr,
      dueTime: temporal.timeStr,
      recurrence: 'none',
      subtasks: [
        { id: `meet-${Date.now()}-1`, title: 'Prepare agenda notes', completed: false },
        { id: `meet-${Date.now()}-2`, title: 'Check conferencing link', completed: false },
      ],
      tags: ['Meeting', 'Calendar'],
      estimatedMinutes: 45,
    });

    return {
      text: `🤝 Scheduled **"${newTask.title}"** for **${temporal.dateStr} at ${temporal.timeStr}**. I have also generated agenda checklist subtasks for you.`,
      receipt: {
        type: 'create_task',
        summary: `Meeting created for ${temporal.dateStr} at ${temporal.timeStr}`,
        success: true,
        data: newTask,
      },
    };
  }

  // 10. CREATE / ADD GENERAL TASK ("Add task ...", "Create task ...", "Schedule ...")
  if (lower.startsWith('create task') || lower.startsWith('add task') || lower.startsWith('schedule task') || lower.startsWith('new task')) {
    const cleanPrompt = trimmed.replace(/^(create|add|schedule|new)\s+task\s+/i, '');
    const temporal = parseTemporalExpression(cleanPrompt);
    const category = detectCategory(cleanPrompt);
    const priority = detectPriority(cleanPrompt);

    // Clean title
    let title = cleanPrompt
      .replace(/\s+(tomorrow|today|yesterday|next week).*/i, '')
      .replace(/\s+(at\s+)?\d{1,2}(:\d{2})?\s*(am|pm).*/i, '')
      .replace(/\s+(on|for)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday).*/i, '')
      .trim();

    if (!title) title = cleanPrompt;
    title = title.charAt(0).toUpperCase() + title.slice(1);

    const newTask = await storage.createTask({
      title,
      description: `Created via LifeOS AI Assistant. Priority: ${priority.toUpperCase()}.`,
      status: 'pending',
      priority,
      category,
      dueDate: temporal.dateStr,
      dueTime: temporal.timeStr,
      recurrence: 'none',
      subtasks: [],
      tags: [category],
      estimatedMinutes: 30,
    });

    return {
      text: `✅ Created new task: **"${newTask.title}"** due on **${temporal.dateStr} at ${temporal.timeStr}** [Category: ${category}, Priority: ${priority}].`,
      receipt: {
        type: 'create_task',
        summary: `Created task "${newTask.title}"`,
        success: true,
        data: newTask,
      },
    };
  }

  // 11. REMEMBER USER INFORMATION ("Remember that I like coffee at 9 AM", "Remember my friend's birthday is June 4")
  if (lower.startsWith('remember that') || lower.startsWith('remember: ') || lower.startsWith('remember ')) {
    const content = trimmed.replace(/^remember(\s+that|:\s*)?/i, '').trim();
    if (!content) {
      return { text: `What information would you like me to remember?` };
    }

    const key = `user_fact_${Date.now()}`;
    const memory = await storage.createMemory(key, content, 'fact');

    return {
      text: `🧠 Got it! I have safely stored this memory: *"${content}"*. I will keep this in mind for your future planning.`,
      receipt: {
        type: 'remember',
        summary: `Stored memory: "${content}"`,
        success: true,
        data: memory,
      },
    };
  }

  // 12. SUMMARY / PRODUCTIVITY OVERVIEW ("Summarize my day", "Daily summary", "How am I doing today?")
  if (lower.includes('summarize') || lower.includes('daily summary') || lower.includes('how am i doing')) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const activeReminders = reminders.filter(r => !r.isCompleted).length;

    return {
      text: `📊 **Here is your LifeOS Daily Productivity Summary:**\n\n` +
        `• **Completion Rate:** ${rate}%\n` +
        `• **Total Tasks:** ${total} (${completed} completed, ${pending} pending)\n` +
        `• **Active Reminders:** ${activeReminders}\n` +
        `• **Stored Memories:** ${memories.length} preferences retained\n\n` +
        (rate >= 75
          ? `🌟 Outstanding momentum! You are crushing your goals today.`
          : rate >= 40
          ? `⚡ Steady progress! Focus on your highest priority item next.`
          : `🚀 Time to get moving! Pick one small 15-minute task to build momentum.`),
    };
  }

  // 13. CLARIFICATION / FALLBACK CONVERSATION
  return {
    text: `I'm here to help manage your life and schedule! I can:\n\n` +
      `• **Reminders:** *"Remind me to complete my assignment tomorrow at 10 AM"*\n` +
      `• **Schedule Review:** *"What are my tasks for today?"* or *"What important work is pending?"*\n` +
      `• **Planning:** *"Schedule a meeting for Friday"* or *"Create a study plan for the next 7 days"*\n` +
      `• **Updates:** *"I completed my React assignment"* or *"Move my pending task to tomorrow"*\n` +
      `• **Memory:** *"Remember that I prefer morning workouts"* \n\n` +
      `What would you like me to do next?`,
  };
}

/**
 * Fallback to real OpenAI Chat Completion if API key is provided
 */
async function callOpenAIAssistant(
  userPrompt: string,
  context: { tasks: Task[]; reminders: Reminder[]; memories: Memory[]; profile: any; todayStr: string },
  apiKey: string
): Promise<AIResponse | null> {
  const systemPrompt = `You are LifeOS Copilot, an elite personal intelligence productivity assistant.
Current date: ${context.todayStr}.
User Name: ${context.profile?.name || 'User'}.
Existing tasks summary: ${context.tasks.length} tasks (${context.tasks.filter(t => t.status === 'completed').length} completed).
Existing pending tasks: ${JSON.stringify(context.tasks.filter(t => t.status !== 'completed').slice(0, 10).map(t => ({ id: t.id, title: t.title, priority: t.priority, dueDate: t.dueDate })))}.
User memories: ${JSON.stringify(context.memories.map(m => m.content))}.

Always respond concisely, professionally, and warmly. If user is asking to create, complete, or reschedule, specify clear steps.
Never claim an action was written to the database if you did not execute it.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: context.profile?.aiModel || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  return { text };
}
