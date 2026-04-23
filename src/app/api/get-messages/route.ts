import dbConnect from "@/src/lib/dbConnect";
import {UserModel} from "@/src/models/User";

import mongoose from "mongoose";

import { User } from "next-auth";

import { getServerSession } from "next-auth/next";

import { authOption } from "../auth/[...nextauth`]/options";

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOption);
  const _user: User = session?.user;
  if (!_user || !session) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized || Not Authenticated USER",
      },
      { status: 401 }
    );
  }
  const userId = new mongoose.Types.ObjectId(_user._id);
  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]).exec();
    
    if(!user || user.length === 0){
        return Response.json(
            {message: "User not found", success: false},
            {status: 404}
        )
    }
    return Response.json({
        messages: user[0].messages,
        success: true,
    } , {status: 200});
  } catch (error) {
    console.error("An unexpected error Occured", error);
    return Response.json(
      {
        success: false,
        message: "intenal server error",
      },
      { status: 500 }
    );
  }
}
