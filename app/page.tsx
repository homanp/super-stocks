"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RiUserLine } from "react-icons/ri";
import { IoIosArrowForward } from "react-icons/io";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { fetchEventSource } from "@microsoft/fetch-event-source";

import PromptForm from "@/components/prompt-form";
import { MemoizedReactMarkdown } from "@/components/markdown";
import { CodeBlock } from "@/components/codeblock";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/header";

function PulsatingCursor() {
  return (
    <motion.div
      initial="start"
      animate={{
        scale: [1, 1, 1],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
      }}
    >
      ▍
    </motion.div>
  );
}

function Message({
  type,
  message,
}: {
  type: string;
  message: string;
  onResubmit?: () => void;
}) {
  return (
    <div className="flex flex-col space-y-1 pb-4">
      <div className="min-w-4xl flex max-w-4xl space-x-4">
        <Avatar
          className={`h-10 w-10 rounded-md p-[1px] ${
            type === "ai" && message.length === 0
              ? "animate-border bg-gradient-to-r from-transparent via-gray-500 to-white bg-[length:400%_400%]"
              : "bg-transparent border border-[#4C4C4C]"
          }`}
        >
          <AvatarFallback
            className={
              type === "human"
                ? "rounded-md bg-transparent "
                : "rounded-md bg-[#111111]"
            }
          >
            {type === "human" ? (
              <RiUserLine color="white" />
            ) : (
              <IoIosArrowForward />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="ml-4 mt-2 flex-1 flex-col space-y-2 overflow-hidden px-1">
          {message?.length === 0 && <PulsatingCursor />}
          <MemoizedReactMarkdown
            className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words text-md"
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              table({ children }) {
                return (
                  <div className="mb-2 rounded-md border">
                    <Table>{children}</Table>
                  </div>
                );
              },
              thead({ children }) {
                return <TableHeader>{children}</TableHeader>;
              },
              tbody({ children }) {
                return <TableBody>{children}</TableBody>;
              },
              tr({ children }) {
                return <TableRow>{children}</TableRow>;
              },
              th({ children }) {
                return <TableHead className="py-2">{children}</TableHead>;
              },
              td({ children }) {
                return <TableCell className="py-2">{children}</TableCell>;
              },
              p({ children }) {
                return <p className="mb-5">{children}</p>;
              },
              a({ children, href }) {
                return (
                  <a
                    href={href}
                    className="text-[#91FFC4] underline"
                    rel="noreferrer"
                    target="_blank"
                  >
                    {children}
                  </a>
                );
              },
              ol({ children }) {
                return (
                  <ol className="mb-5 list-decimal pl-[30px]">{children}</ol>
                );
              },
              ul({ children }) {
                return <ul className="mb-5 list-disc pl-[30px]">{children}</ul>;
              },
              li({ children }) {
                return <li className="pb-1 mb-[-1.25rem]">{children}</li>;
              },
              // @ts-ignore
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <CodeBlock
                    key={Math.random()}
                    language={(match && match[1]) || ""}
                    value={String(children).replace(/\n$/, "")}
                    {...props}
                  />
                ) : (
                  <Badge variant="outline" className="text-md" {...props}>
                    {children}
                  </Badge>
                );
              },
            }}
          >
            {message}
          </MemoizedReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = React.useState<
    { type: string; message: any }[]
  >([{ type: "ai", message: "Hey there! Ask me about real-time events." }]);

  async function onSubmit(value: string) {
    let message = "";

    setMessages((previousMessages: any) => [
      ...previousMessages,
      { type: "human", message: value },
    ]);

    setMessages((previousMessages) => [
      ...previousMessages,
      { type: "ai", message },
    ]);

    await fetchEventSource("https://nagato-online-7b.replit.app/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: value,
      }),
      openWhenHidden: true,
      async onmessage(event) {
        if (event.data !== "[END]") {
          message += event.data === "" ? `${event.data}\n` : event.data;
          setMessages((previousMessages) => {
            let updatedMessages = [...previousMessages];

            for (let i = updatedMessages.length - 1; i >= 0; i--) {
              if (updatedMessages[i].type === "ai") {
                updatedMessages[i].message = message;
                break;
              }
            }

            return updatedMessages;
          });
        }
      },
    });
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="relative flex flex-1 flex-col overflow-hidden border-r">
        <ScrollArea className="relative flex grow flex-col px-4">
          <div className="from-[#262626] absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-0% to-transparent to-30%" />
          <div className="mb-20 mt-10 flex flex-col space-y-5 py-5">
            <div className="container mx-auto flex max-w-3xl flex-col">
              {messages.map(({ type, message }, index) => (
                <Message key={index} type={type} message={message} />
              ))}
            </div>
          </div>
        </ScrollArea>
        <div className="from-[#262626] absolute inset-x-0 bottom-0 z-50 h-20 bg-gradient-to-t from-50% to-transparent to-100%">
          <div className="relative mx-auto mb-6 max-w-3xl px-8">
            <PromptForm
              onSubmit={async (value) => {
                onSubmit(value);
              }}
              isLoading={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
