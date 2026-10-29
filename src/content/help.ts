/**
 * FitAI Help & Info System - Canonical Content Repository
 * Single typed source of truth for both inline InfoTips and the full Help Center.
 * Tone: Direct, warm, concise, sentence case, no emoji, no ungrounded medical claims.
 */

export interface HelpTopic {
  id: string;
  sectionId: HelpSectionId;
  title: string;
  short: string;
  howTo: string;
  tip: string;
  defaultExample?: string;
  keywords?: string[];
}

export type HelpSectionId =
  | 'getting-started'
  | 'dashboard'
  | 'workouts'
  | 'workout-details'
  | 'active-workout'
  | 'nutrition'
  | 'food-search'
  | 'progress'
  | 'coach'
  | 'profile'
  | 'onboarding'
  | 'glossary'
  | 'faq'
  | 'privacy'
  | 'feedback';

export interface HelpSection {
  id: HelpSectionId;
  title: string;
  description: string;
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    description: 'Learn the core principles of FitAI and how daily tracking powers your AI coach.',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Understand every ring, bar, and stat card on your main home screen.',
  },
  {
    id: 'workouts',
    title: 'Workouts',
    description: 'Master your weekly schedule, AI-generated training splits, and routine management.',
  },
  {
    id: 'workout-details',
    title: 'Workout Details',
    description: 'Learn how exercises, planned volume, and Nova coaching notes work before you train.',
  },
  {
    id: 'active-workout',
    title: 'Active Workout',
    description: 'How to track live sets, weight, rest countdowns, and finish your session.',
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    description: 'Calculate remaining calories, track macronutrients, and log whole food meals.',
  },
  {
    id: 'food-search',
    title: 'Food Search',
    description: 'Find foods in the database, adjust serving sizes, and log custom items.',
  },
  {
    id: 'progress',
    title: 'Progress',
    description: 'Interpret weight trends, progressive overload charts, and weekly consistency.',
  },
  {
    id: 'coach',
    title: 'AI Coach (Nova)',
    description: 'How Nova simulates coaching using your real workout and nutrition data.',
  },
  {
    id: 'profile',
    title: 'Profile & Settings',
    description: 'Manage personal targets, recalculations, sound toggles, and data retention.',
  },
  {
    id: 'onboarding',
    title: 'Onboarding & Goals',
    description: 'Why FitAI asks for your stats and how targets are personalized from day one.',
  },
  {
    id: 'glossary',
    title: 'Glossary',
    description: 'Plain-language definitions of key fitness, lifting, and nutrition terms.',
  },
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Answers to frequently asked questions about tracking, formulas, and privacy.',
  },
  {
    id: 'privacy',
    title: 'Privacy and your data',
    description: 'How your personal logs are stored client-side on this device without tracking.',
  },
  {
    id: 'feedback',
    title: 'Contact and feedback',
    description: 'Report issues, request features, or share suggestions directly with the team.',
  },
];

export const HELP_TOPICS: Record<string, HelpTopic> = {
  // --- DASHBOARD ---
  'calories-ring': {
    id: 'calories-ring',
    sectionId: 'dashboard',
    title: 'Calories',
    short: 'Energy from the food you log today. Your target is set from your goal, weight and activity. Staying close to it helps you reach your goal.',
    howTo: 'Log meals through the Nutrition tab or Quick search. As you log foods, the outer ring sweeps clockwise toward 100%.',
    tip: 'Aim to land within 100 kcal of your daily target rather than trying to hit the exact single calorie.',
    defaultExample: 'If your target is 2,400 kcal and you logged 1,640 kcal, you have 760 kcal left.',
    keywords: ['calories', 'kcal', 'energy', 'intake', 'target', 'burn', 'ring'],
  },
  'protein-target': {
    id: 'protein-target',
    sectionId: 'dashboard',
    title: 'Protein',
    short: 'Builds and repairs muscle. Your daily protein target is based on your body weight and goal.',
    howTo: 'Eat protein across your breakfast, lunch, dinner and snacks. The inner violet ring tracks your progress in grams.',
    tip: 'Distribute your protein fairly evenly across 3 to 4 meals to keep muscle protein synthesis elevated throughout the day.',
    defaultExample: 'A 75 kg lifter aiming for muscle gain usually targets around 150 to 160 g of protein daily.',
    keywords: ['protein', 'macros', 'grams', 'repair', 'muscle', 'synthesis'],
  },
  'workout-status': {
    id: 'workout-status',
    sectionId: 'dashboard',
    title: "Today's workout status",
    short: "Shows whether you have a planned session today, are currently resting, or have already completed your workout.",
    howTo: 'Tap "Start Workout" or the workout card to open details and start recording your sets.',
    tip: 'If you need to move a workout to another day, tap My Workouts and pick any training day from the calendar.',
    defaultExample: 'Displays "Chest & Triceps · 48 min" with a Done or Start status.',
    keywords: ['workout', 'today', 'status', 'training', 'scheduled', 'done'],
  },
  'goal-progress': {
    id: 'goal-progress',
    sectionId: 'dashboard',
    title: 'Goal progress',
    short: 'How far you are from start weight to goal weight. Formula: (current - start) / (goal - start).',
    howTo: 'Log your morning weight consistently. The circular progress ring updates automatically with each new weigh-in.',
    tip: 'Weigh yourself first thing in the morning after using the bathroom for the most consistent measurements.',
    defaultExample: 'Starting at 78 kg with a goal of 74 kg: reaching 76 kg represents exactly 50% goal progress.',
    keywords: ['goal', 'progress', 'weight', 'formula', 'percent', 'target'],
  },
  'weight-trend': {
    id: 'weight-trend',
    sectionId: 'dashboard',
    title: 'Weight trend',
    short: 'A smoothed 30-day line tracking your true weight change past daily water fluctuations.',
    howTo: 'Log at least 3 to 4 mornings a week. The chart plots individual entries and shows whether your average is moving in the right direction.',
    tip: 'Daily jumps of 0.5 to 1.5 kg are almost always water or digestion, not fat or muscle.',
    defaultExample: 'Down 0.8 kg over the last 30 days indicates steady fat loss.',
    keywords: ['weight', 'trend', 'scale', 'average', 'history', 'fluctuation'],
  },
  'nutrition-card': {
    id: 'nutrition-card',
    sectionId: 'dashboard',
    title: 'Today’s nutrition card',
    short: 'A snapshot of today’s calorie intake, macro split, and remaining food budget.',
    howTo: 'Tap anywhere on the card or use Quick actions to log additional foods.',
    tip: 'Check this card before dinner to see whether you should prioritize lean protein or healthy fats.',
    defaultExample: 'Shows 1,640 / 2,400 kcal logged with protein, carbs, and fat breakdown.',
    keywords: ['nutrition', 'summary', 'food', 'meals', 'snapshot'],
  },
  'coach-card': {
    id: 'coach-card',
    sectionId: 'dashboard',
    title: 'AI Coach card',
    short: 'Nova highlights your biggest win or highest-priority action for today using your own logs.',
    howTo: 'Tap the card or "Ask Nova" to open the coach chat and ask follow-up questions.',
    tip: 'Nova adapts comments based on whether you worked out today and your current protein pacing.',
    defaultExample: 'Nova: "Bench press was up 2.5 kg yesterday. Hit 160 g protein today to maximize recovery."',
    keywords: ['nova', 'coach', 'ai', 'insight', 'tip', 'advice'],
  },

  // --- WORKOUTS ---
  'ai-plan': {
    id: 'ai-plan',
    sectionId: 'workouts',
    title: 'AI-generated plan',
    short: 'A multi-week split designed by Nova matching your goal, experience level, and preferred schedule.',
    howTo: 'Follow the assigned workouts each week. Tap "Regenerate plan" if your schedule or fitness focus changes.',
    tip: 'Consistency beats variety: sticking with the same core compound lifts for 6 to 12 weeks builds the best strength.',
    defaultExample: '4-day upper/lower split focusing on progressive overload for chest, back, and legs.',
    keywords: ['plan', 'routine', 'split', 'schedule', 'regenerate', 'program'],
  },
  'calendar-statuses': {
    id: 'calendar-statuses',
    sectionId: 'workouts',
    title: 'Week calendar statuses',
    short: 'Done indicates completed sessions, Today is active, Planned shows upcoming sessions, and Rest marks recovery days.',
    howTo: 'Tap any day in the weekly calendar to view its exercises, planned volume, and completion records.',
    tip: 'Rest days are when muscles actually repair and grow stronger. Treat recovery with the same respect as training.',
    defaultExample: 'Monday: Done · Tuesday: Done · Wednesday: Rest · Thursday: Today.',
    keywords: ['calendar', 'statuses', 'done', 'today', 'planned', 'rest'],
  },
  'muscle-groups': {
    id: 'muscle-groups',
    sectionId: 'workouts',
    title: 'Muscle groups',
    short: 'The primary muscle groups targeted during the selected session, such as Chest, Triceps, or Back.',
    howTo: 'Review the targeted groups before lifting to warm up the relevant joints and supporting muscles.',
    tip: 'Training each major muscle group 2 times per week is ideal for hypertrophy and muscle retention.',
    defaultExample: 'Chest & Triceps activates the pectorals, anterior deltoids, and tricep extensors.',
    keywords: ['muscle', 'groups', 'chest', 'back', 'legs', 'shoulders', 'arms'],
  },
  'custom-routines': {
    id: 'custom-routines',
    sectionId: 'workouts',
    title: 'My routines',
    short: 'Your saved weekly training structure and custom exercise additions.',
    howTo: 'Select a workout day to see its exercise list. Tap "+ Add Exercise" to add supplementary movements.',
    tip: 'Start with 4 to 6 focused exercises per session. Adding too many junk volume sets reduces recovery.',
    defaultExample: 'Adding Incline Dumbbell Press to Chest & Triceps day.',
    keywords: ['routines', 'custom', 'exercises', 'planner', 'structure'],
  },

  // --- WORKOUT DETAILS ---
  'sets-reps-weight-rest': {
    id: 'sets-reps-weight-rest',
    sectionId: 'workout-details',
    title: 'Sets, reps, weight & rest',
    short: 'A rep is one movement. A set is a group of reps. Weight is in kg. Rest is the break between sets.',
    howTo: 'Follow the prescribed reps and kg targets. Adjust weights in active workout mode as you grow stronger.',
    tip: 'Take full rest (2 to 3 minutes on compound lifts) so you can lift maximum weight on subsequent sets.',
    defaultExample: 'Bench Press: 4 sets of 8 reps at 70 kg with 90 seconds rest.',
    keywords: ['sets', 'reps', 'weight', 'rest', 'definitions', 'steppers'],
  },
  'session-estimate': {
    id: 'session-estimate',
    sectionId: 'workout-details',
    title: 'Session estimate (planned volume)',
    short: 'Total planned workload calculated as sum of (sets × reps × kg), plus expected duration and longest rest.',
    howTo: 'Review the session estimate before you train to budget enough time for full warm-up and rest intervals.',
    tip: 'Gradually increasing session volume week over week is the definition of progressive overload.',
    defaultExample: 'Planned volume of ~6,400 kg across 18 total sets taking roughly 48 minutes.',
    keywords: ['estimate', 'volume', 'planned', 'duration', 'workload'],
  },
  'nova-notes': {
    id: 'nova-notes',
    sectionId: 'workout-details',
    title: 'Notes from Nova',
    short: 'AI coaching guidance specific to the selected workout, including form cues and suggested weight increases.',
    howTo: 'Read Nova’s notes before lifting to know which lifts have weight bumps or technique cues.',
    tip: 'Nova suggests a 2.5 kg increase when you hit the top rep target on all sets of an exercise.',
    defaultExample: 'Nova: "Bench press target bumped to 70 kg this week. Keep your shoulder blades pinned."',
    keywords: ['notes', 'nova', 'form', 'cues', 'technique', 'tips'],
  },

  // --- ACTIVE WORKOUT ---
  'workout-timer': {
    id: 'workout-timer',
    sectionId: 'active-workout',
    title: 'Workout timer',
    short: 'Tracks the elapsed time since you started your session. Pauses automatically if you close the tab.',
    howTo: 'Runs continuously while you log sets. Elapsed minutes are saved when you finish your workout.',
    tip: 'Aim to keep your main lifting sessions between 45 and 70 minutes to manage fatigue.',
    defaultExample: 'Timer shows 34:12 during an active session.',
    keywords: ['timer', 'elapsed', 'duration', 'clock', 'time'],
  },
  'volume-stat': {
    id: 'volume-stat',
    sectionId: 'active-workout',
    title: 'Volume',
    short: 'Total weight lifted: kg × reps for every completed set in this session.',
    howTo: 'As you check off completed sets, volume rolls up live so you see your total work accumulating.',
    tip: 'Compare volume across matching sessions in the Progress tab to verify long-term progression.',
    defaultExample: 'Completing 3 sets of 10 reps at 60 kg adds 1,800 kg to your session volume.',
    keywords: ['volume', 'tonnage', 'weight', 'reps', 'kg', 'total'],
  },
  'set-row-tracking': {
    id: 'set-row-tracking',
    sectionId: 'active-workout',
    title: 'Set row (kg/reps/check)',
    short: 'Use + and − buttons to adjust weight and reps for each set, then tap the checkmark when finished.',
    howTo: 'Adjust kg or reps to match what you actually lifted. Checking the box triggers haptics and starts your rest timer.',
    tip: 'Always log your actual reps, even if you fell short of the target. Accurate logs help Nova calibrate weights.',
    defaultExample: 'Set 1: 70 kg × 8 reps [✓].',
    keywords: ['set', 'row', 'stepper', 'check', 'reps', 'weight', 'complete'],
  },
  'rest-timer': {
    id: 'rest-timer',
    sectionId: 'active-workout',
    title: 'Rest timer',
    short: 'An automatic countdown ring that starts right after you check off a set. Skippable at any time.',
    howTo: 'Watch the ring count down to zero, or tap "Skip rest" if you feel ready for your next set early.',
    tip: 'Rushing your rest reduces the weight you can lift on subsequent sets. Take the full rest on heavy compounds.',
    defaultExample: 'Rest timer counting down from 90 seconds after completing a heavy set.',
    keywords: ['rest', 'timer', 'countdown', 'ring', 'skip', 'recovery'],
  },
  'finish-workout': {
    id: 'finish-workout',
    sectionId: 'active-workout',
    title: 'Complete exercise vs Finish & save',
    short: 'Complete exercise marks all sets in the current movement. Finish & save records the entire workout to your history.',
    howTo: 'When all exercises are finished, tap Finish & save. Your stats, streaks, and progress charts update immediately.',
    tip: 'If you have to leave early, tapping Finish & save saves partial volume rather than discarding your work.',
    defaultExample: 'Finish & save logs 16 sets, 5,420 kg volume, and 46 minutes duration.',
    keywords: ['finish', 'save', 'complete', 'exercise', 'session', 'submit'],
  },

  // --- NUTRITION ---
  'remaining-calories': {
    id: 'remaining-calories',
    sectionId: 'nutrition',
    title: 'Remaining calories',
    short: 'How many calories you have left to eat today based on your daily target minus logged food.',
    howTo: 'Watch this number adjust down as you log breakfast, lunch, dinner, and snacks.',
    tip: 'If you work out hard, resist the urge to eat back all estimated calories so you maintain steady progress.',
    defaultExample: 'Target 2,400 kcal − Logged 1,640 kcal = 760 kcal remaining.',
    keywords: ['remaining', 'calories', 'budget', 'left', 'available'],
  },
  'macro-split': {
    id: 'macro-split',
    sectionId: 'nutrition',
    title: 'Macros',
    short: 'Protein, carbs and fats: the three nutrients your calories come from. 1g protein = 4 kcal, 1g carb = 4 kcal, 1g fat = 9 kcal.',
    howTo: 'Track the three color-coded progress bars (lime for protein, violet for carbs, amber for fats).',
    tip: 'Hit your protein target first, then fill remaining calories with whole food carbs and fats.',
    defaultExample: '160 g protein (640 kcal), 260 g carbs (1,040 kcal), 80 g fats (720 kcal).',
    keywords: ['macros', 'protein', 'carbs', 'fats', 'macronutrients', 'split'],
  },
  'ai-meal-suggestion': {
    id: 'ai-meal-suggestion',
    sectionId: 'nutrition',
    title: 'AI meal suggestion',
    short: 'A meal recommended by Nova tailored to your dietary preference and remaining daily macros.',
    howTo: 'Tap "Add to dinner" to log the recommended meal with one click, or use search to find an alternative.',
    tip: 'Suggestions take your vegetarian, vegan, or high-protein preferences into account automatically.',
    defaultExample: 'Paneer tikka bowl with brown rice providing 540 kcal and 36 g protein.',
    keywords: ['suggestion', 'ai', 'meal', 'recipe', 'recommendation', 'dish'],
  },
  'serving-size': {
    id: 'serving-size',
    sectionId: 'nutrition',
    title: 'Serving size and number of servings',
    short: 'Serving size is the portion unit (e.g. 100g, 1 cup, 1 piece). Number of servings multiplies the base nutrients.',
    howTo: 'Pick the unit that matches your meal, then use + and − to set how many servings you ate.',
    tip: 'When logging cooked foods like rice or chicken, make sure the portion matches cooked weight, not raw.',
    defaultExample: '1 serving (150 g) of dal = 180 kcal. Selecting 2 servings logs 360 kcal and double the protein.',
    keywords: ['serving', 'size', 'portions', 'multiplier', 'quantity'],
  },
  'meal-log': {
    id: 'meal-log',
    sectionId: 'nutrition',
    title: 'Meal log',
    short: 'Your chronological list of logged items separated by Breakfast, Lunch, Dinner, and Snacks.',
    howTo: 'Tap "Add food" under any meal slot. Tap the delete icon next to any entry if you made a mistake.',
    tip: 'Deleting an item shows an instant Undo toast, allowing you to restore it with one tap.',
    defaultExample: 'Breakfast: Rolled oats with whey protein and almonds (480 kcal, 38 g protein).',
    keywords: ['log', 'meals', 'breakfast', 'lunch', 'dinner', 'snacks', 'entries'],
  },

  // --- FOOD SEARCH ---
  'search-serving': {
    id: 'search-serving',
    sectionId: 'food-search',
    title: 'Serving size chips',
    short: 'Predefined portion sizes available for the selected food item in grams, bowls, pieces, or cups.',
    howTo: 'Tap a serving chip to switch between portion standards before adding.',
    tip: 'Grams (g) are always the most accurate unit if you have a kitchen food scale.',
    defaultExample: 'Chicken breast offers 100 g, 150 g fillet, and 200 g breast portions.',
    keywords: ['serving', 'chips', 'portions', 'units', 'grams', 'cup'],
  },
  'search-servings-count': {
    id: 'search-servings-count',
    sectionId: 'food-search',
    title: 'Number of servings stepper',
    short: 'Multiplies calories, protein, carbs, and fats by your chosen quantity.',
    howTo: 'Use the + and − buttons to adjust by 0.5 increments.',
    tip: 'Eat 1.5 rotis or 0.5 scoop of protein? Set the stepper to 1.5 or 0.5 to keep logs precise.',
    defaultExample: 'Setting 1.5 on a 200 kcal item logs exactly 300 kcal.',
    keywords: ['servings', 'stepper', 'multiplier', 'quantity', 'count'],
  },
  'after-adding-preview': {
    id: 'after-adding-preview',
    sectionId: 'food-search',
    title: 'After adding preview',
    short: 'Shows how logging this food will impact your remaining daily calories and protein target.',
    howTo: 'Review the note before tapping Add to ensure you stay within your daily nutrition budget.',
    tip: 'The preview warns you if an entry will put you over calories or successfully hit your protein target.',
    defaultExample: '“That hits your protein target.” or “520 kcal still available.”',
    keywords: ['preview', 'impact', 'after', 'adding', 'budget', 'check'],
  },
  'custom-food': {
    id: 'custom-food',
    sectionId: 'food-search',
    title: 'Custom food',
    short: 'Allows you to create and log unlisted foods, restaurant dishes, or home recipes by entering macros directly.',
    howTo: 'Switch to the "Custom food" tab, enter name, serving label, kcal, and macros, then tap Add.',
    tip: 'You only need the nutrition facts label from the package to log any packaged food accurately.',
    defaultExample: 'Adding "Mom’s Rajma Chawal" with 450 kcal and 18 g protein.',
    keywords: ['custom', 'food', 'create', 'recipe', 'unlisted', 'label'],
  },

  // --- PROGRESS ---
  'weight-history': {
    id: 'weight-history',
    sectionId: 'progress',
    title: 'Weight history',
    short: 'Daily weigh-in log and interactive line chart over 7 or 30 days.',
    howTo: 'Enter today’s weight in the header form and click Save. The chart updates immediately.',
    tip: 'Weigh in consistently under the same conditions (morning, fasted) to see meaningful trends.',
    defaultExample: 'Hovering points on the chart reveals date and logged weight.',
    keywords: ['weight', 'history', 'chart', 'log', 'scale', 'points'],
  },
  'goal-progress-calc': {
    id: 'goal-progress-calc',
    sectionId: 'progress',
    title: 'Goal progress formula',
    short: 'How far you are from start weight to goal weight. Formula: (current - start) / (goal - start).',
    howTo: 'Tracks whether you are in surplus for muscle gain or deficit for fat loss.',
    tip: 'Progress tracks total distance traveled; setbacks are temporary and don’t reset your baseline.',
    defaultExample: 'Started at 78 kg, current 76 kg, goal 74 kg: (76 − 78) / (74 − 78) = 50%.',
    keywords: ['formula', 'progress', 'goal', 'math', 'percentage', 'calculation'],
  },
  'workout-consistency': {
    id: 'workout-consistency',
    sectionId: 'progress',
    title: 'Workout consistency',
    short: 'How many sessions you complete each week versus your plan.',
    howTo: 'Each bar represents weekly sessions completed out of your 4 planned days.',
    tip: 'Completing 85% or more of planned sessions over 12 weeks guarantees noticeable physical results.',
    defaultExample: '4 of 4 sessions completed this week shows 100% adherence.',
    keywords: ['consistency', 'bars', 'adherence', 'sessions', 'streak'],
  },
  'calorie-trend': {
    id: 'calorie-trend',
    sectionId: 'progress',
    title: 'Calorie trend',
    short: 'Your daily calories compared with your target line.',
    howTo: 'The dashed line represents your daily calorie target. Solid points indicate your logged total for each day.',
    tip: 'Small ups and downs are normal; your weekly average intake determines weight gain or loss.',
    defaultExample: 'Averaging 2,380 kcal against a 2,400 kcal target shows excellent dietary adherence.',
    keywords: ['calorie', 'trend', 'intake', 'average', 'target', 'line'],
  },
  'strength-progress': {
    id: 'strength-progress',
    sectionId: 'progress',
    title: 'Strength progress',
    short: 'Your heaviest completed set for key lifts over time.',
    howTo: 'Highlights progress on core compound lifts like Bench Press, Squat, and Overhead Press.',
    tip: 'Even adding 1 more rep at the same weight counts as progressive overload and stimulates muscle growth.',
    defaultExample: 'Bench Press increased from 67.5 kg to 70 kg (+2.5 kg).',
    keywords: ['strength', 'lifts', 'progress', 'bench', 'squat', 'deadlift', 'overload'],
  },
  'progress-insights': {
    id: 'progress-insights',
    sectionId: 'progress',
    title: 'Nova progress insights',
    short: 'Automated analysis from Nova pointing out what is working, what to watch, and your next step.',
    howTo: 'Read the three insight cards to stay informed on lifting momentum and nutritional gaps.',
    tip: 'Nova spots plateaus early and suggests proactive weight or volume adjustments.',
    defaultExample: '“Bench is up 2.5 kg. Progressive overload is doing its job.”',
    keywords: ['insights', 'analysis', 'working', 'watch', 'next', 'adjustments'],
  },

  // --- AI COACH (NOVA) ---
  'nova-context': {
    id: 'nova-context',
    sectionId: 'coach',
    title: 'What Nova knows today',
    short: 'Nova reads your logged workouts, today’s meals, current weight, and fitness goal to personalize advice.',
    howTo: 'Nova checks your live state before answering so it can mention your real lifts and remaining calories.',
    tip: 'Ask Nova specific questions like "What should I eat for dinner?" or "How was my workout today?"',
    defaultExample: 'Nova knows you hit 70 kg on bench yesterday and have 760 kcal left today.',
    keywords: ['context', 'nova', 'knows', 'workouts', 'meals', 'memory'],
  },
  'data-privacy': {
    id: 'data-privacy',
    sectionId: 'coach',
    title: 'Your data stays private',
    short: 'Your fitness data is stored on this device only. Nova responses are generated client-side without sharing logs.',
    howTo: 'All workouts, meals, weights, and chat history are saved in your browser’s localStorage.',
    tip: 'You can export or clear your local data anytime from Profile & Settings.',
    defaultExample: 'No account servers or external trackers hold your personal health information.',
    keywords: ['privacy', 'device', 'localstorage', 'security', 'client-side'],
  },
  'suggested-prompts': {
    id: 'suggested-prompts',
    sectionId: 'coach',
    title: 'Suggested prompts',
    short: 'Quick starter questions to query your current workout schedule, meal ideas, or progress analysis.',
    howTo: 'Tap any suggested chip to immediately send that prompt to Nova without typing.',
    tip: 'Use suggested prompts after workouts or before meals for quick coaching guidance.',
    defaultExample: '"What workout should I do today?" or "Suggest a high-protein vegetarian meal."',
    keywords: ['prompts', 'suggestions', 'chips', 'questions', 'starter'],
  },

  // --- PROFILE & SETTINGS ---
  'profile-goal': {
    id: 'profile-goal',
    sectionId: 'profile',
    title: 'Fitness goal',
    short: 'Sets your primary objective: Muscle gain (calorie surplus), Fat loss (deficit), or Maintenance.',
    howTo: 'Select a goal card and tap Save changes to update your daily calorie and macronutrient targets.',
    tip: 'Stick with one goal for at least 8 to 12 weeks before switching to see measurable physique changes.',
    defaultExample: 'Muscle gain sets a +250 kcal surplus with 2.0g protein per kg of bodyweight.',
    keywords: ['goal', 'muscle', 'fat', 'loss', 'maintenance', 'surplus', 'deficit'],
  },
  'daily-targets-recalc': {
    id: 'daily-targets-recalc',
    sectionId: 'profile',
    title: 'Daily targets and Recalculate with Nova',
    short: 'Calculates your BMR and TDEE using the Mifflin-St Jeor equation, then splits calories into macros.',
    howTo: 'Enter updated age, height, and weight, then tap "Recalculate with Nova" to update your targets automatically.',
    tip: 'Recalculate your targets whenever your body weight changes by 3 to 5 kg.',
    defaultExample: 'A 75 kg male with muscle goal receives ~2,400 kcal (160g P, 260g C, 80g F).',
    keywords: ['targets', 'recalculate', 'bmr', 'tdee', 'mifflin', 'macros'],
  },
  'profile-experience': {
    id: 'profile-experience',
    sectionId: 'profile',
    title: 'Experience level',
    short: 'Beginner, Intermediate, or Advanced. Determines exercise selection, set volume, and rest recommendations.',
    howTo: 'Choose the level that best reflects your consistent resistance training background.',
    tip: 'Beginners benefit most from simple progressive overload on compound lifts with 3 to 4 sets.',
    defaultExample: 'Intermediate includes 4 training days with periodized progression on main lifts.',
    keywords: ['experience', 'beginner', 'intermediate', 'advanced', 'lifting'],
  },
  'profile-diet': {
    id: 'profile-diet',
    sectionId: 'profile',
    title: 'Dietary preference',
    short: 'Vegetarian, Non-vegetarian, Vegan, or Keto. Tailors Nova’s meal recommendations and recipe suggestions.',
    howTo: 'Pick your dietary lifestyle. FitAI prioritizes foods and meal suggestions matching your choice.',
    tip: 'Vegetarians and vegans receive suggestions emphasizing paneer, tofu, lentils, and plant protein sources.',
    defaultExample: 'Vegetarian prioritizes paneer tikka, dal tadka, and Greek yogurt.',
    keywords: ['diet', 'vegetarian', 'vegan', 'keto', 'preferences', 'nutrition'],
  },
  'profile-notifications': {
    id: 'profile-notifications',
    sectionId: 'profile',
    title: 'Notifications & sounds',
    short: 'Workout reminders, weekly progress summaries, coach tips, and soft audio ticks for app interactions.',
    howTo: 'Toggle individual notification and sound preferences on or off.',
    tip: 'Interface sounds and haptics provide immediate feedback when checking off completed sets.',
    defaultExample: 'Interface sounds play soft ticks for set-complete, save-success, and toasts.',
    keywords: ['notifications', 'sounds', 'haptics', 'reminders', 'audio', 'ticks'],
  },
  'delete-account': {
    id: 'delete-account',
    sectionId: 'profile',
    title: 'Delete account & reset data',
    short: 'Permanently removes your profile, workouts, meals, and weight history from this device.',
    howTo: 'Open the Delete account panel, type DELETE to confirm, and tap Permanently delete.',
    tip: 'Use "Reset demo data" if you just want to restore the original sample week without clearing your account.',
    defaultExample: 'Permanently deletes all records stored under the fitai.state key in your browser.',
    keywords: ['delete', 'account', 'reset', 'clear', 'wipe', 'danger'],
  },

  // --- ONBOARDING ---
  'onboarding-step-1': {
    id: 'onboarding-step-1',
    sectionId: 'onboarding',
    title: 'Why we ask: personal stats',
    short: 'Your age, height, and weight are required to calculate your Basal Metabolic Rate (BMR) and daily calorie burn.',
    howTo: 'Enter accurate measurements so Nova can set a scientifically grounded calorie target.',
    tip: 'We use the Mifflin-St Jeor formula, the gold standard in exercise science.',
    defaultExample: 'Age 26, Height 178 cm, Weight 75 kg yields a baseline BMR of ~1,740 kcal.',
    keywords: ['onboarding', 'stats', 'bmr', 'age', 'height', 'weight'],
  },
  'onboarding-step-2': {
    id: 'onboarding-step-2',
    sectionId: 'onboarding',
    title: 'Why we ask: fitness goal',
    short: 'Your goal determines whether your daily calories are set to a surplus (+250 kcal), deficit (-400 kcal), or maintenance.',
    howTo: 'Choose the single goal that matters most right now: Muscle gain, Fat loss, or Maintenance.',
    tip: 'Trying to gain muscle and lose fat at the same time is slower than focusing on one primary phase.',
    defaultExample: 'Fat loss creates a moderate calorie deficit to promote fat oxidation while preserving muscle.',
    keywords: ['onboarding', 'goal', 'surplus', 'deficit', 'objective'],
  },
  'onboarding-step-3': {
    id: 'onboarding-step-3',
    sectionId: 'onboarding',
    title: 'Why we ask: experience level',
    short: 'Helps Nova gauge your recovery capacity, appropriate set volume, and starting exercise selection.',
    howTo: 'Select how long you have been consistently lifting weights.',
    tip: 'Under-estimating is safer than over-estimating: starting with manageable volume avoids early burnout.',
    defaultExample: 'Intermediate sets 4 training days per week with 16 to 18 sets per workout.',
    keywords: ['onboarding', 'experience', 'training', 'volume', 'capacity'],
  },
  'onboarding-step-4': {
    id: 'onboarding-step-4',
    sectionId: 'onboarding',
    title: 'Why we ask: dietary preference',
    short: 'Ensures meal recommendations, suggested foods, and macro splits match your eating habits.',
    howTo: 'Select Vegetarian, Non-vegetarian, Vegan, or Keto.',
    tip: 'You can change this anytime later in Profile & Settings without resetting your progress.',
    defaultExample: 'Keto shifts your macro split to high fat, moderate protein, and very low carbohydrates.',
    keywords: ['onboarding', 'diet', 'eating', 'lifestyle', 'preferences'],
  },
  'onboarding-step-5': {
    id: 'onboarding-step-5',
    sectionId: 'onboarding',
    title: 'Review targets & plan summary',
    short: 'Nova synthesizes your stats, goal, and diet into your customized calorie and macronutrient targets.',
    howTo: 'Confirm your daily targets before launching your personalized dashboard.',
    tip: 'These targets serve as your initial baseline. Nova will help you calibrate them over time.',
    defaultExample: 'Summary shows 2,400 kcal, 160g protein, and 4-day split.',
    keywords: ['onboarding', 'summary', 'targets', 'baseline', 'launch'],
  },

  // --- GLOSSARY ---
  'glossary-progressive-overload': {
    id: 'glossary-progressive-overload',
    sectionId: 'glossary',
    title: 'Progressive overload',
    short: 'Gradually increasing the weight, reps, or volume lifted over time to continually challenge muscles and stimulate growth.',
    howTo: 'Try to add 1 rep or 1–2.5 kg to your working sets whenever you hit your target reps with good form.',
    tip: 'Progressive overload is the single most important rule for building strength and muscle.',
    defaultExample: 'Lifting 70 kg for 8 reps this week after doing 70 kg for 7 reps last week.',
    keywords: ['progressive', 'overload', 'strength', 'growth', 'adaptation'],
  },
  'glossary-bmr-tdee': {
    id: 'glossary-bmr-tdee',
    sectionId: 'glossary',
    title: 'BMR and TDEE',
    short: 'BMR (Basal Metabolic Rate) is calories burned at complete rest. TDEE (Total Daily Energy Expenditure) adds activity.',
    howTo: 'FitAI calculates your BMR via Mifflin-St Jeor and scales it to TDEE based on training days.',
    tip: 'Your daily target is derived directly from your TDEE plus or minus your goal buffer.',
    defaultExample: 'BMR 1,740 kcal × 1.375 activity multiplier = 2,390 kcal TDEE.',
    keywords: ['bmr', 'tdee', 'metabolism', 'burn', 'formula'],
  },
  'glossary-hypertrophy': {
    id: 'glossary-hypertrophy',
    sectionId: 'glossary',
    title: 'Hypertrophy',
    short: 'The enlargement of muscle tissue through resistance training, adequate protein, and sufficient rest.',
    howTo: 'Train with sets of 6 to 15 reps taken within 1 to 3 reps of muscular failure.',
    tip: 'Hypertrophy requires both mechanical tension from lifting and sufficient dietary protein for repair.',
    defaultExample: 'Working sets of 8 to 12 reps on Romanian Deadlifts or Bench Press.',
    keywords: ['hypertrophy', 'muscle', 'growth', 'reps', 'failure'],
  },
  'glossary-rir': {
    id: 'glossary-rir',
    sectionId: 'glossary',
    title: 'Reps in reserve (RIR)',
    short: 'How many more reps you could have performed before reaching absolute technical failure.',
    howTo: 'Aim for 1 to 2 RIR on most working sets. Stop when your form begins to break down.',
    tip: 'Training to total failure on every set causes excessive fatigue without added muscle growth.',
    defaultExample: 'Stopping at 8 reps when you could have squeezed out 10 equals 2 RIR.',
    keywords: ['rir', 'reserve', 'failure', 'intensity', 'rpe'],
  },

  // --- FAQ ---
  'faq-weighin-timing': {
    id: 'faq-weighin-timing',
    sectionId: 'faq',
    title: 'When should I weigh myself?',
    short: 'Weigh in first thing in the morning after using the bathroom and before eating or drinking.',
    howTo: 'Use the same scale on a hard, flat floor and log the number in FitAI right away.',
    tip: 'Focus on the 30-day weight trend line rather than stressing over single-day spikes.',
    defaultExample: 'Logging 4 mornings per week gives Nova an accurate rolling average.',
    keywords: ['faq', 'weighin', 'morning', 'scale', 'timing'],
  },
  'faq-missed-workout': {
    id: 'faq-missed-workout',
    sectionId: 'faq',
    title: 'What happens if I miss a workout?',
    short: 'Nothing is ruined! Nova marks the session as missed and adjusts your volume across upcoming days.',
    howTo: 'Pick up your next scheduled workout without trying to perform two sessions on the same day.',
    tip: 'Consistency across months matters infinitely more than an occasional missed day.',
    defaultExample: 'Missing Wednesday’s leg session simply shifts leg volume into the following week.',
    keywords: ['faq', 'missed', 'workout', 'skip', 'schedule', 'recovery'],
  },
  'faq-food-accuracy': {
    id: 'faq-food-accuracy',
    sectionId: 'faq',
    title: 'How accurate does my food logging need to be?',
    short: 'Being consistent is more important than being obsessive. Getting within 10% of your targets yields great results.',
    howTo: 'Log the main calorie and protein contributors: grains, meats, dairy, oils, and protein powders.',
    tip: 'Cooking oils and dressings are calorie-dense; remember to log 1 tablespoon of oil if used.',
    defaultExample: 'Logging 2,350 kcal on a 2,400 kcal target is considered a bullseye.',
    keywords: ['faq', 'accuracy', 'food', 'portions', 'logging', 'precision'],
  },

  // --- PRIVACY ---
  'privacy-storage': {
    id: 'privacy-storage',
    sectionId: 'privacy',
    title: 'Client-only local storage',
    short: 'FitAI stores your workouts, meals, weights, and chats exclusively in your browser’s localStorage on this device.',
    howTo: 'Your data stays completely private. No telemetry, third-party analytics, or external trackers are included.',
    tip: 'Because data is stored locally, clearing your browser storage will wipe your logs unless you export them.',
    defaultExample: 'State key `fitai.state.v2` resides exclusively on your machine.',
    keywords: ['privacy', 'storage', 'localstorage', 'device', 'offline', 'telemetry'],
  },
  'privacy-offline': {
    id: 'privacy-offline',
    sectionId: 'privacy',
    title: 'Offline functionality',
    short: 'FitAI is a Progressive Web App (PWA). All features work seamlessly without an active internet connection.',
    howTo: 'Add FitAI to your home screen or bookmark it. Workouts and food logs save even in gym basements with zero reception.',
    tip: 'The offline indicator in the header lets you know when you are operating completely offline.',
    defaultExample: 'Logging sets and meals in airplane mode works identically to online mode.',
    keywords: ['offline', 'pwa', 'airplane', 'cache', 'service', 'worker'],
  },

  // --- FEEDBACK ---
  'feedback-support': {
    id: 'feedback-support',
    sectionId: 'feedback',
    title: 'Feedback and bug reporting',
    short: 'Have an idea for a feature or encountered a bug? Submit it directly using our in-app feedback dialog.',
    howTo: 'Tap "Report a problem / Request a feature" in the sidebar or profile footer to open the modal.',
    tip: 'Feedback is stored locally in `fitai.feedback` and will sync to our development backlog.',
    defaultExample: 'Submit ideas for new whole foods or workout exercises to see them added in updates.',
    keywords: ['feedback', 'support', 'bug', 'report', 'idea', 'feature', 'contact'],
  },
};

export const HELP_DISCLAIMER =
  'FitAI gives general fitness guidance, not medical advice. Talk to a professional before big changes to your diet or training.';

