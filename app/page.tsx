"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RiUserLine } from "react-icons/ri";
import { IoIosArrowForward } from "react-icons/io";

import PromptForm from "@/components/prompt-form";

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

export function Message({
  type,
  message,
}: {
  type: string;
  message: string;
  onResubmit?: () => void;
}) {
  return (
    <div className="flex flex-col space-y-1 pb-4">
      <div className="min-w-4xl flex max-w-4xl space-x-4  pb-2">
        <Avatar className="h-8 w-8 rounded-md">
          <AvatarFallback
            className={
              type === "user"
                ? "rounded-md bg-[#222222]"
                : "rounded-md bg-[#111111]"
            }
          >
            {type === "user" ? <RiUserLine /> : <IoIosArrowForward />}
          </AvatarFallback>
        </Avatar>
        <div className="ml-4 mt-1 flex-1 flex-col space-y-2 overflow-hidden px-1">
          {message?.length === 0 && <PulsatingCursor />}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = React.useState<
    { type: string; message: string }[]
  >([{ type: "ai", message: "Hey there! How can I help?" }]);

  async function onSubmit(value: string) {
    setMessages((messages) => [...messages, { type: "user", message: value }]);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="relative flex flex-1 flex-col overflow-hidden border-r">
        <ScrollArea className="relative flex grow flex-col px-4">
          <div className="from-[#262626] absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-0% to-transparent to-50%" />
          <div className="mb-20 mt-10 flex flex-col space-y-5 py-5">
            <div className="container mx-auto flex max-w-4xl flex-col">
              {messages.map(({ type, message }, index) => (
                <Message key={index} type={type} message={message} />
              ))}
            </div>
          </div>
        </ScrollArea>
        <div className="from-[#262626] absolute inset-x-0 bottom-0 z-50 h-20 bg-gradient-to-t from-50% to-transparent to-100%">
          <div className="relative mx-auto mb-6 max-w-2xl px-8">
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
