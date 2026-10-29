-- Idempotent catalog seed for hosted projects (local db reset still uses supabase/seed.sql).
-- Required before signup: handle_new_user() seeds user_plan with workout_key FKs.

insert into exercises (key, name, muscle, muscle_group, default_sets, default_reps, default_kg, rest_seconds, step, tip, lift_key) values
  ('pu',  'Pull-ups', 'Lats · Biceps', 'Back', 4, 8, 0, 90, 2.5, 'Chin over the bar, control the way down.', null),
  ('row', 'Barbell Row', 'Mid back', 'Back', 4, 8, 60, 90, 2.5, 'Flat back, pull to your lower ribs.', 'row'),
  ('scr', 'Seated Cable Row', 'Mid back', 'Back', 3, 10, 45, 75, 2.5, 'Squeeze your shoulder blades together.', null),
  ('fp',  'Face Pull', 'Rear delts', 'Shoulders', 3, 15, 20, 60, 2.5, 'Pull to eye level, elbows high.', null),
  ('curl','EZ-Bar Curl', 'Biceps', 'Arms', 3, 10, 30, 60, 2.5, 'Keep elbows still at your sides.', null),
  ('sq',  'Back Squat', 'Quads · Glutes', 'Legs', 4, 6, 90, 150, 2.5, 'Hit parallel, drive through mid-foot.', 'squat'),
  ('rdl', 'Romanian Deadlift', 'Hamstrings', 'Legs', 3, 8, 80, 120, 2.5, 'Hips back, soft knees, bar close.', null),
  ('lp',  'Leg Press', 'Quads', 'Legs', 3, 12, 160, 90, 5, 'Full depth without lifting your hips.', null),
  ('lu',  'Walking Lunges', 'Glutes', 'Legs', 3, 12, 20, 90, 2, 'Long steps, upright torso.', null),
  ('cr',  'Standing Calf Raise', 'Calves', 'Legs', 4, 15, 60, 45, 2.5, 'Pause at the top for a second.', null),
  ('bp',  'Barbell Bench Press', 'Chest', 'Chest', 4, 8, 70, 120, 2.5, 'Aim for 72.5 kg on your last set.', 'bench'),
  ('idp', 'Incline Dumbbell Press', 'Upper chest', 'Chest', 3, 10, 24, 90, 2, 'Slow 3-second lowering phase.', null),
  ('cf',  'Cable Fly', 'Chest', 'Chest', 3, 12, 15, 60, 2.5, 'Squeeze for one second in the middle.', null),
  ('dip', 'Dips', 'Chest · Triceps', 'Chest', 3, 10, 0, 90, 2.5, 'Lean forward slightly to hit the chest.', null),
  ('rp',  'Rope Pushdown', 'Triceps', 'Arms', 3, 12, 27, 60, 2.5, 'Keep elbows pinned to your sides.', null),
  ('ote', 'Overhead Triceps Extension', 'Triceps', 'Arms', 3, 12, 22, 60, 2, 'Full stretch at the bottom.', null),
  ('ohp', 'Overhead Press', 'Shoulders', 'Shoulders', 4, 8, 40, 120, 2.5, 'Brace your core, press straight up.', null),
  ('lr',  'Lateral Raise', 'Side delts', 'Shoulders', 4, 12, 10, 60, 1, 'Lead with the elbows, no swinging.', null),
  ('rdf', 'Rear Delt Fly', 'Rear delts', 'Shoulders', 3, 15, 8, 60, 1, 'Light weight, slow reps.', null),
  ('hlr', 'Hanging Leg Raise', 'Core', 'Core', 3, 12, 0, 60, 2.5, 'Curl your pelvis up, no swinging.', null),
  ('cc',  'Cable Crunch', 'Core', 'Core', 3, 15, 35, 60, 2.5, 'Round your spine, exhale at the bottom.', null),
  ('x1',  'Push-ups', 'Chest', 'Chest', 3, 15, 0, 60, 2.5, 'Body in one line, chest to the floor.', null),
  ('x2',  'Pec Deck Fly', 'Chest', 'Chest', 3, 12, 40, 60, 2.5, 'Slow stretch, squeeze at the front.', null),
  ('x3',  'Skull Crushers', 'Triceps', 'Arms', 3, 10, 25, 75, 2.5, 'Lower to your forehead, elbows in.', null),
  ('x4',  'Hammer Curl', 'Biceps', 'Arms', 3, 12, 14, 60, 2, 'Neutral grip, no swinging.', null),
  ('x5',  'Farmer Carry', 'Core · Grip', 'Core', 3, 30, 28, 60, 2, 'Walk tall for 30 steps.', null)
on conflict (key) do nothing;

insert into workouts (key, name, minutes, kcal, focus) values
  ('back',      'Back & Biceps', 62, 390, array['Lats', 'Mid back', 'Biceps']),
  ('legs',      'Legs', 70, 480, array['Quads', 'Hamstrings', 'Glutes', 'Calves']),
  ('chest',     'Chest & Triceps', 58, 420, array['Chest', 'Upper chest', 'Triceps']),
  ('shoulders', 'Shoulders & Core', 55, 360, array['Shoulders', 'Rear delts', 'Core'])
on conflict (key) do nothing;

insert into workout_exercises (workout_key, exercise_key, position) values
  ('back', 'pu', 1), ('back', 'row', 2), ('back', 'scr', 3), ('back', 'fp', 4), ('back', 'curl', 5),
  ('legs', 'sq', 1), ('legs', 'rdl', 2), ('legs', 'lp', 3), ('legs', 'lu', 4), ('legs', 'cr', 5),
  ('chest', 'bp', 1), ('chest', 'idp', 2), ('chest', 'cf', 3), ('chest', 'dip', 4), ('chest', 'rp', 5), ('chest', 'ote', 6),
  ('shoulders', 'ohp', 1), ('shoulders', 'lr', 2), ('shoulders', 'rdf', 3), ('shoulders', 'hlr', 4), ('shoulders', 'cc', 5)
on conflict (workout_key, exercise_key) do nothing;

insert into foods (key, name, cat, base, kcal, protein, carbs, fats, servings, default_index) values
  ('pt', 'Paneer tikka', 'Protein', '150 g', 330, 24, 8, 22,
     '[{"label":"100 g","m":0.67},{"label":"150 g","m":1},{"label":"200 g","m":1.33},{"label":"250 g","m":1.67}]', 1),
  ('rj', 'Rajma curry', 'Lentils & beans', '1 cup', 240, 13, 38, 4,
     '[{"label":"½ cup","m":0.5},{"label":"1 cup","m":1},{"label":"1½ cups","m":1.5},{"label":"2 cups","m":2}]', 1),
  ('qn', 'Quinoa, cooked', 'Grains', '1 cup', 220, 8, 39, 4,
     '[{"label":"½ cup","m":0.5},{"label":"1 cup","m":1},{"label":"1½ cups","m":1.5},{"label":"2 cups","m":2}]', 1),
  ('sc', 'Soya chunks curry', 'Protein', '1 cup', 260, 26, 18, 9,
     '[{"label":"½ cup","m":0.5},{"label":"1 cup","m":1},{"label":"1½ cups","m":1.5},{"label":"2 cups","m":2}]', 1),
  ('mc', 'Moong dal chilla', 'Breakfast', '2 pieces', 220, 14, 28, 5,
     '[{"label":"1 piece","m":0.5},{"label":"2 pieces","m":1},{"label":"3 pieces","m":1.5},{"label":"4 pieces","m":2}]', 1),
  ('br', 'Brown rice, cooked', 'Grains', '1 cup', 215, 5, 45, 2,
     '[{"label":"½ cup","m":0.5},{"label":"1 cup","m":1},{"label":"1½ cups","m":1.5},{"label":"2 cups","m":2}]', 1),
  ('sb', 'Mixed veg sabzi', 'Vegetables', '1 cup', 120, 3, 14, 6,
     '[{"label":"½ cup","m":0.5},{"label":"1 cup","m":1},{"label":"1½ cups","m":1.5},{"label":"2 cups","m":2}]', 1),
  ('bn', 'Banana', 'Fruit', '1 medium', 105, 1, 27, 0,
     '[{"label":"½ medium","m":0.5},{"label":"1 medium","m":1},{"label":"2 medium","m":2}]', 1),
  ('pb', 'Peanut butter', 'Snacks', '1 tbsp', 95, 4, 3, 8,
     '[{"label":"1 tbsp","m":1},{"label":"2 tbsp","m":2},{"label":"3 tbsp","m":3}]', 0),
  ('gy', 'Greek yogurt', 'Dairy', '200 g', 130, 20, 8, 1,
     '[{"label":"100 g","m":0.5},{"label":"200 g","m":1},{"label":"300 g","m":1.5}]', 1),
  ('ws', 'Whey protein shake', 'Protein', '1 scoop', 120, 24, 3, 1,
     '[{"label":"½ scoop","m":0.5},{"label":"1 scoop","m":1},{"label":"2 scoops","m":2}]', 1),
  ('dt', 'Dal tadka', 'Lentils & beans', '1 cup', 180, 10, 24, 4,
     '[{"label":"½ cup","m":0.5},{"label":"1 cup","m":1},{"label":"1½ cups","m":1.5},{"label":"2 cups","m":2}]', 1),
  ('rt', 'Whole wheat roti', 'Grains', '2 rotis', 200, 7, 36, 3,
     '[{"label":"1 roti","m":0.5},{"label":"2 rotis","m":1},{"label":"3 rotis","m":1.5},{"label":"4 rotis","m":2}]', 1),
  ('al', 'Almonds', 'Snacks', '20 g', 120, 4, 4, 10,
     '[{"label":"10 g","m":0.5},{"label":"20 g","m":1},{"label":"30 g","m":1.5},{"label":"40 g","m":2}]', 1),
  ('ap', 'Apple', 'Fruit', '1 medium', 95, 0, 25, 0,
     '[{"label":"½ medium","m":0.5},{"label":"1 medium","m":1},{"label":"2 medium","m":2}]', 1),
  ('pk', 'Paneer bhurji', 'Protein', '150 g', 330, 24, 6, 18,
     '[{"label":"100 g","m":0.67},{"label":"150 g","m":1},{"label":"200 g","m":1.33},{"label":"250 g","m":1.67}]', 1)
on conflict (key) do nothing;
