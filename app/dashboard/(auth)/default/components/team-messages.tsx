"use client";

import React from "react";
import { Send, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for team messages - in production this would come from a real-time source
const mockMessages = [
  {
    id: 1,
    user: {
      name: "Alex Rodriguez",
      avatar: "https://bundui-images.netlify.app/avatars/01.png",
      isOnline: true
    },
    content: "Great game yesterday! Who's up for a rematch this weekend?",
    timestamp: "10 mins ago",
    gameContext: "Basketball - Yesterday"
  },
  {
    id: 2,
    user: {
      name: "Sarah Chen",
      avatar: "https://bundui-images.netlify.app/avatars/02.png",
      isOnline: false
    },
    content: "I can bring extra rackets for tomorrow's game",
    timestamp: "25 mins ago",
    gameContext: "Tennis - Tomorrow"
  },
  {
    id: 3,
    user: {
      name: "Mike Johnson",
      avatar: "https://bundui-images.netlify.app/avatars/03.png",
      isOnline: true
    },
    content: "Weather looks perfect for Sunday's match! ⚽",
    timestamp: "1 hour ago",
    gameContext: "Soccer - Sunday"
  },
  {
    id: 4,
    user: {
      name: "Emma Wilson",
      avatar: "https://bundui-images.netlify.app/avatars/04.png",
      isOnline: true
    },
    content: "Count me in! I'll be there by 6pm",
    timestamp: "2 hours ago",
    gameContext: "Volleyball - Today"
  }
];

export const TeamMessages = React.memo(function TeamMessages() {
  const [messages, setMessages] = React.useState(mockMessages);
  const [input, setInput] = React.useState("");
  const inputLength = input.trim().length;

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputLength === 0) return;

    // In a real app, this would send to a backend
    const newMessage = {
      id: messages.length + 1,
      user: {
        name: "You",
        avatar: "https://bundui-images.netlify.app/avatars/05.png",
        isOnline: true
      },
      content: input,
      timestamp: "Just now",
      gameContext: "General"
    };

    setMessages([newMessage, ...messages]);
    setInput("");
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Messages
        </CardTitle>
        <Badge variant="secondary">
          {messages.filter(m => m.user.isOnline).length} online
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={message.user.avatar} 
                      onError={(e) => {
                        // Hide the image if it fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <AvatarFallback>{message.user.name[0]}</AvatarFallback>
                  </Avatar>
                  {message.user.isOnline && (
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{message.user.name}</p>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground">{message.content}</p>
                  <p className="text-xs text-muted-foreground">{message.gameContext}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={handleSendMessage}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Type a message..."
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button type="submit" size="icon" disabled={inputLength === 0}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
});