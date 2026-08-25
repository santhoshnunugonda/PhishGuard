import {
  CopyIcon,
  RefreshCcwIcon,
  ShareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Bot,
  User,
} from "lucide-react"

import { Action, Actions } from "@/components/ui/actions"
import {
  Conversation,
  ConversationContent,
} from "@/components/ui/conversation"
import { Message, MessageContent } from "@/components/ui/message"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const messages: {
  id: string
  from: "user" | "assistant"
  content: string
  avatar: string
  name: string
}[] = [
  {
    id: "1",
    from: "user",
    content: "Hello, how are you?",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
    name: "User",
  },
  {
    id: "2",
    from: "assistant",
    content: "I am fine, thank you! How can I help you today with PhishGuard?",
    avatar: "https://images.unsplash.com/photo-1675249141525-24aee0bc1f88?w=80&h=80&fit=crop",
    name: "PhishGuard AI",
  },
]
const Example = () => {
  const actions = [
    {
      icon: RefreshCcwIcon,
      label: "Retry",
    },
    {
      icon: ThumbsUpIcon,
      label: "Like",
    },
    {
      icon: ThumbsDownIcon,
      label: "Dislike",
    },
    {
      icon: CopyIcon,
      label: "Copy",
    },
    {
      icon: ShareIcon,
      label: "Share",
    },
  ]
  return (
    <div className="flex h-full w-full max-w-2xl items-center justify-center p-4">
      <Conversation className="relative w-full rounded-xl border bg-[#1A2332] border-[#2E3A4F] text-white shadow-sm">
        <ConversationContent>
          {messages.map((message) => (
            <Message
              className={`flex flex-col gap-2 ${message.from === "assistant" ? "items-start" : "items-end"}`}
              from={message.from}
              key={message.id}
            >
              <Avatar className="h-8 w-8 border border-[#2E3A4F]">
                <AvatarImage src={message.avatar} alt={message.name} />
                <AvatarFallback className="bg-[#2E3A4F] text-[#B8BCCF]">
                  {message.from === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <MessageContent className={message.from === "user" ? "bg-[#C0FF00] text-[#0D1B2A]" : "bg-[#0D1B2A] border border-[#2E3A4F] text-white"}>
                {message.content}
              </MessageContent>
              {message.from === "assistant" && (
                <Actions className="mt-2">
                  {actions.map((action) => (
                    <Action key={action.label} label={action.label} tooltip={action.label}>
                      <action.icon className="size-4 text-[#B8BCCF] hover:text-[#C0FF00]" />
                    </Action>
                  ))}
                </Actions>
              )}
            </Message>
          ))}
        </ConversationContent>
      </Conversation>
    </div>
  )
}

export { Example }
