
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
  },
  {
    id: 'relationships',
    title: 'Relationships',
    description: 'Dating, friendships, and connections',
    icon: Heart,
  },
  {
    id: 'work-stress',
    title: 'Work life stress',
    description: 'Career, workplace, and professional challenges',
    icon: Briefcase,
  },
  {
    id: 'family',
    title: 'Family Issues',
    description: 'Family dynamics and relationships',
    icon: Users,
  },
  {
    id: 'married-life',
    title: 'Married Life',
    description: 'Marriage, partnership, and commitment',
    icon: Home,
  },
  {
    id: 'lgbtq',
    title: 'LGBTQ Identity Confusion',
    description: 'Sexual orientation and gender identity',
    icon: Rainbow,
  },
  {
    id: 'loneliness',
    title: 'Loneliness & Depression',
    description: 'Mental health and emotional well-being',
    icon: User,
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Choose a Topic</h1>
            <p className="text-muted-foreground">Select what you'd like to talk about today</p>
          </div>
        </div>

        <div className="grid gap-4">
          {topics.map((topic) => {
            const IconComponent = topic.icon;
            return (
              <Button
                key={topic.id}
                variant="outline"
                onClick={() => handleTopicSelect(topic.id)}
                className={`w-full justify-start text-left p-6 h-auto border-2 transition-colors duration-200 ${
                  selectedTopic === topic.id 
                    ? 'border-foreground bg-muted' 
                    : 'border-muted-foreground/20 hover:border-muted-foreground/40'
                }`}
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-grow">
                    <div className="font-semibold text-lg mb-1 text-foreground">{topic.title}</div>
                    <div className="text-sm text-muted-foreground">{topic.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-muted-foreground/20">
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
