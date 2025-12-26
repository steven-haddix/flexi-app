"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ToolUIPart, type UIMessagePart } from "ai";
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
    PromptInput,
    PromptInputFooter,
    type PromptInputMessage,
    PromptInputSubmit,
    PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import {
    Tool,
    ToolContent,
    ToolHeader,
    ToolInput,
    ToolOutput,
} from "@/components/ai-elements/tool";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ai-elements/loader";
import { cn } from "@/lib/utils";
import { Sparkles, Dumbbell } from "lucide-react";
import { useMemo } from "react";

interface WorkoutCoachProps {
    workoutId: string;
    workout: any;
}

export function WorkoutCoach({ workoutId, workout }: WorkoutCoachProps) {
    const transport = useMemo(
        () =>
            new DefaultChatTransport({
                api: "/api/chat",
            }),
        [],
    );

    const { messages, sendMessage, status, error, clearError, stop } = useChat({
        id: workoutId,
        messages: workout?.chatMessages || [],
        transport,
    });

    const suggestions = useMemo(
        () => [
            "Give me a quick warm-up for today.",
            "How long should this session take?",
            "Swap an exercise for a knee-friendly option.",
            "Make this workout fit in 30 minutes.",
        ],
        [],
    );

    const canSend = status === "ready" || status === "error";
    const isBusy = status === "submitted" || status === "streaming";


    const submitMessage = async ({
        text,
        files,
    }: {
        text: string;
        files?: PromptInputMessage["files"];
    }) => {
        const trimmed = text.trim();
        const hasFiles = Boolean(files?.length);
        if (!trimmed && !hasFiles) return;

        if (!canSend) return;
        if (status === "error") {
            clearError();
        }

        await sendMessage(
            trimmed
                ? { text: trimmed, files }
                : { files: files as PromptInputMessage["files"] },
            {
                body: {
                    currentWorkout: workout,
                    userInput: trimmed || undefined,
                },
            },
        );
    };

    const handleSubmit = async ({ text, files }: PromptInputMessage) => {
        if (isBusy) {
            stop();
            return;
        }
        await submitMessage({ text, files });
    };

    const handleSuggestion = async (suggestion: string) => {
        if (!canSend) return;
        await submitMessage({ text: suggestion });
    };

    const renderPart = (part: UIMessagePart<any, any>, index: number, messageId: string) => {
        const key = `${messageId}-part-${index}`;

        if (part.type === "text") {
            return <MessageResponse key={key}>{part.text}</MessageResponse>;
        }

        if (part.type.startsWith("tool-")) {
            const toolPart = part as ToolUIPart;
            const outputNode =
                toolPart.state === "output-available" && toolPart.output ? (
                    typeof toolPart.output === "string" ? (
                        <MessageResponse>{toolPart.output}</MessageResponse>
                    ) : (
                        toolPart.output
                    )
                ) : null;

            return (
                <div key={key} className="pt-2">
                    <Tool defaultOpen={toolPart.state !== "input-streaming"}>
                        <ToolHeader type={toolPart.type} state={toolPart.state} />
                        <ToolContent>
                            {toolPart.input ? <ToolInput input={toolPart.input} /> : null}
                            <ToolOutput
                                output={outputNode as ToolUIPart["output"]}
                                errorText={toolPart.errorText}
                            />
                        </ToolContent>
                    </Tool>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Sparkles className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-sm font-semibold">Flexi Coach</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="max-w-[180px] truncate">{workout?.name ?? "Workout"}</span>
                            {workout?.status && (
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "border",
                                        workout.status === "completed"
                                            ? "border-emerald-200 bg-emerald-500/15 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                                            : "border-amber-200 bg-amber-500/15 text-amber-700 dark:border-amber-800 dark:text-amber-400",
                                    )}
                                >
                                    {workout.status === "completed" ? "Completed" : "Draft"}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            <Conversation className="flex-1">
                <ConversationContent className="pb-10">
                    {messages.length === 0 ? (
                        <ConversationEmptyState
                            title="Start coaching"
                            description="Ask about form, pacing, or changes to this plan."
                            icon={<Dumbbell className="size-5" />}
                        >
                            <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
                                <Message from="assistant">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Avatar className="size-6">
                                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                                <Sparkles className="size-3" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium text-muted-foreground">Flexi</span>
                                    </div>
                                    <MessageContent className="rounded-xl border bg-card text-card-foreground shadow-sm p-4">
                                        <MessageResponse>
                                            {`Hey! I'm your Flexi Coach for ${workout?.name ?? "today's workout"}. Ask about form cues, swaps, or how to tailor the session.`}
                                        </MessageResponse>
                                    </MessageContent>
                                </Message>
                                <Suggestions>
                                    {suggestions.map((suggestion) => (
                                        <Suggestion
                                            key={suggestion}
                                            suggestion={suggestion}
                                            onClick={handleSuggestion}
                                            disabled={!canSend}
                                        />
                                    ))}
                                </Suggestions>
                            </div>
                        </ConversationEmptyState>
                    ) : (
                        <>
                            {messages.map((message) => {
                                const hasToolParts = message.parts?.some((part) =>
                                    part.type.startsWith("tool-"),
                                );
                                return (
                                    <Message
                                        key={message.id}
                                        from={message.role === "user" ? "user" : "assistant"}
                                    >
                                        {message.role !== "user" && (
                                            <div className="flex items-center gap-2 mb-0.5 px-1">
                                                <Avatar className="size-6">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                                        <Sparkles className="size-3" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Flexi
                                                </span>
                                            </div>
                                        )}
                                        <MessageContent
                                            className={cn(
                                                hasToolParts && "w-full",
                                                message.role !== "user" &&
                                                "rounded-xl border bg-card text-card-foreground shadow-sm p-4",
                                            )}
                                        >
                                            {message.parts?.map((part, index) =>
                                                renderPart(part, index, message.id),
                                            )}
                                        </MessageContent>
                                    </Message>
                                );
                            })}
                            {isBusy && (
                                <Message from="assistant">
                                    <div className="flex items-center gap-2 mb-0.5 px-1">
                                        <Avatar className="size-6">
                                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                                <Sparkles className="size-3" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium text-muted-foreground">Flexi</span>
                                    </div>
                                    <MessageContent className="flex flex-row items-center gap-2 text-xs text-muted-foreground rounded-xl border bg-card shadow-sm p-4">
                                        <Loader size={14} />
                                        <span>Coach is drafting a reply...</span>
                                    </MessageContent>
                                </Message>
                            )}
                        </>
                    )}

                    {error && (
                        <Alert variant="destructive" className="mx-auto max-w-md">
                            <AlertTitle>Coach connection issue</AlertTitle>
                            <AlertDescription>
                                <p>{error.message || "Something went wrong while generating a response."}</p>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="mt-2"
                                    onClick={clearError}
                                >
                                    Dismiss
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>

            <div className="border-t bg-background/90 p-4">
                <PromptInput
                    onSubmit={handleSubmit}
                    className="rounded-xl border bg-card shadow-sm"
                    globalDrop={false}
                >
                    <PromptInputTextarea
                        placeholder="Ask about form cues, swaps, or pacing..."
                        className="min-h-[56px]"
                    />
                    <PromptInputFooter className="border-t bg-muted/30">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Shift + Enter</span>
                            <span>for a new line</span>
                        </div>
                        <PromptInputSubmit status={status} disabled={!canSend && !isBusy} />
                    </PromptInputFooter>
                </PromptInput>
            </div>
        </div>
    );
}
