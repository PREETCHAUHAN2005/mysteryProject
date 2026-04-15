import { Message } from "../models/User";

export interface ApiResponse {
  success: boolean;
  message: string;
//   isVerified?: boolean;
  isAcceptingMessage?: boolean;
  messages?: Array<Message>;
}
