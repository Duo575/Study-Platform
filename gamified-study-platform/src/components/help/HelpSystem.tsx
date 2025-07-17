import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Book,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Mail,
  FileText,
  Video,
  Lightbulb,
  Target,
  Trophy,
  Timer,
  Users,
  Settings,
  Shield,
  Smartphone,
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: React.ReactNode;
  lastUpdated: string;
  readTime: number;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I earn XP and level up?',
    answer:
      'You earn XP by completing study tasks, finishing quests, maintaining study streaks, and taking care of your virtual pet. Different activities award different amounts of XP based on difficulty and time invested.',
    category: 'Gamification',
    tags: ['xp', 'leveling', 'points', 'progress'],
  },
  {
    id: '2',
    question: 'What happens if I miss a day of studying?',
    answer:
      "Missing a day will break your study streak, but don't worry! Your XP and progress are saved. Your virtual pet might show signs of neglect, but you can quickly get back on track by resuming your study routine.",
    category: 'Study Habits',
    tags: ['streak', 'missed day', 'pet care', 'routine'],
  },
  {
    id: '3',
    question: 'How does the quest system work?',
    answer:
      "Quests are automatically generated based on your course syllabi. You'll get daily quests for regular study tasks, weekly quests for larger goals, and milestone quests for major achievements. Complete them to earn XP and unlock rewards.",
    category: 'Quests',
    tags: ['quests', 'automatic', 'syllabus', 'rewards'],
  },
  {
    id: '4',
    question: 'Can I study offline?',
    answer:
      "Yes! The app works offline for basic features like the Pomodoro timer, todo list, and viewing your courses. Your progress will sync automatically when you're back online.",
    category: 'Technical',
    tags: ['offline', 'sync', 'internet', 'mobile'],
  },
  {
    id: '5',
    question: 'How do I join a study group?',
    answer:
      'Go to the Study Groups page and either create a new group or join an existing one using an invite code. Study groups allow you to share progress, compete on leaderboards, and participate in group challenges.',
    category: 'Social Features',
    tags: ['study groups', 'invite code', 'social', 'collaboration'],
  },
  {
    id: '6',
    question: 'Is my data safe and private?',
    answer:
      'Absolutely! We use industry-standard encryption and security practices. Your study data is stored securely, and we never share your personal information with third parties. You can export or delete your data at any time.',
    category: 'Privacy & Security',
    tags: ['privacy', 'security', 'data', 'encryption'],
  },
  {
    id: '7',
    question: 'How do I reset my password?',
    answer:
      'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a reset link via email. If you don\'t see the email, check your spam folder.',
    category: 'Account',
    tags: ['password', 'reset', 'email', 'login'],
  },
  {
    id: '8',
    question: 'Can I use the app on my phone?',
    answer:
      'Yes! The app is fully responsive and works great on mobile devices. You can also install it as a Progressive Web App (PWA) for a native app-like experience.',
    category: 'Mobile',
    tags: ['mobile', 'phone', 'pwa', 'responsive'],
  },
];

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started Guide',
    content:
      'Learn the basics of setting up your account, adding courses, and starting your first study session.',
    category: 'Getting Started',
    icon: <Book className="w-5 h-5" />,
    lastUpdated: '2024-01-15',
    readTime: 5,
  },
  {
    id: 'gamification-guide',
    title: 'Understanding the Gamification System',
    content:
      'Discover how XP, levels, achievements, and rewards work to keep you motivated.',
    category: 'Gamification',
    icon: <Trophy className="w-5 h-5" />,
    lastUpdated: '2024-01-14',
    readTime: 8,
  },
  {
    id: 'quest-system',
    title: 'Mastering the Quest System',
    content:
      'Learn how quests are generated and how to complete them effectively.',
    category: 'Features',
    icon: <Target className="w-5 h-5" />,
    lastUpdated: '2024-01-13',
    readTime: 6,
  },
  {
    id: 'pet-care',
    title: 'Virtual Pet Care Guide',
    content:
      'Everything you need to know about taking care of your study companion.',
    category: 'Features',
    icon: <Lightbulb className="w-5 h-5" />,
    lastUpdated: '2024-01-12',
    readTime: 4,
  },
  {
    id: 'pomodoro-technique',
    title: 'Effective Pomodoro Studying',
    content:
      'Tips and strategies for using the Pomodoro timer to maximize your focus.',
    category: 'Study Tips',
    icon: <Timer className="w-5 h-5" />,
    lastUpdated: '2024-01-11',
    readTime: 7,
  },
  {
    id: 'study-groups',
    title: 'Study Groups and Social Features',
    content: 'How to create, join, and make the most of study groups.',
    category: 'Social',
    icon: <Users className="w-5 h-5" />,
    lastUpdated: '2024-01-10',
    readTime: 5,
  },
  {
    id: 'privacy-settings',
    title: 'Privacy and Security Settings',
    content:
      'Manage your privacy settings and understand how your data is protected.',
    category: 'Privacy',
    icon: <Shield className="w-5 h-5" />,
    lastUpdated: '2024-01-09',
    readTime: 3,
  },
  {
    id: 'mobile-app',
    title: 'Using the Mobile App',
    content: 'Get the most out of the mobile experience and PWA features.',
    category: 'Mobile',
    icon: <Smartphone className="w-5 h-5" />,
    lastUpdated: '2024-01-08',
    readTime: 4,
  },
];

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSystem: React.FC<HelpSystemProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'articles' | 'contact'>(
    'faq'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const categories = useMemo(() => {
    const faqCategories = [...new Set(faqData.map(item => item.category))];
    const articleCategories = [
      ...new Set(helpArticles.map(item => item.category)),
    ];
    return ['all', ...new Set([...faqCategories, ...articleCategories])];
  }, []);

  const filteredFAQs = useMemo(() => {
    return faqData.filter(item => {
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const filteredArticles = useMemo(() => {
    return helpArticles.filter(article => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              Help Center
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            {/* Tabs */}
            <div className="space-y-2 mb-6">
              <button
                onClick={() => setActiveTab('faq')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'faq'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                FAQ
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'articles'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                Articles
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'contact'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Contact
              </button>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                      selectedCategory === category
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'faq' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Frequently Asked Questions
                </h3>
                {filteredFAQs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No FAQs found matching your search.
                  </p>
                ) : (
                  filteredFAQs.map(faq => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                        }
                        className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {faq.question}
                        </span>
                        {expandedFAQ === faq.id ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedFAQ === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-200 dark:border-gray-700"
                          >
                            <div className="p-4 text-gray-600 dark:text-gray-300">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'articles' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Help Articles
                </h3>
                {filteredArticles.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No articles found matching your search.
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {filteredArticles.map(article => (
                      <div
                        key={article.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-blue-600 dark:text-blue-400 mt-1">
                            {article.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {article.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                              {article.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>{article.readTime} min read</span>
                              <span>Updated {article.lastUpdated}</span>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Support
                </h3>

                <div className="grid gap-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Email Support
                      </h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      Get help via email. We typically respond within 24 hours.
                    </p>
                    <a
                      href="mailto:support@example.com"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      support@example.com
                    </a>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Community Forum
                      </h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      Connect with other users and get help from the community.
                    </p>
                    <a
                      href="#"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      Visit Forum
                    </a>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Video className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Video Tutorials
                      </h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      Watch step-by-step video guides for common tasks.
                    </p>
                    <a
                      href="#"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      Watch Tutorials
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Hook for managing help system
export const useHelp = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const openHelp = () => setIsHelpOpen(true);
  const closeHelp = () => setIsHelpOpen(false);

  return {
    isHelpOpen,
    openHelp,
    closeHelp,
  };
};
