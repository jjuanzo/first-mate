"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useRef, useState } from "react";

interface FormValueTypes {
  type: null | string;
  delay: null | number;
  channel: null | string;
  message: null | string;
}

export default function Home() {
  const [formVal, setFormVal] = useState<FormValueTypes>({
    type: null,
    delay: null,
    channel: "",
    message: "",
  });

  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const convertToSeconds = (delay: number, type: string): number => {
    switch (type) {
      case "second":
        return delay;
      case "minute":
        return delay * 60;
      case "hour":
        return delay * 3600;
      default:
        return 0;
    }
  };

  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const sendSlackMessage = async (channel: string, text: string) => {
    try {
      const { data } = await axios.post("/api/slack", {
        channel,
        text,
      });

      return data;
    } catch {
      return { error: "Failed to send message" };
    }
  };

  const handleSend = async () => {
    if (!!remainingTime) return;
    if (!formVal.message || !formVal.channel) return;

    setErrorMsg("");

    try {
      if (formVal.delay && formVal.type) {
        const totalSeconds = convertToSeconds(formVal.delay, formVal.type);
        setRemainingTime(totalSeconds);

        // Start countdown
        intervalRef.current = setInterval(() => {
          setRemainingTime((prev) => {
            if (prev === 1) {
              clearInterval(intervalRef.current!);
              return null;
            }
            return prev! - 1;
          });
        }, 1000);

        await sleep(totalSeconds * 1000);
      }

      const messageRes = await sendSlackMessage(
        formVal.channel,
        formVal.message
      );

      if (messageRes.error) setErrorMsg(messageRes.error);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {errorMsg && (
          <Alert className="bg-red-500 w-[320px]">
            <AlertTitle className="text-white">Error</AlertTitle>
            <AlertDescription className="text-white">
              {errorMsg}
            </AlertDescription>
          </Alert>
        )}
        <div className="w-[320px] flex gap-4 justify-center items-center flex-col sm:flex-row">
          <Select
            onValueChange={(val) =>
              setFormVal((state) => ({ ...state, type: val }))
            }
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Select a delay type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="second">Second</SelectItem>
              <SelectItem value="minute">Minute</SelectItem>
              <SelectItem value="hour">Hour</SelectItem>
            </SelectContent>
          </Select>
          <Input
            onChange={(val) =>
              setFormVal((state) => ({
                ...state,
                delay: parseInt(val.target.value),
              }))
            }
            className="w-auto"
            placeholder="Enter Delay Value"
          />
        </div>

        <Input
          onChange={(val) =>
            setFormVal((state) => ({
              ...state,
              channel: val.target.value,
            }))
          }
          className="w-[320px]"
          placeholder="Enter Slack ID"
        />

        <Textarea
          className="w-[320px]"
          placeholder="Enter message"
          onChange={(val) =>
            setFormVal((state) => ({
              ...state,
              message: val.target.value,
            }))
          }
        />

        <div className="w-[320px] flex gap-4 justify-center items-center">
          <Button
            disabled={!!remainingTime}
            className="text-white rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] hover:text-white dark:hover:text-white font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            onClick={handleSend}
            variant="outline"
          >
            {remainingTime ? `Sending in ${remainingTime}s` : "Send"}
          </Button>
        </div>
      </main>
    </div>
  );
}
