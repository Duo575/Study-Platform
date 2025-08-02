import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { RoutineService } from '../services/routineService';
import type {
  Routine,
  ScheduleSlot,
  RoutineTemplate,
  RoutineSuggestion,
  RoutineState,
  RoutineForm,
  ScheduleSlotForm,
  WeeklySchedule,
  RoutineAnalytics,
  RoutineFilters,
} from '../types';

interface RoutineStore extends RoutineState {
  // Actions
  fetchRoutines: () => Promise<void>;
  createRoutine: (routineData: RoutineForm) => Promise<Routine>;
  updateRoutine: (id: string, updates: Partial<RoutineForm>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  toggleRoutineActive: (id: string, isActive: boolean) => Promise<void>;
  setActiveRoutine: (routine: Routine | null) => void;

  // Schedule slot actions
  createScheduleSlot: (slotData: ScheduleSlotForm) => Promise<ScheduleSlot>;
  updateScheduleSlot: (
    id: string,
    updates: Partial<ScheduleSlotForm>
  ) => Promise<void>;
  deleteScheduleSlot: (id: string) => Promise<void>;
  getWeeklySchedule: (routineId: string) => Promise<WeeklySchedule>;

  // Performance tracking
  recordSlotCompletion: (
    slotId: string,
    date: string,
    completed: boolean,
    actualDuration?: number,
    qualityRating?: number,
    notes?: string
  ) => Promise<void>;
  calculateDailyPerformance: (routineId: string, date: string) => Promise<void>;

  // Templates
  fetchTemplates: () => Promise<void>;
  createRoutineFromTemplate: (
    templateId: string,
    name: string
  ) => Promise<Routine>;

  // Analytics
  getRoutineAnalytics: (routineId: string) => Promise<RoutineAnalytics>;

  // Suggestions
  fetchSuggestions: () => Promise<void>;
  generateSuggestions: () => Promise<void>;
  applySuggestion: (suggestionId: string) => Promise<void>;
  dismissSuggestion: (suggestionId: string) => Promise<void>;

  // Filters and UI state
  setFilters: (filters: Partial<RoutineFilters>) => void;
  setSelectedDate: (date: Date) => void;
  setWeeklyView: (weeklyView: WeeklySchedule) => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useRoutineStore = create<RoutineStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      routines: [],
      activeRoutine: null,
      templates: [],
      suggestions: [],
      isLoading: false,
      error: null,
      filters: {
        search: '',
        isActive: true,
        sortBy: 'created_at',
        sortOrder: 'desc',
      },
      selectedDate: new Date(),
      weeklyView: {},

      // Actions
      fetchRoutines: async () => {
        set({ isLoading: true, error: null });
        try {
          const routines = await RoutineService.getRoutines();
          set({ routines, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch routines',
            isLoading: false,
          });
        }
      },

      createRoutine: async (routineData: RoutineForm) => {
        set({ isLoading: true, error: null });
        try {
          const newRoutine = await RoutineService.createRoutine(routineData);
          set(state => ({
            routines: [newRoutine, ...state.routines],
            isLoading: false,
          }));
          return newRoutine;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create routine',
            isLoading: false,
          });
          throw error;
        }
      },

      updateRoutine: async (id: string, updates: Partial<RoutineForm>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedRoutine = await RoutineService.updateRoutine(
            id,
            updates
          );
          set(state => ({
            routines: state.routines.map(routine =>
              routine.id === id ? updatedRoutine : routine
            ),
            activeRoutine:
              state.activeRoutine?.id === id
                ? updatedRoutine
                : state.activeRoutine,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update routine',
            isLoading: false,
          });
        }
      },

      deleteRoutine: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await RoutineService.deleteRoutine(id);
          set(state => ({
            routines: state.routines.filter(routine => routine.id !== id),
            activeRoutine:
              state.activeRoutine?.id === id ? null : state.activeRoutine,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete routine',
            isLoading: false,
          });
        }
      },

      toggleRoutineActive: async (id: string, isActive: boolean) => {
        try {
          await RoutineService.toggleRoutineActive(id, isActive);
          set(state => ({
            routines: state.routines.map(routine =>
              routine.id === id ? { ...routine, isActive } : routine
            ),
            activeRoutine:
              state.activeRoutine?.id === id
                ? { ...state.activeRoutine, isActive }
                : state.activeRoutine,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to toggle routine status',
          });
        }
      },

      setActiveRoutine: (routine: Routine | null) => {
        set({ activeRoutine: routine });
      },

      // Schedule slot actions
      createScheduleSlot: async (slotData: ScheduleSlotForm) => {
        set({ isLoading: true, error: null });
        try {
          const newSlot = await RoutineService.createScheduleSlot(slotData);

          // Update the routine with the new slot
          set(state => ({
            routines: state.routines.map(routine =>
              routine.id === slotData.routineId
                ? {
                    ...routine,
                    scheduleSlots: [...routine.scheduleSlots, newSlot],
                  }
                : routine
            ),
            activeRoutine:
              state.activeRoutine?.id === slotData.routineId &&
              state.activeRoutine
                ? {
                    ...state.activeRoutine,
                    scheduleSlots: [
                      ...state.activeRoutine.scheduleSlots,
                      newSlot,
                    ],
                  }
                : state.activeRoutine,
            isLoading: false,
          }));

          return newSlot;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create schedule slot',
            isLoading: false,
          });
          throw error;
        }
      },

      updateScheduleSlot: async (
        id: string,
        updates: Partial<ScheduleSlotForm>
      ) => {
        set({ isLoading: true, error: null });
        try {
          const updatedSlot = await RoutineService.updateScheduleSlot(
            id,
            updates
          );

          set(state => ({
            routines: state.routines.map(routine => ({
              ...routine,
              scheduleSlots: routine.scheduleSlots.map(slot =>
                slot.id === id ? updatedSlot : slot
              ),
            })),
            activeRoutine: state.activeRoutine
              ? {
                  ...state.activeRoutine,
                  scheduleSlots: state.activeRoutine.scheduleSlots.map(slot =>
                    slot.id === id ? updatedSlot : slot
                  ),
                }
              : null,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update schedule slot',
            isLoading: false,
          });
        }
      },

      deleteScheduleSlot: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await RoutineService.deleteScheduleSlot(id);

          set(state => ({
            routines: state.routines.map(routine => ({
              ...routine,
              scheduleSlots: routine.scheduleSlots.filter(
                slot => slot.id !== id
              ),
            })),
            activeRoutine: state.activeRoutine
              ? {
                  ...state.activeRoutine,
                  scheduleSlots: state.activeRoutine.scheduleSlots.filter(
                    slot => slot.id !== id
                  ),
                }
              : null,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete schedule slot',
            isLoading: false,
          });
        }
      },

      getWeeklySchedule: async (routineId: string) => {
        try {
          const weeklySchedule =
            await RoutineService.getWeeklySchedule(routineId);
          set({ weeklyView: weeklySchedule });
          return weeklySchedule;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch weekly schedule',
          });
          throw error;
        }
      },

      // Performance tracking
      recordSlotCompletion: async (
        slotId: string,
        date: string,
        completed: boolean,
        actualDuration?: number,
        qualityRating?: number,
        notes?: string
      ) => {
        try {
          await RoutineService.recordSlotCompletion(
            slotId,
            date,
            completed,
            actualDuration,
            qualityRating,
            notes
          );

          // Optionally refresh routine data to show updated completion status
          const { activeRoutine } = get();
          if (activeRoutine) {
            await get().calculateDailyPerformance(activeRoutine.id, date);
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to record slot completion',
          });
        }
      },

      calculateDailyPerformance: async (routineId: string, date: string) => {
        try {
          await RoutineService.calculateDailyPerformance(routineId, date);
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to calculate daily performance',
          });
        }
      },

      // Templates
      fetchTemplates: async () => {
        set({ isLoading: true, error: null });
        try {
          const templates = await RoutineService.getRoutineTemplates();
          set({ templates, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch templates',
            isLoading: false,
          });
        }
      },

      createRoutineFromTemplate: async (templateId: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const newRoutine = await RoutineService.createRoutineFromTemplate(
            templateId,
            name
          );
          set(state => ({
            routines: [newRoutine, ...state.routines],
            isLoading: false,
          }));
          return newRoutine;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create routine from template',
            isLoading: false,
          });
          throw error;
        }
      },

      // Analytics
      getRoutineAnalytics: async (routineId: string) => {
        try {
          return await RoutineService.getRoutineAnalytics(routineId);
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch routine analytics',
          });
          throw error;
        }
      },

      // Suggestions
      fetchSuggestions: async () => {
        set({ isLoading: true, error: null });
        try {
          const suggestions = await RoutineService.getRoutineSuggestions();
          set({ suggestions, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch suggestions',
            isLoading: false,
          });
        }
      },

      generateSuggestions: async () => {
        try {
          await RoutineService.generateSuggestions();
          await get().fetchSuggestions(); // Refresh suggestions
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to generate suggestions',
          });
        }
      },

      applySuggestion: async (suggestionId: string) => {
        try {
          await RoutineService.applySuggestion(suggestionId);
          set(state => ({
            suggestions: state.suggestions.map(suggestion =>
              suggestion.id === suggestionId
                ? { ...suggestion, isApplied: true, appliedAt: new Date() }
                : suggestion
            ),
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to apply suggestion',
          });
        }
      },

      dismissSuggestion: async (suggestionId: string) => {
        try {
          await RoutineService.dismissSuggestion(suggestionId);
          set(state => ({
            suggestions: state.suggestions.filter(
              suggestion => suggestion.id !== suggestionId
            ),
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to dismiss suggestion',
          });
        }
      },

      // Filters and UI state
      setFilters: (filters: Partial<RoutineFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      setSelectedDate: (date: Date) => {
        set({ selectedDate: date });
      },

      setWeeklyView: (weeklyView: WeeklySchedule) => {
        set({ weeklyView });
      },

      // Error handling
      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'routine-store',
    }
  )
);
