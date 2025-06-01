
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Heart, Briefcase, Users, Home, Rainbow, User } from 'lucide-react';

const topics = [
  {
    id: 'general',
    title: 'I just want to talk',
    description: 'Open conversation about anything',
    icon: MessageCircle,
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30'
  },
  {
    id: 'relationships',
    title: 'Relationships',
    description: 'Dating, friendships, and connections',
    icon: Heart,
    color: 'from-pink-500/20 to-pink-600/10 border-pink-500/30'
  },
  {
    id: 'work-stress',
    title: 'Work life stress',
    description: 'Career, workplace, and professional challenges',
    icon: Briefcase,
    color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30'
  },
  {
    id: 'family',
    title: 'Family Issues',
    description: 'Family dynamics and relationships',
    icon: Users,
    color: 'from-green-500/20 to-green-600/10 border-green-500/30'
  },
  {
    id: 'married-life',
    title: 'Married Life',
    description: 'Marriage, partnership, and commitment',
    icon: Home,
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30'
  },
  {
    id: 'lgbtq',
    title: 'LGBTQ Identity Confusion',
    description: 'Sexual orientation and gender identity',
    icon: Rainbow,
    color: 'from-rainbow-500/20 to-rainbow-600/10 border-rainbow-500/30'
  },
  {
    id: 'loneliness',
    title: 'Loneliness & Depression',
    description: 'Mental health and emotional well-being',
    icon: User,
    color: 'from-gray-500/20 to-gray-600/10 border-gray-500/30'
  }
];

const TopicSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    console.log(`Selected topic: ${topicId}`);
    // Navigate to feeling selection page instead of chat
    setTimeout(() => {
      navigate('/feeling-selection', { state: { topic: topicId } });
    }, 300);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Choose a Topic</h1>
            <p className="text-muted-foreground">Select what you'd like to talk about today</p>
          </div>
        </div>

        <div className="grid gap-4">
          {topics.map((topic) => {
            const IconComponent = topic.icon;
            return (
              <Button
                key={topic.id}
                variant="topic"
                size="topic"
                onClick={() => handleTopicSelect(topic.id)}
                className={`w-full justify-start text-left bg-gradient-to-br ${topic.color} hover:scale-[1.02] transition-all duration-300 group ${
                  selectedTopic === topic.id ? 'ring-2 ring-primary scale-[1.02]' : ''
                }`}
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="flex-grow">
                    <div className="font-semibold text-lg mb-1">{topic.title}</div>
                    <div className="text-sm text-muted-foreground">{topic.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Your conversation will be completely anonymous and confidential. 
            Choose the topic that best matches what you want to discuss.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TopicSelectionPage;
