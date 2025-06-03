
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Video, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';

const topics = [
  {
    id: 'anxiety',
    title: 'Anxiety & Stress',
    description: 'Managing overwhelming feelings and daily pressures',
    color: 'from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-150',
    textColor: 'text-blue-700',
  },
  {
    id: 'depression',
    title: 'Depression & Mood',
    description: 'Working through low mood and emotional challenges',
    color: 'from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-150',
    textColor: 'text-purple-700',
  },
  {
    id: 'relationships',
    title: 'Relationships',
    description: 'Navigating personal and professional relationships',
    color: 'from-pink-50 to-pink-100 border-pink-200 hover:from-pink-100 hover:to-pink-150',
    textColor: 'text-pink-700',
  },
  {
    id: 'work-life',
    title: 'Work & Life Balance',
    description: 'Finding harmony between career and personal life',
    color: 'from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-150',
    textColor: 'text-green-700',
  },
  {
    id: 'self-esteem',
    title: 'Self-Esteem & Confidence',
    description: 'Building a positive relationship with yourself',
    color: 'from-amber-50 to-amber-100 border-amber-200 hover:from-amber-100 hover:to-amber-150',
    textColor: 'text-amber-700',
  },
  {
    id: 'grief',
    title: 'Grief & Loss',
    description: 'Processing loss and major life changes',
    color: 'from-slate-50 to-slate-100 border-slate-200 hover:from-slate-100 hover:to-slate-150',
    textColor: 'text-slate-700',
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Something else on your mind',
    color: 'from-teal-50 to-teal-100 border-teal-200 hover:from-teal-100 hover:to-teal-150',
    textColor: 'text-teal-700',
  },
];

const TopicSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [communicationType, setCommunicationType] = useState<'chat' | 'video'>('chat');

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
  };

  const handleContinue = () => {
    if (selectedTopic && communicationType === 'chat') {
      // Store the selected topic in sessionStorage or pass via state
      sessionStorage.setItem('selectedTopic', selectedTopic);
      navigate('/feeling-selection');
    }
  };

  const selectedTopicData = topics.find(topic => topic.id === selectedTopic);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            What would you like to talk about?
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose a topic that best describes what's on your mind. This helps us connect you with the right support.
          </p>
        </div>

        {/* Communication Type Selection */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">How would you like to connect?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setCommunicationType('chat')}
                className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                  communicationType === 'chat'
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg'
                    : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:from-primary/5 hover:to-primary/10 hover:border-primary/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MessageCircle className={`h-6 w-6 ${communicationType === 'chat' ? 'text-primary' : 'text-gray-500'}`} />
                  <div>
                    <h3 className="font-semibold">Text Chat</h3>
                    <p className="text-sm text-muted-foreground">Connect through messaging</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setCommunicationType('video')}
                className={`p-4 rounded-lg border-2 transition-all duration-300 text-left relative ${
                  communicationType === 'video'
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg'
                    : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:from-primary/5 hover:to-primary/10 hover:border-primary/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Video className={`h-6 w-6 ${communicationType === 'video' ? 'text-primary' : 'text-gray-500'}`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">Video Call</h3>
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Face-to-face conversation</p>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Topic Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Select a topic</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <Card
                key={topic.id}
                className={`cursor-pointer transition-all duration-300 border-2 bg-gradient-to-br ${topic.color} ${
                  selectedTopic === topic.id
                    ? 'shadow-lg transform scale-105 border-primary'
                    : 'hover:shadow-md hover:transform hover:scale-102'
                }`}
                onClick={() => handleTopicSelect(topic.id)}
              >
                <CardContent className="p-6">
                  <h3 className={`font-semibold text-lg mb-2 ${topic.textColor}`}>
                    {topic.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {topic.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        {selectedTopic && (
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleContinue}
              disabled={communicationType === 'video'}
              size="lg"
              className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {communicationType === 'video' ? (
                <>
                  Video calls coming soon
                </>
              ) : (
                <>
                  Continue with {selectedTopicData?.title}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TopicSelectionPage;
