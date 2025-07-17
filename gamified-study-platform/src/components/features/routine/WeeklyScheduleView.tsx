import React, { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Clock, BookOpen, Coffee, Dumbbell, Utensils, Settings } from 'lucide-react';
import { useRoutineStore } from '../../../store/routineStore';
import { useCourseStore } from '../../../store/courseStore';
import { ScheduleSlotModal } from './ScheduleSlotModal';
import { RoutineSelector } from './RoutineSelector';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import type { Routine, ScheduleSlot, WeeklySchedule, ActivityType } from '../../../types';

interface WeeklyScheduleViewProps {
  routine: Routine | null;
  onRoutineChange: (routine: Routine) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  study: <BookOpen className="w-4 h-4" />,
  break: <Coffee className="w-4 h-4" />,
  exercise: <Dumbbell className="w-4 h-4" />,
  meal: <Utensils className="w-4 h-4" />,
  custom: <Settings className="w-4 h-4" />,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  study: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200',
  break: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
  exercise: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200',
  meal: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200',
  custom: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200',
};

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  routine,
  onRoutineChange,
}) => {
  const {
    routines,
    weeklyView,
    getWeeklySchedule,
    updateScheduleSlot,
    recordSlotCompletion,
    selectedDate,
  } = useRoutineStore();
  
  const { courses } = useCourseStore();
  
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Load weekly schedule when routine changes
  useEffect(() => {
    if (routine) {
      getWeeklySchedule(routine.id);
    }
  }, [routine, getWeeklySchedule]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination || !routine) return;

    const { source, destination, draggableId } = result;
    
    // Parse destination
    const [destDay, destTime] = destination.droppableId.split('-').map(Number);
    const slot = routine.scheduleSlots.find(s => s.id === draggableId);
    
    if (!slot) return;

    // Calculate new end time based on slot duration
    const startTime = new Date(`1970-01-01T${slot.startTime}`);
    const endTime = new Date(`1970-01-01T${slot.endTime}`);
    const duration = endTime.getTime() - startTime.getTime();
    
    const newStartTime = `${destTime.toString().padStart(2, '0')}:00`;
    const newEndDate = new Date(`1970-01-01T${newStartTime}`);
    newEndDate.setTime(newEndDate.getTime() + duration);
    const newEndTime = `${newEndDate.getHours().toString().padStart(2, '0')}:${newEndDate.getMinutes().toString().padStart(2, '0')}`;

    try {
      await updateScheduleSlot(slot.id, {
        dayOfWeek: destDay,
        startTime: newStartTime,
        endTime: newEndTime,
      });
    } catch (error) {
      console.error('Failed to move schedule slot:', error);
    }
  }, [routine, updateScheduleSlot]);

  const handleSlotClick = (slot: ScheduleSlot) => {
    setSelectedSlot(slot);
    setShowSlotModal(true);
  };

  const handleTimeSlotClick = (day: number, time: string) => {
    if (!routine) return;
    
    setSelectedDay(day);
    setSelectedTime(time);
    setSelectedSlot(null);
    setShowSlotModal(true);
  };

  const handleSlotCompletion = async (slot: ScheduleSlot, completed: boolean) => {
    const today = selectedDate.toISOString().split('T')[0];
    await recordSlotCompletion(slot.id, today, completed);
  };

  const getSlotForTimeAndDay = (day: number, hour: number): ScheduleSlot | null => {
    if (!routine) return null;
    
    return routine.scheduleSlots.find(slot => {
      if (slot.dayOfWeek !== day) return false;
      
      const slotStart = new Date(`1970-01-01T${slot.startTime}`);
      const slotEnd = new Date(`1970-01-01T${slot.endTime}`);
      const currentTime = new Date(`1970-01-01T${hour.toString().padStart(2, '0')}:00`);
      
      return currentTime >= slotStart && currentTime < slotEnd;
    }) || null;
  };

  const getSlotHeight = (slot: ScheduleSlot): number => {
    const start = new Date(`1970-01-01T${slot.startTime}`);
    const end = new Date(`1970-01-01T${slot.endTime}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(1, durationHours) * 60; // 60px per hour
  };

  const getSlotTop = (slot: ScheduleSlot): number => {
    const start = new Date(`1970-01-01T${slot.startTime}`);
    const minutes = start.getHours() * 60 + start.getMinutes();
    return minutes; // 1px per minute
  };

  const getCourseNameById = (courseId?: string): string => {
    if (!courseId) return '';
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : '';
  };

  if (!routine) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Routine Selected</h3>
          <p className="mb-4">Select a routine to view and edit your weekly schedule.</p>
          <RoutineSelector
            routines={routines}
            selectedRoutine={routine}
            onSelect={onRoutineChange}
          />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Routine Selector */}
      <div className="flex items-center justify-between">
        <RoutineSelector
          routines={routines}
          selectedRoutine={routine}
          onSelect={onRoutineChange}
        />
        
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          {selectedDate.toLocaleDateString()}
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <Card className="overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-8 min-h-[800px]">
            {/* Time Column */}
            <div className="border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
                Time
              </div>
              {TIME_SLOTS.map((time, index) => (
                <div
                  key={time}
                  className="h-[60px] border-b border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="border-r border-gray-200 dark:border-gray-700 relative">
                {/* Day Header */}
                <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800">
                  {day}
                </div>

                {/* Time Slots */}
                <div className="relative" style={{ height: '1440px' }}>
                  {TIME_SLOTS.map((time, timeIndex) => {
                    const slot = getSlotForTimeAndDay(dayIndex, timeIndex);
                    
                    return (
                      <Droppable
                        key={`${dayIndex}-${timeIndex}`}
                        droppableId={`${dayIndex}-${timeIndex}`}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`absolute w-full h-[60px] border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                              snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900' : ''
                            }`}
                            style={{ top: `${timeIndex * 60}px` }}
                            onClick={() => !slot && handleTimeSlotClick(dayIndex, time)}
                          >
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    );
                  })}

                  {/* Schedule Slots */}
                  {routine.scheduleSlots
                    .filter(slot => slot.dayOfWeek === dayIndex)
                    .map((slot, index) => (
                      <Draggable
                        key={slot.id}
                        draggableId={slot.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`absolute left-1 right-1 rounded-lg border-2 p-2 cursor-pointer transition-all ${
                              ACTIVITY_COLORS[slot.activityType]
                            } ${
                              snapshot.isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'
                            }`}
                            style={{
                              top: `${getSlotTop(slot)}px`,
                              height: `${getSlotHeight(slot)}px`,
                              ...provided.draggableProps.style,
                            }}
                            onClick={() => handleSlotClick(slot)}
                          >
                            <div className="flex items-start gap-2 h-full">
                              {ACTIVITY_ICONS[slot.activityType]}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {slot.activityName || slot.activityType}
                                </div>
                                {slot.courseId && (
                                  <div className="text-xs opacity-75 truncate">
                                    {getCourseNameById(slot.courseId)}
                                  </div>
                                )}
                                <div className="text-xs opacity-75">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                              </div>
                              {slot.priority > 3 && (
                                <Badge variant="secondary" size="sm">
                                  High
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </Card>

      {/* Add Time Slot Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => {
            setSelectedDay(null);
            setSelectedTime(null);
            setSelectedSlot(null);
            setShowSlotModal(true);
          }}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Time Slot
        </Button>
      </div>

      {/* Schedule Slot Modal */}
      {showSlotModal && (
        <ScheduleSlotModal
          routine={routine}
          slot={selectedSlot}
          defaultDay={selectedDay}
          defaultTime={selectedTime}
          onClose={() => setShowSlotModal(false)}
          onSave={() => {
            setShowSlotModal(false);
            if (routine) {
              getWeeklySchedule(routine.id);
            }
          }}
        />
      )}
    </div>
  );
};