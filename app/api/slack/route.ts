import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const params = await request.json();

    const { data } = await axios.post(
      "https://slack.com/api/chat.postMessage",
      { ...params, text: `From Joshua Juanzo Slack Bot: ${params.text}` },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SLACK_TOKEN}`, // Use env variable here!
        },
      }
    );

    return NextResponse.json({ success: data.ok, error: data.error });
  } catch (error) {
    console.log("[SEND_SLACK]", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
