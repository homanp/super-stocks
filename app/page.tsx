"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RiUserLine } from "react-icons/ri";
import { IoIosArrowForward } from "react-icons/io";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import PromptForm from "@/components/prompt-form";
import { MemoizedReactMarkdown } from "@/components/markdown";
import { CodeBlock } from "@/components/codeblock";
import { transformStockData } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <div className="min-w-4xl flex max-w-4xl space-x-4">
        <Avatar
          className={`h-8 w-8 rounded-md p-[1px] ${
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
        <div className="ml-4 mt-1 flex-1 flex-col space-y-2 overflow-hidden px-1">
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
                    className="text-primary underline"
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
                return <li className="pb-1">{children}</li>;
              },
              // @ts-ignore
              code({ node, inline, className, children, ...props }) {
                // @ts-ignore
                if (children.length) {
                  // @ts-ignore
                  if (children[0] === "▍") {
                    return (
                      <span className="mt-1 animate-pulse cursor-default">
                        ▍
                      </span>
                    );
                  }

                  // @ts-ignore
                  children[0] = (children[0] as string).replace("`▍`", "▍");
                }

                const match = /language-(\w+)/.exec(className || "");

                if (inline) {
                  return (
                    <code
                      className="light:bg-slate-200 px-1 text-md dark:bg-slate-800"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <CodeBlock
                    key={Math.random()}
                    language={(match && match[1]) || ""}
                    value={String(children).replace(/\n$/, "")}
                    {...props}
                  />
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

export function Chart({ data }: { data: any }) {
  const change = data.data[0].close - data.data[1].close;
  const percentageChange = ((change / data.data[1].close) * 100).toFixed(2);
  const changeColor = change < 0 ? "text-red-500" : "text-[#91FFC4]";

  const gradientOffset = () => {
    const dataMax = Math.max(...data.data.map((i: any) => i.close));
    const dataMin = Math.min(...data.data.map((i: any) => i.close));

    return dataMax / (dataMax - dataMin);
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload: any;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground">
            {payload[0].payload.date}
          </p>
          <p className="text-sm">${payload[0].value}</p>
        </div>
      );
    }

    return null;
  };

  const off = gradientOffset();

  return (
    <div className="flex flex-col space-y-1 pb-4 mt-[-20px] mb-5">
      <div className="min-w-4xl flex max-w-4xl space-x-4">
        <div className="w-8" />
        <div className="ml-4 mt-1 flex-1 flex-col space-y-2 overflow-hidden px-1">
          <div className="flex items-end space-x-2">
            <p className="text-xl font-bold">{data.ticker}</p>
            <p className="text-xl text-muted-foreground">
              ${data.data[0].close}
            </p>
            <p className={changeColor}>
              {change.toFixed(2)} ({percentageChange}%)
            </p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                width={500}
                height={400}
                data={data.data.reverse()}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <Tooltip
                  content={({ active, payload }) => (
                    <CustomTooltip active={active} payload={payload} />
                  )}
                />
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="rgba(145,255,196,0.1)"
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor="rgba(145,255,196,0.1)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#91FFC4"
                  fill="url(#splitColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-muted-foreground">
            Last update: {data.data[0].date}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = React.useState<
    { type: string; message: any }[]
  >([{ type: "ai", message: "Hey there! How can I help?" }]);

  const getStockData = async ({ ticker }: { ticker: string }) => {
    const dataResponse = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${process.env.NEXT_PUBLIC_ALPHAVANTAGE_API_KEY}`
    );
    const data = await dataResponse.json();
    const chartData = transformStockData(data);

    setMessages((previousMessages) => [
      ...previousMessages,
      { type: "function", message: { ticker, data: chartData } },
    ]);
  };

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

    await fetchEventSource(
      `${process.env.NEXT_PUBLIC_SUPERAGENT_API_URL}/agents/${process.env.NEXT_PUBLIC_AGENT_ID}/invoke`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPERAGENT_API_KEY}`,
        },
        body: JSON.stringify({
          input: value,
          enableStreaming: true,
        }),
        openWhenHidden: true,
        async onmessage(event) {
          if (event.data !== "[END]" && event.event !== "function_call") {
            message += event.data === "" ? `${event.data} \n` : event.data;
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

          if (event.event === "function_call") {
            const data = JSON.parse(event.data);

            if (data.function === "get_stock") {
              await getStockData({ ...data.args });
            }
          }
        },
      }
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="relative flex flex-1 flex-col overflow-hidden border-r">
        <ScrollArea className="relative flex grow flex-col px-4">
          <div className="from-[#262626] absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-0% to-transparent to-50%" />
          <div className="mb-20 mt-10 flex flex-col space-y-5 py-5">
            <div className="container mx-auto flex max-w-3xl flex-col">
              {messages.map(({ type, message }, index) =>
                type === "function" ? (
                  <Chart key={index} data={message} />
                ) : (
                  <Message key={index} type={type} message={message} />
                )
              )}
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
