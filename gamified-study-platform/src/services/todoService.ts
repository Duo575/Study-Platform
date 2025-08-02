import { supabase } from '../lib/supabase';
import {
  TodoItem,
  TodoForm,
  TodoFilters,
  APIResponse,
  PaginatedResponse,
} from '../types';

export class TodoService {
  /**
   * Create a new todo item
   */
  static async createTodo(todoData: TodoForm): Promise<APIResponse<TodoItem>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const todoItem = {
        title: todoData.title,
        description: todoData.description,
        priority: todoData.priority,
        estimated_minutes: todoData.estimatedMinutes,
        course_id: todoData.courseId,
        due_date: todoData.dueDate?.toISOString(),
        user_id: user.id,
        completed: false,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('todos')
        .insert([todoItem])
        .select('*')
        .single();

      if (error) throw error;

      return {
        data: this.transformTodoFromDB(data),
        message: 'Todo created successfully',
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating todo:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create todo'
      );
    }
  }

  /**
   * Get todos with filtering and pagination
   */
  static async getTodos(
    filters: TodoFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<TodoItem>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('todos')
        .select('*, courses(name, color)', { count: 'exact' })
        .eq('user_id', user.id);

      // Apply filters
      if (filters.completed !== undefined) {
        query = query.eq('completed', filters.completed);
      }

      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      if (filters.courseId) {
        query = query.eq('course_id', filters.courseId);
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      // Apply due date filters
      if (filters.dueDate) {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        switch (filters.dueDate) {
          case 'today':
            query = query
              .gte('due_date', today.toISOString())
              .lt(
                'due_date',
                new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
              );
            break;
          case 'week':
            query = query
              .gte('due_date', today.toISOString())
              .lte('due_date', weekFromNow.toISOString());
            break;
          case 'overdue':
            query = query
              .lt('due_date', today.toISOString())
              .eq('completed', false);
            break;
        }
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';

      const sortColumn = this.mapSortColumn(sortBy);
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const todos = data?.map(this.transformTodoFromDB) || [];
      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: todos,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        meta: {
          filters,
          sort: sortBy,
          order: sortOrder,
        },
      };
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch todos'
      );
    }
  }

  /**
   * Update a todo item
   */
  static async updateTodo(
    id: string,
    updates: Partial<TodoForm>
  ): Promise<APIResponse<TodoItem>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {};

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined)
        updateData.description = updates.description;
      if (updates.priority !== undefined)
        updateData.priority = updates.priority;
      if (updates.estimatedMinutes !== undefined)
        updateData.estimated_minutes = updates.estimatedMinutes;
      if (updates.courseId !== undefined)
        updateData.course_id = updates.courseId;
      if (updates.dueDate !== undefined)
        updateData.due_date = updates.dueDate?.toISOString();

      const { data, error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) throw error;

      return {
        data: this.transformTodoFromDB(data),
        message: 'Todo updated successfully',
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating todo:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to update todo'
      );
    }
  }

  /**
   * Toggle todo completion status
   */
  static async toggleTodo(
    id: string
  ): Promise<APIResponse<{ todo: TodoItem; xpEarned: number }>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current todo
      const { data: currentTodo, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const newCompletedStatus = !currentTodo.completed;
      const completedAt = newCompletedStatus ? new Date().toISOString() : null;

      // Update todo
      const { data, error } = await supabase
        .from('todos')
        .update({
          completed: newCompletedStatus,
          completed_at: completedAt,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) throw error;

      // Calculate XP reward for completion
      let xpEarned = 0;
      if (newCompletedStatus) {
        xpEarned = this.calculateXPReward(
          currentTodo.priority,
          currentTodo.estimated_minutes
        );

        // Award XP to user (this would integrate with gamification service)
        // await GamificationService.awardXP(user.id, xpEarned, 'todo_completion')
      }

      return {
        data: {
          todo: this.transformTodoFromDB(data),
          xpEarned,
        },
        message: newCompletedStatus
          ? 'Todo completed! XP awarded.'
          : 'Todo marked as incomplete',
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to toggle todo'
      );
    }
  }

  /**
   * Delete a todo item
   */
  static async deleteTodo(id: string): Promise<APIResponse<void>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return {
        data: undefined,
        message: 'Todo deleted successfully',
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete todo'
      );
    }
  }

  /**
   * Get todo statistics
   */
  static async getTodoStats(): Promise<
    APIResponse<{
      total: number;
      completed: number;
      pending: number;
      overdue: number;
      completionRate: number;
      totalEstimatedTime: number;
      completedTime: number;
    }>
  > {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: todos, error } = await supabase
        .from('todos')
        .select('completed, estimated_minutes, due_date')
        .eq('user_id', user.id);

      if (error) throw error;

      const now = new Date();
      const stats = todos?.reduce(
        (acc: any, todo: any) => {
          acc.total++;
          acc.totalEstimatedTime += todo.estimated_minutes;

          if (todo.completed) {
            acc.completed++;
            acc.completedTime += todo.estimated_minutes;
          } else {
            acc.pending++;
            if (todo.due_date && new Date(todo.due_date) < now) {
              acc.overdue++;
            }
          }

          return acc;
        },
        {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
          totalEstimatedTime: 0,
          completedTime: 0,
        }
      ) || {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        totalEstimatedTime: 0,
        completedTime: 0,
      };

      const completionRate =
        stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

      return {
        data: {
          ...stats,
          completionRate: Math.round(completionRate * 100) / 100,
        },
        message: 'Todo statistics retrieved successfully',
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching todo stats:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch todo statistics'
      );
    }
  }

  /**
   * Transform database todo to TodoItem type
   */
  private static transformTodoFromDB(dbTodo: any): TodoItem {
    return {
      id: dbTodo.id,
      title: dbTodo.title,
      description: dbTodo.description,
      completed: dbTodo.completed,
      priority: dbTodo.priority,
      estimatedMinutes: dbTodo.estimated_minutes,
      courseId: dbTodo.course_id,
      questId: dbTodo.quest_id,
      dueDate: dbTodo.due_date ? new Date(dbTodo.due_date) : undefined,
      createdAt: new Date(dbTodo.created_at),
      completedAt: dbTodo.completed_at
        ? new Date(dbTodo.completed_at)
        : undefined,
    };
  }

  /**
   * Map sort column names
   */
  private static mapSortColumn(sortBy: string): string {
    const columnMap: Record<string, string> = {
      created_at: 'created_at',
      due_date: 'due_date',
      priority: 'priority',
      estimated_time: 'estimated_minutes',
    };
    return columnMap[sortBy] || 'created_at';
  }

  /**
   * Calculate XP reward based on priority and estimated time
   */
  private static calculateXPReward(
    priority: 'low' | 'medium' | 'high',
    estimatedMinutes: number
  ): number {
    const basePriorityXP = {
      low: 10,
      medium: 20,
      high: 30,
    };

    const timeBonus = Math.floor(estimatedMinutes / 15) * 5; // 5 XP per 15 minutes
    return basePriorityXP[priority] + timeBonus;
  }
}
