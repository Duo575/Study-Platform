import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Users, 
  Plus, 
  Play, 
  Pause, 
  Clock, 
  Settings,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  UserPlus,
  LogOut,
  Coffee,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import { useSocialStore } from '../../store/socialStore';
import type { StudyGroup, StudyRoom, StudyRoomParticipant, ParticipantStatus } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface StudyRoomsProps {
  group: StudyGroup;
  className?: string;
}

const StudyRooms: React.FC<StudyRoomsProps> = ({ group, className = '' }) => {
  const { 
    studyRooms, 
    activeStudyRoom, 
    fetchStudyRooms, 
    joinStudyRoom, 
    leaveStudyRoom,
    setActiveStudyRoom,
    isLoading 
  } = useSocialStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(null);

  useEffect(() => {
    fetchStudyRooms(group.id);
  }, [group.id, fetchStudyRooms]);

  const getStatusColor = (status: ParticipantStatus) => {
    switch (status) {
      case 'studying':
        return 'bg-green-500';
      case 'break':
        return 'bg-yellow-500';
      case 'away':
        return 'bg-orange-500';
      case 'offline':
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: ParticipantStatus) => {
    switch (status) {
      case 'studying':
        return <BookOpen className="w-3 h-3 text-white" />;
      case 'break':
        return <Coffee className="w-3 h-3 text-white" />;
      case 'away':
        return <Clock className="w-3 h-3 text-white" />;
      case 'offline':
        return <EyeOff className="w-3 h-3 text-white" />;
    }
  };

  const handleJoinRoom = async (room: StudyRoom) => {
    try {
      await joinStudyRoom(room.id);
      setActiveStudyRoom(room);
      setSelectedRoom(room);
    } catch (error) {
      console.error('Failed to join study room:', error);
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      await leaveStudyRoom(roomId);
      if (activeStudyRoom?.id === roomId) {
        setActiveStudyRoom(null);
        setSelectedRoom(null);
      }
    } catch (error) {
      console.error('Failed to leave study room:', error);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Study Rooms</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Room
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Join virtual study sessions with your group members
        </p>
      </div>

      {/* Study Rooms List */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        ) : studyRooms.length === 0 ? (
          <div className="text-center py-8">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-1">No study rooms yet</h4>
            <p className="text-gray-600 text-sm mb-4">
              Create the first study room to start collaborative sessions!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Study Room
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {studyRooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border-2 rounded-lg p-4 transition-all ${
                  activeStudyRoom?.id === room.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Room Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{room.name}</h4>
                      {room.isActive && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Live
                        </span>
                      )}
                    </div>
                    {room.description && (
                      <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {room.participants.length}/{room.settings.maxParticipants}
                      </span>
                      {room.currentSession && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(room.currentSession.startTime, { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeStudyRoom?.id === room.id ? (
                      <button
                        onClick={() => handleLeaveRoom(room.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinRoom(room)}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        Join
                      </button>
                    )}
                  </div>
                </div>

                {/* Participants */}
                {room.participants.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Participants:</h5>
                    <div className="flex flex-wrap gap-2">
                      {room.participants.map((participant) => (
                        <div
                          key={participant.userId}
                          className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-lg"
                        >
                          <div className="relative">
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                              {participant.avatarUrl ? (
                                <img 
                                  src={participant.avatarUrl} 
                                  alt={participant.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-medium text-gray-600">
                                  {participant.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center ${getStatusColor(participant.status)}`}>
                              {getStatusIcon(participant.status)}
                            </div>
                          </div>
                          <span className="text-sm text-gray-900">{participant.username}</span>
                          {participant.isHost && (
                            <span className="text-xs text-purple-600 font-medium">Host</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Room Settings Preview */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {room.settings.syncPomodoro && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Sync Pomodoro
                    </span>
                  )}
                  {room.settings.allowChat && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Chat Enabled
                    </span>
                  )}
                  {room.settings.shareProgress && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Share Progress
                    </span>
                  )}
                  {room.settings.focusMode && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Focus Mode
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Active Study Room Controls */}
      {activeStudyRoom && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-gray-200 p-6 bg-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              Active Session: {activeStudyRoom.name}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {activeStudyRoom.participants.length} participants
              </span>
            </div>
          </div>

          {/* Study Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
              <Mic className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
              <Camera className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors">
              <Play className="w-6 h-6" />
            </button>
            <button className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
              <Volume2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Session Stats */}
          {activeStudyRoom.currentSession && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {Math.floor(activeStudyRoom.currentSession.duration / 60)}m
                </div>
                <div className="text-sm text-gray-600">Session Time</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {activeStudyRoom.currentSession.stats.totalParticipants}
                </div>
                <div className="text-sm text-gray-600">Participants</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round(activeStudyRoom.currentSession.stats.averageFocusScore)}%
                </div>
                <div className="text-sm text-gray-600">Focus Score</div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Study Room</h3>
            <p className="text-gray-600 text-sm mb-4">
              Study room creation form coming soon! This will allow you to create virtual study spaces with customizable settings.
            </p>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                Synchronized Pomodoro timers
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                Real-time participant status
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                Shared progress tracking
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="w-4 h-4" />
                Focus mode with distractions blocked
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyRooms;