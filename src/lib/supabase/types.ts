
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "chat_messages": {
                  Row: {
                    "card": boolean,"created_at": string,"id": string,"role": string,"text": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "card"?: boolean,"created_at"?: string,"id"?: string,"role": string,"text": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "card"?: boolean,"created_at"?: string,"id"?: string,"role"?: string,"text"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"custom_foods": {
                  Row: {
                    "base": string,"carbs": number,"cat": string,"created_at": string,"fats": number,"id": string,"kcal": number,"name": string,"protein": number,"servings": NonNullable<Json>,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "base"?: string,"carbs"?: number,"cat"?: string,"created_at"?: string,"fats"?: number,"id"?: string,"kcal"?: number,"name": string,"protein"?: number,"servings"?: NonNullable<Json>,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "base"?: string,"carbs"?: number,"cat"?: string,"created_at"?: string,"fats"?: number,"id"?: string,"kcal"?: number,"name"?: string,"protein"?: number,"servings"?: NonNullable<Json>,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"custom_routines": {
                  Row: {
                    "created_at": string,"exercise_keys": (string)[],"id": string,"name": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"exercise_keys"?: (string)[],"id"?: string,"name": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"exercise_keys"?: (string)[],"id"?: string,"name"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"exercises": {
                  Row: {
                    "default_kg": number,"default_reps": number,"default_sets": number,"key": string,"lift_key": string | null,"muscle": string,"muscle_group": string,"name": string,"rest_seconds": number,"step": number,"tip": string
                  }
                  ComputedFields: never
                  Insert: {
                    "default_kg"?: number,"default_reps"?: number,"default_sets"?: number,"key": string,"lift_key"?: string | null,"muscle"?: string,"muscle_group"?: string,"name": string,"rest_seconds"?: number,"step"?: number,"tip"?: string
                  }
                  Update: {
                    "default_kg"?: number,"default_reps"?: number,"default_sets"?: number,"key"?: string,"lift_key"?: string | null,"muscle"?: string,"muscle_group"?: string,"name"?: string,"rest_seconds"?: number,"step"?: number,"tip"?: string
                  }
                  Relationships: [
                    
                  ]
                },"feedback": {
                  Row: {
                    "created_at": string,"email": string,"id": string,"message": string,"type": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email"?: string,"id"?: string,"message": string,"type": string,"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"id"?: string,"message"?: string,"type"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"foods": {
                  Row: {
                    "base": string,"carbs": number,"cat": string,"default_index": number,"fats": number,"kcal": number,"key": string,"name": string,"protein": number,"servings": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "base"?: string,"carbs"?: number,"cat"?: string,"default_index"?: number,"fats"?: number,"kcal"?: number,"key": string,"name": string,"protein"?: number,"servings"?: NonNullable<Json>
                  }
                  Update: {
                    "base"?: string,"carbs"?: number,"cat"?: string,"default_index"?: number,"fats"?: number,"kcal"?: number,"key"?: string,"name"?: string,"protein"?: number,"servings"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"meal_entries": {
                  Row: {
                    "carbs": number,"created_at": string,"fats": number,"food_key": string | null,"id": string,"kcal": number,"logged_on": string,"meal": string,"name": string,"protein": number,"serving_label": string,"servings": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "carbs"?: number,"created_at"?: string,"fats"?: number,"food_key"?: string | null,"id"?: string,"kcal"?: number,"logged_on": string,"meal": string,"name": string,"protein"?: number,"serving_label"?: string,"servings"?: number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "carbs"?: number,"created_at"?: string,"fats"?: number,"food_key"?: string | null,"id"?: string,"kcal"?: number,"logged_on"?: string,"meal"?: string,"name"?: string,"protein"?: number,"serving_label"?: string,"servings"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "meal_entries_food_key_fkey"
      columns: ["food_key"]
isOneToOne: false
      referencedRelation: "foods"
      referencedColumns: ["key"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "age": number,"created_at": string,"current_weight": number | null,"diet": string,"email": string,"experience": string,"goal": string,"goal_weight": number,"height_cm": number,"id": string,"name": string,"notif_coach": boolean,"notif_reminders": boolean,"notif_weekly": boolean,"onboarding_completed": boolean,"settings": NonNullable<Json>,"start_weight": number,"target_carbs": number,"target_fats": number,"target_kcal": number,"target_protein": number,"units": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "age"?: number,"created_at"?: string,"current_weight"?: number | null,"diet"?: string,"email"?: string,"experience"?: string,"goal"?: string,"goal_weight"?: number,"height_cm"?: number,"id": string,"name"?: string,"notif_coach"?: boolean,"notif_reminders"?: boolean,"notif_weekly"?: boolean,"onboarding_completed"?: boolean,"settings"?: NonNullable<Json>,"start_weight"?: number,"target_carbs"?: number,"target_fats"?: number,"target_kcal"?: number,"target_protein"?: number,"units"?: string,"updated_at"?: string
                  }
                  Update: {
                    "age"?: number,"created_at"?: string,"current_weight"?: number | null,"diet"?: string,"email"?: string,"experience"?: string,"goal"?: string,"goal_weight"?: number,"height_cm"?: number,"id"?: string,"name"?: string,"notif_coach"?: boolean,"notif_reminders"?: boolean,"notif_weekly"?: boolean,"onboarding_completed"?: boolean,"settings"?: NonNullable<Json>,"start_weight"?: number,"target_carbs"?: number,"target_fats"?: number,"target_kcal"?: number,"target_protein"?: number,"units"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"session_sets": {
                  Row: {
                    "created_at": string,"done": boolean,"exercise_key": string,"id": string,"kg": number,"reps": number,"session_id": string,"set_no": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"done"?: boolean,"exercise_key": string,"id"?: string,"kg"?: number,"reps": number,"session_id": string,"set_no": number,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"done"?: boolean,"exercise_key"?: string,"id"?: string,"kg"?: number,"reps"?: number,"session_id"?: string,"set_no"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "session_sets_exercise_key_fkey"
      columns: ["exercise_key"]
isOneToOne: false
      referencedRelation: "exercises"
      referencedColumns: ["key"]
    },{
      foreignKeyName: "session_sets_session_id_fkey"
      columns: ["session_id"]
isOneToOne: false
      referencedRelation: "workout_sessions"
      referencedColumns: ["id"]
    }
                  ]
                },"user_plan": {
                  Row: {
                    "created_at": string,"dow": number,"id": string,"updated_at": string,"user_id": string,"workout_key": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"dow": number,"id"?: string,"updated_at"?: string,"user_id": string,"workout_key": string
                  }
                  Update: {
                    "created_at"?: string,"dow"?: number,"id"?: string,"updated_at"?: string,"user_id"?: string,"workout_key"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_plan_workout_key_fkey"
      columns: ["workout_key"]
isOneToOne: false
      referencedRelation: "workouts"
      referencedColumns: ["key"]
    }
                  ]
                },"weight_logs": {
                  Row: {
                    "created_at": string,"id": string,"kg": number,"logged_on": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"kg": number,"logged_on": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"kg"?: number,"logged_on"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"workout_exercises": {
                  Row: {
                    "exercise_key": string,"id": string,"position": number,"workout_key": string
                  }
                  ComputedFields: never
                  Insert: {
                    "exercise_key": string,"id"?: string,"position"?: number,"workout_key": string
                  }
                  Update: {
                    "exercise_key"?: string,"id"?: string,"position"?: number,"workout_key"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "workout_exercises_exercise_key_fkey"
      columns: ["exercise_key"]
isOneToOne: false
      referencedRelation: "exercises"
      referencedColumns: ["key"]
    },{
      foreignKeyName: "workout_exercises_workout_key_fkey"
      columns: ["workout_key"]
isOneToOne: false
      referencedRelation: "workouts"
      referencedColumns: ["key"]
    }
                  ]
                },"workout_extras": {
                  Row: {
                    "created_at": string,"exercise_key": string,"id": string,"updated_at": string,"user_id": string,"workout_key": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"exercise_key": string,"id"?: string,"updated_at"?: string,"user_id": string,"workout_key": string
                  }
                  Update: {
                    "created_at"?: string,"exercise_key"?: string,"id"?: string,"updated_at"?: string,"user_id"?: string,"workout_key"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "workout_extras_exercise_key_fkey"
      columns: ["exercise_key"]
isOneToOne: false
      referencedRelation: "exercises"
      referencedColumns: ["key"]
    },{
      foreignKeyName: "workout_extras_workout_key_fkey"
      columns: ["workout_key"]
isOneToOne: false
      referencedRelation: "workouts"
      referencedColumns: ["key"]
    }
                  ]
                },"workout_sessions": {
                  Row: {
                    "created_at": string,"id": string,"minutes": number,"name": string,"performed_on": string,"updated_at": string,"user_id": string,"volume_kg": number,"workout_key": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"minutes"?: number,"name": string,"performed_on": string,"updated_at"?: string,"user_id": string,"volume_kg"?: number,"workout_key": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"minutes"?: number,"name"?: string,"performed_on"?: string,"updated_at"?: string,"user_id"?: string,"volume_kg"?: number,"workout_key"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "workout_sessions_workout_key_fkey"
      columns: ["workout_key"]
isOneToOne: false
      referencedRelation: "workouts"
      referencedColumns: ["key"]
    }
                  ]
                },"workouts": {
                  Row: {
                    "focus": (string)[],"kcal": number,"key": string,"minutes": number,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "focus"?: (string)[],"kcal"?: number,"key": string,"minutes"?: number,"name": string
                  }
                  Update: {
                    "focus"?: (string)[],"kcal"?: number,"key"?: string,"minutes"?: number,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "lift_history": {
                  Row: {
                    "kg": number | null,"lift": string | null,"logged_on": string,"user_id": string
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "regenerate_plan":
{ Args: { "p_user": string }; Returns: undefined
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const

/* ─────────────────── row aliases (keep call-sites terse) ─────────────────── */

export type TablesOf<K extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][K]['Row'];

export type ProfileRow = TablesOf<'profiles'>;
export type WeightLogRow = TablesOf<'weight_logs'>;
export type PlanRow = TablesOf<'user_plan'>;
export type ExtraRow = TablesOf<'workout_extras'>;
export type RoutineRow = TablesOf<'custom_routines'>;
export type SessionRow = TablesOf<'workout_sessions'>;
export type SessionSetRow = TablesOf<'session_sets'>;
export type MealEntryRow = TablesOf<'meal_entries'>;
export type CustomFoodRow = TablesOf<'custom_foods'>;
export type ChatRow = TablesOf<'chat_messages'>;
export type LiftHistoryRow = Database['public']['Views']['lift_history']['Row'];
