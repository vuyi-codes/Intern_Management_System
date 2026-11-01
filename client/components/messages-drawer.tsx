"use client"

import * as React from "react"
import {
  ArrowLeft,
  ArrowUp,
  FileText,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Search,
  SmilePlus,
  Trash2,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/components/ui/bubble"
import { buttonVariants } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Role } from "@/lib/nav"

const EDIT_WINDOW_MS = 10 * 60 * 1000
const UNDO_WINDOW_MS = 5_000
const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "👀"] as const

type Attachment = {
  name: string
  size: number
}

type ChatMessage = {
  id: string
  from: "me" | "them"
  text: string
  time: string
  sentAt: number
  edited?: boolean
  attachment?: Attachment
  reactions: string[]
}

type Conversation = {
  id: string
  name: string
  roleLabel: string
  preview: string
  messages: ChatMessage[]
}

type UndoState =
  | {
      type: "message"
      conversationId: string
      message: ChatMessage
      index: number
    }
  | {
      type: "chat"
      conversation: Conversation
      index: number
      wasActive: boolean
    }

// Fixed seed time so prerender stays stable (no Date.now() at module scope).
const SEED_NOW = Date.UTC(2026, 10, 1, 12, 0, 0)

const supervisorConversations: Conversation[] = [
  {
    id: "thabo",
    name: "Thabo Molefe",
    roleLabel: "Intern",
    preview: "Pushed the component updates.",
    messages: [
      {
        id: "1",
        from: "them",
        text: "Hi, I finished the dashboard cards.",
        time: "09:12",
        sentAt: SEED_NOW - 45 * 60 * 1000,
        reactions: [],
      },
      {
        id: "2",
        from: "me",
        text: "Nice. Can you also align the chart spacing?",
        time: "09:18",
        sentAt: SEED_NOW - 40 * 60 * 1000,
        reactions: ["👍"],
      },
      {
        id: "3",
        from: "them",
        text: "Pushed the component updates.",
        time: "09:41",
        sentAt: SEED_NOW - 20 * 60 * 1000,
        reactions: [],
      },
    ],
  },
  {
    id: "lerato",
    name: "Lerato Dlamini",
    roleLabel: "Intern",
    preview: "Ready for review on auth middleware.",
    messages: [
      {
        id: "1",
        from: "them",
        text: "Ready for review on auth middleware.",
        time: "10:05",
        sentAt: SEED_NOW - 15 * 60 * 1000,
        reactions: [],
      },
      {
        id: "2",
        from: "me",
        text: "I'll check it after standup.",
        time: "10:12",
        sentAt: SEED_NOW - 5 * 60 * 1000,
        reactions: [],
      },
    ],
  },
  {
    id: "sipho",
    name: "Sipho Nkosi",
    roleLabel: "Intern",
    preview: "Need clarity on the test cases.",
    messages: [
      {
        id: "1",
        from: "them",
        text: "Need clarity on the test cases.",
        time: "11:20",
        sentAt: SEED_NOW - 8 * 60 * 1000,
        reactions: [],
      },
    ],
  },
]

const internConversations: Conversation[] = [
  {
    id: "supervisor",
    name: "Jordan Peters",
    roleLabel: "Supervisor",
    preview: "Send your daily log before 5pm.",
    messages: [
      {
        id: "1",
        from: "them",
        text: "How is the overview page coming along?",
        time: "08:40",
        sentAt: SEED_NOW - 50 * 60 * 1000,
        reactions: [],
      },
      {
        id: "2",
        from: "me",
        text: "Almost done. Working on the tasks table now.",
        time: "08:55",
        sentAt: SEED_NOW - 4 * 60 * 1000,
        reactions: ["🎉"],
      },
      {
        id: "3",
        from: "them",
        text: "Send your daily log before 5pm.",
        time: "09:10",
        sentAt: SEED_NOW - 2 * 60 * 1000,
        reactions: [],
      },
    ],
  },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatTime(value: number) {
  return new Date(value).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function canEditMessage(message: ChatMessage, nowMs: number | null) {
  if (nowMs == null || message.from !== "me") return false
  return nowMs - message.sentAt <= EDIT_WINDOW_MS
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type MessagesDrawerProps = {
  role: Extract<Role, "intern" | "supervisor">
}

export function MessagesDrawer({ role }: MessagesDrawerProps) {
  const initialConversations =
    role === "supervisor" ? supervisorConversations : internConversations

  const [open, setOpen] = React.useState(false)
  const [conversations, setConversations] =
    React.useState<Conversation[]>(initialConversations)
  const [activeId, setActiveId] = React.useState<string | null>(
    role === "intern" ? initialConversations[0]?.id ?? null : null
  )
  const [draft, setDraft] = React.useState("")
  const [attachment, setAttachment] = React.useState<Attachment | null>(null)
  const [isRecording, setIsRecording] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editDraft, setEditDraft] = React.useState("")
  const [undo, setUndo] = React.useState<UndoState | null>(null)
  const [nowMs, setNowMs] = React.useState<number | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const undoTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ?? null

  React.useEffect(() => {
    const current = Date.now()
    setNowMs(current)
    // Rebase seed timestamps against real time so the 10-minute edit window works.
    setConversations((prev) =>
      prev.map((conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) => ({
          ...message,
          sentAt: current - (SEED_NOW - message.sentAt),
        })),
      }))
    )
    const intervalId = setInterval(() => setNowMs(Date.now()), 30_000)
    return () => {
      clearInterval(intervalId)
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
    }
  }, [])

  function queueUndo(next: UndoState) {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
    setUndo(next)
    undoTimeoutRef.current = setTimeout(() => {
      setUndo(null)
      undoTimeoutRef.current = null
    }, UNDO_WINDOW_MS)
  }

  function undoDelete() {
    if (!undo) return

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
      undoTimeoutRef.current = null
    }

    if (undo.type === "message") {
      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id !== undo.conversationId) return conversation
          const messages = [...conversation.messages]
          messages.splice(undo.index, 0, undo.message)
          const last = messages[messages.length - 1]
          return {
            ...conversation,
            preview: last?.text ?? conversation.preview,
            messages,
          }
        })
      )
    } else {
      setConversations((prev) => {
        const next = [...prev]
        next.splice(undo.index, 0, undo.conversation)
        return next
      })
      if (undo.wasActive) setActiveId(undo.conversation.id)
    }

    setUndo(null)
  }

  const filteredConversations = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return conversations

    return conversations.filter((conversation) => {
      const inMeta =
        conversation.name.toLowerCase().includes(query) ||
        conversation.preview.toLowerCase().includes(query)
      const inMessages = conversation.messages.some((message) =>
        message.text.toLowerCase().includes(query)
      )
      return inMeta || inMessages
    })
  }, [conversations, searchQuery])

  const visibleMessages = React.useMemo(() => {
    if (!activeConversation) return []
    const query = searchQuery.trim().toLowerCase()
    if (!query || !activeConversation) return activeConversation.messages
    return activeConversation.messages.filter(
      (message) =>
        message.text.toLowerCase().includes(query) ||
        message.attachment?.name.toLowerCase().includes(query)
    )
  }, [activeConversation, searchQuery])

  function updateConversation(
    conversationId: string,
    updater: (conversation: Conversation) => Conversation
  ) {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? updater(conversation) : conversation
      )
    )
  }

  function sendMessage() {
    const text = draft.trim()
    if ((!text && !attachment) || !activeConversation || isRecording) return

    const sentAt = Date.now()
    const nextMessage: ChatMessage = {
      id: `${sentAt}`,
      from: "me",
      text: text || (attachment ? `Sent ${attachment.name}` : ""),
      time: formatTime(sentAt),
      sentAt,
      attachment: attachment ?? undefined,
      reactions: [],
    }

    updateConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      preview: nextMessage.text,
      messages: [...conversation.messages, nextMessage],
    }))
    setDraft("")
    setAttachment(null)
  }

  function saveEdit(messageId: string) {
    if (!activeConversation) return
    const text = editDraft.trim()
    if (!text) return

    const target = activeConversation.messages.find(
      (message) => message.id === messageId
    )
    if (!target || !canEditMessage(target, nowMs ?? Date.now())) {
      setEditingId(null)
      return
    }

    updateConversation(activeConversation.id, (conversation) => {
      const messages = conversation.messages.map((message) =>
        message.id === messageId
          ? { ...message, text, edited: true }
          : message
      )
      const last = messages[messages.length - 1]
      return {
        ...conversation,
        preview: last?.text ?? conversation.preview,
        messages,
      }
    })
    setEditingId(null)
    setEditDraft("")
  }

  function deleteMessage(messageId: string) {
    if (!activeConversation) return

    const index = activeConversation.messages.findIndex(
      (message) => message.id === messageId
    )
    const message = activeConversation.messages[index]
    if (!message || index < 0) return

    queueUndo({
      type: "message",
      conversationId: activeConversation.id,
      message,
      index,
    })

    updateConversation(activeConversation.id, (conversation) => {
      const messages = conversation.messages.filter(
        (item) => item.id !== messageId
      )
      const last = messages[messages.length - 1]
      return {
        ...conversation,
        preview: last?.text ?? "No messages yet",
        messages,
      }
    })
    if (editingId === messageId) {
      setEditingId(null)
      setEditDraft("")
    }
  }

  function deleteChat(conversationId: string) {
    const index = conversations.findIndex(
      (conversation) => conversation.id === conversationId
    )
    const conversation = conversations[index]
    if (!conversation || index < 0) return

    const wasActive = activeId === conversationId
    queueUndo({
      type: "chat",
      conversation,
      index,
      wasActive,
    })

    setConversations((prev) =>
      prev.filter((item) => item.id !== conversationId)
    )
    if (wasActive) {
      setActiveId(null)
      setEditingId(null)
      setDraft("")
      setAttachment(null)
    }
  }

  function toggleReaction(messageId: string, emoji: string) {
    if (!activeConversation) return

    updateConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      messages: conversation.messages.map((message) => {
        if (message.id !== messageId) return message
        const hasReaction = message.reactions.includes(emoji)
        return {
          ...message,
          reactions: hasReaction
            ? message.reactions.filter((item) => item !== emoji)
            : [...message.reactions, emoji],
        }
      }),
    }))
  }

  function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setAttachment({ name: file.name, size: file.size })
    event.target.value = ""
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      swipeDirection="right"
      showSwipeHandle
    >
      <DrawerTrigger
        aria-label="Messages"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "rounded-sm border border-border"
        )}
      >
        <MessageCircle />
      </DrawerTrigger>

      <DrawerContent className="data-[swipe-direction=right]:[--drawer-content-width:100%] sm:data-[swipe-direction=right]:[--drawer-content-width:28rem]">
        <DrawerHeader className="gap-3 border-b pb-4 text-left">
          {activeConversation && (role === "supervisor" || role === "intern") ? (
            <div className="flex items-start gap-2">
              {role === "supervisor" && (
                <button
                  type="button"
                  aria-label="Back to conversations"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-sm" }),
                    "mt-0.5 shrink-0"
                  )}
                  onClick={() => {
                    setActiveId(null)
                    setEditingId(null)
                    setSearchQuery("")
                  }}
                >
                  <ArrowLeft />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <DrawerTitle>{activeConversation.name}</DrawerTitle>
                <DrawerDescription>
                  {activeConversation.roleLabel}
                </DrawerDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Chat actions"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-sm" }),
                    "shrink-0"
                  )}
                >
                  <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => deleteChat(activeConversation.id)}
                  >
                    <Trash2 />
                    Delete chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <DrawerTitle>Messages</DrawerTitle>
              <DrawerDescription>
                {role === "supervisor"
                  ? "Chat with your interns."
                  : "Chat with your supervisor."}
              </DrawerDescription>
            </>
          )}

          <InputGroup className="mt-2 h-9 has-[[data-slot=input-group-control]:focus-visible]:ring-1">
            <InputGroupAddon align="inline-start">
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={
                activeConversation
                  ? "Search in conversation..."
                  : "Search chats..."
              }
              aria-label="Search messages"
            />
            {searchQuery && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                >
                  <X />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        </DrawerHeader>

        {!activeConversation ? (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No chats found.
                </p>
              ) : (
                filteredConversations.map((conversation, index) => (
                  <div key={conversation.id}>
                    {index > 0 && <Separator />}
                    <div className="flex items-center gap-1 px-2 py-1">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-sm px-2 py-2 text-left transition-colors hover:bg-muted/50"
                        onClick={() => {
                          setActiveId(conversation.id)
                          setSearchQuery("")
                        }}
                      >
                        <Avatar className="size-9 rounded-full">
                          <AvatarFallback className="rounded-full">
                            {getInitials(conversation.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">
                              {conversation.name}
                            </p>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {conversation.roleLabel}
                            </span>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">
                            {conversation.preview}
                          </p>
                        </div>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`Actions for ${conversation.name}`}
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "icon-sm",
                            }),
                            "shrink-0"
                          )}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-40">
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => deleteChat(conversation.id)}
                          >
                            <Trash2 />
                            Delete chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
            {undo && (
              <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {undo.type === "chat"
                    ? "Chat deleted."
                    : "Message deleted."}
                </p>
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  onClick={undoDelete}
                >
                  Undo
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col">
              <MessageScrollerProvider key={activeConversation.id} autoScroll>
                <MessageScroller className="min-h-0 flex-1 p-4">
                  <MessageScrollerViewport>
                    <MessageScrollerContent>
                      {visibleMessages.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          No messages match your search.
                        </p>
                      ) : (
                        visibleMessages.map((message) => {
                          const align = message.from === "me" ? "end" : "start"
                          const name =
                            message.from === "me"
                              ? "You"
                              : activeConversation.name
                          const editable = canEditMessage(message, nowMs)
                          const isEditing = editingId === message.id

                          return (
                            <MessageScrollerItem
                              key={message.id}
                              messageId={message.id}
                              scrollAnchor={message.from === "me"}
                            >
                              <Message align={align}>
                                <MessageAvatar>
                                  <Avatar className="size-8 rounded-full">
                                    <AvatarFallback className="rounded-full text-xs">
                                      {getInitials(name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </MessageAvatar>
                                <MessageContent>
                                  <MessageHeader className="justify-between gap-2">
                                    <span>{name}</span>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger
                                        aria-label="Message actions"
                                        className={cn(
                                          buttonVariants({
                                            variant: "ghost",
                                            size: "icon-xs",
                                          }),
                                          "opacity-70"
                                        )}
                                      >
                                        <MoreHorizontal />
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align={
                                          align === "end" ? "end" : "start"
                                        }
                                        className="min-w-44"
                                      >
                                        <DropdownMenuItem
                                          onClick={() =>
                                            toggleReaction(message.id, "👍")
                                          }
                                        >
                                          <SmilePlus />
                                          React
                                        </DropdownMenuItem>
                                        {editable && (
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setEditingId(message.id)
                                              setEditDraft(message.text)
                                            }}
                                          >
                                            <Pencil />
                                            Edit
                                          </DropdownMenuItem>
                                        )}
                                        {(message.from === "me" ||
                                          role === "supervisor") && (
                                          <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              variant="destructive"
                                              onClick={() =>
                                                deleteMessage(message.id)
                                              }
                                            >
                                              <Trash2 />
                                              Delete message
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </MessageHeader>

                                  <Bubble
                                    align={align}
                                    variant={
                                      message.from === "me"
                                        ? "default"
                                        : "muted"
                                    }
                                    className={cn(
                                      "overflow-visible",
                                      message.reactions.length > 0 && "mb-5"
                                    )}
                                  >
                                    {isEditing ? (
                                      <div className="grid gap-2 p-2">
                                        <InputGroup className="h-9 bg-background has-[[data-slot=input-group-control]:focus-visible]:ring-1">
                                          <InputGroupInput
                                            value={editDraft}
                                            onChange={(event) =>
                                              setEditDraft(event.target.value)
                                            }
                                            aria-label="Edit message"
                                            autoFocus
                                            onKeyDown={(event) => {
                                              if (event.key === "Enter") {
                                                event.preventDefault()
                                                saveEdit(message.id)
                                              }
                                              if (event.key === "Escape") {
                                                setEditingId(null)
                                              }
                                            }}
                                          />
                                        </InputGroup>
                                        <div className="flex justify-end gap-1">
                                          <button
                                            type="button"
                                            className={cn(
                                              buttonVariants({
                                                variant: "ghost",
                                                size: "xs",
                                              })
                                            )}
                                            onClick={() => setEditingId(null)}
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            className={cn(
                                              buttonVariants({ size: "xs" })
                                            )}
                                            onClick={() =>
                                              saveEdit(message.id)
                                            }
                                          >
                                            Save
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <BubbleContent className="overflow-visible">
                                          <span className="block whitespace-pre-wrap">
                                            {message.text}
                                          </span>
                                          {message.attachment && (
                                            <span className="mt-2 flex items-center gap-2 rounded-sm bg-background/20 px-2 py-1 text-xs">
                                              <FileText className="size-3.5" />
                                              <span className="min-w-0 truncate">
                                                {message.attachment.name}
                                              </span>
                                              <span className="shrink-0 opacity-70">
                                                {formatFileSize(
                                                  message.attachment.size
                                                )}
                                              </span>
                                            </span>
                                          )}
                                        </BubbleContent>
                                        {message.reactions.length > 0 && (
                                          <BubbleReactions
                                            side="bottom"
                                            align={align}
                                            className="flex-row flex-nowrap gap-0.5 px-1 py-0.5 has-[button]:px-1 has-[button]:py-0.5"
                                          >
                                            {message.reactions.map((emoji) => (
                                              <button
                                                key={emoji}
                                                type="button"
                                                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-sm leading-none"
                                                onClick={() =>
                                                  toggleReaction(
                                                    message.id,
                                                    emoji
                                                  )
                                                }
                                              >
                                                {emoji}
                                              </button>
                                            ))}
                                          </BubbleReactions>
                                        )}
                                      </>
                                    )}
                                  </Bubble>

                                  <MessageFooter className="gap-2">
                                    <span>
                                      {message.time}
                                      {message.edited ? " · Edited" : ""}
                                    </span>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger
                                        aria-label="Add reaction"
                                        className={cn(
                                          buttonVariants({
                                            variant: "ghost",
                                            size: "icon-xs",
                                          })
                                        )}
                                      >
                                        <SmilePlus />
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align={
                                          align === "end" ? "end" : "start"
                                        }
                                        className="w-auto min-w-max p-1"
                                      >
                                        <div className="flex flex-row items-center gap-1">
                                          {QUICK_REACTIONS.map((emoji) => (
                                            <button
                                              key={emoji}
                                              type="button"
                                              className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-base hover:bg-muted"
                                              onClick={() =>
                                                toggleReaction(
                                                  message.id,
                                                  emoji
                                                )
                                              }
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </MessageFooter>
                                </MessageContent>
                              </Message>
                            </MessageScrollerItem>
                          )
                        })
                      )}
                    </MessageScrollerContent>
                  </MessageScrollerViewport>
                  <MessageScrollerButton />
                </MessageScroller>
              </MessageScrollerProvider>
            </div>

            <DrawerFooter className="gap-3 border-t pt-4">
              {undo && (
                <div className="flex items-center justify-between gap-3 rounded-sm border border-border px-3 py-2">
                  <p className="text-sm text-muted-foreground">
                    {undo.type === "chat"
                      ? "Chat deleted."
                      : "Message deleted."}
                  </p>
                  <button
                    type="button"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" })
                    )}
                    onClick={undoDelete}
                  >
                    Undo
                  </button>
                </div>
              )}
              {attachment && (
                <div className="flex items-center gap-2 rounded-sm border border-border px-2 py-1.5 text-xs">
                  <FileText className="size-3.5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">
                    {attachment.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </span>
                  <button
                    type="button"
                    aria-label="Remove attachment"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-xs" })
                    )}
                    onClick={() => setAttachment(null)}
                  >
                    <X />
                  </button>
                </div>
              )}

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  sendMessage()
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={onPickFile}
                />
                <InputGroup className="h-10 has-[[data-slot=input-group-control]:focus-visible]:ring-1">
                  <InputGroupAddon align="inline-start">
                    <InputGroupButton
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Attach file"
                      disabled={isRecording}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip />
                    </InputGroupButton>
                    <InputGroupButton
                      type="button"
                      size="icon-sm"
                      variant={isRecording ? "destructive" : "ghost"}
                      aria-label={
                        isRecording ? "Stop voice note" : "Record voice note"
                      }
                      aria-pressed={isRecording}
                      onClick={() => setIsRecording((prev) => !prev)}
                    >
                      <Mic />
                    </InputGroupButton>
                  </InputGroupAddon>
                  <InputGroupInput
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={
                      isRecording
                        ? "Recording voice note..."
                        : "Type a message..."
                    }
                    aria-label="Message"
                    disabled={isRecording}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="submit"
                      size="icon-sm"
                      variant="default"
                      aria-label="Send message"
                      disabled={
                        isRecording || (!draft.trim() && !attachment)
                      }
                    >
                      <ArrowUp />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </form>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}
