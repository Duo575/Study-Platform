import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSeasonalEvents } from '../../hooks/useAchievements';
import type { SeasonalEvent } from '../../types';

interface SeasonalEventsProps {
  className?: string;
}

/**
 * Seasonal Events Component
 * Displays active and upcoming seasonal events with special achievements
 */
export function SeasonalEvents({ className = '' }: SeasonalEventsProps) {
  const [selectedEvent, setSelectedEvent] = useState<SeasonalEvent | null>(null);
  
  const {
    events,
    isLoading,
    error,
    getActiveEvents,
    getUpcomingEvents,
    activeEventsCount,
    upcomingEventsCount
  } = useSeasonalEvents();

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Events</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const activeEvents = getActiveEvents();
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Seasonal Events</h2>
          <p className="text-gray-600">
            Special challenges and limited-time achievements
          </p>
        </div>
        
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeEventsCount}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{upcomingEventsCount}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
        </div>
      </div>

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Active Events
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isActive={true}
                onClick={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Upcoming Events
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isActive={false}
                onClick={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Events */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events available</h3>
          <p className="text-gray-600">
            Check back later for exciting seasonal events and challenges!
          </p>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

/**
 * Individual Event Card
 */
function EventCard({ 
  event, 
  isActive, 
  onClick 
}: { 
  event: SeasonalEvent; 
  isActive: boolean; 
  onClick: () => void; 
}) {
  const getTimeRemaining = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  };

  const getEventIcon = (eventName: string) => {
    if (eventName.toLowerCase().includes('halloween')) return '🎃';
    if (eventName.toLowerCase().includes('christmas')) return '🎄';
    if (eventName.toLowerCase().includes('new year')) return '🎊';
    if (eventName.toLowerCase().includes('valentine')) return '💝';
    if (eventName.toLowerCase().includes('summer')) return '☀️';
    if (eventName.toLowerCase().includes('spring')) return '🌸';
    if (eventName.toLowerCase().includes('winter')) return '❄️';
    if (eventName.toLowerCase().includes('fall')) return '🍂';
    return '🎉';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
        isActive
          ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
          : 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">
            {getEventIcon(event.name)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{event.name}</h3>
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isActive ? 'ACTIVE' : 'UPCOMING'}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {isActive ? 'Ends in' : 'Starts in'}
          </div>
          <div className="text-lg font-bold text-gray-700">
            {getTimeRemaining(isActive ? event.endDate : event.startDate)}
          </div>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">
        {event.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-500">🏆</span>
            <span className="text-sm font-medium text-gray-700">
              {event.achievements.length} achievements
            </span>
          </div>
          
          {event.specialRewards.xpMultiplier && (
            <div className="flex items-center space-x-1">
              <span className="text-blue-500">⭐</span>
              <span className="text-sm font-medium text-gray-700">
                {event.specialRewards.xpMultiplier}x XP
              </span>
            </div>
          )}
        </div>
        
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View Details →
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Event Detail Modal
 */
function EventDetailModal({ 
  event, 
  onClose 
}: { 
  event: SeasonalEvent; 
  onClose: () => void; 
}) {
  const isActive = new Date() >= event.startDate && new Date() <= event.endDate;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 ${
          isActive ? 'bg-green-50' : 'bg-blue-50'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {event.name}
              </h2>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {isActive ? 'ACTIVE NOW' : 'UPCOMING EVENT'}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>

          {/* Event Duration */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Duration</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Starts</div>
                  <div className="text-gray-900">{formatDate(event.startDate)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Ends</div>
                  <div className="text-gray-900">{formatDate(event.endDate)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Rewards */}
          {(event.specialRewards.xpMultiplier || 
            event.specialRewards.exclusiveBadges?.length || 
            event.specialRewards.limitedTimeItems?.length) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Rewards</h3>
              <div className="space-y-2">
                {event.specialRewards.xpMultiplier && (
                  <div className="flex items-center space-x-2 bg-blue-50 rounded-lg p-3">
                    <span className="text-blue-500">⭐</span>
                    <span className="text-blue-800 font-medium">
                      {event.specialRewards.xpMultiplier}x XP Multiplier
                    </span>
                  </div>
                )}
                
                {event.specialRewards.exclusiveBadges?.map(badge => (
                  <div key={badge} className="flex items-center space-x-2 bg-purple-50 rounded-lg p-3">
                    <span className="text-purple-500">🏅</span>
                    <span className="text-purple-800 font-medium">
                      Exclusive Badge: {badge}
                    </span>
                  </div>
                ))}
                
                {event.specialRewards.limitedTimeItems?.map(item => (
                  <div key={item} className="flex items-center space-x-2 bg-orange-50 rounded-lg p-3">
                    <span className="text-orange-500">🎁</span>
                    <span className="text-orange-800 font-medium">
                      Limited Item: {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event Achievements */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Event Achievements ({event.achievements.length})
            </h3>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-500">🏆</span>
                <span className="text-yellow-800 font-medium">
                  Complete special challenges to unlock exclusive achievements!
                </span>
              </div>
              <p className="text-yellow-700 text-sm">
                These achievements are only available during this event and won't be obtainable afterwards.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            {isActive ? (
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                Participate Now! 🎉
              </button>
            ) : (
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                Set Reminder 🔔
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SeasonalEvents;