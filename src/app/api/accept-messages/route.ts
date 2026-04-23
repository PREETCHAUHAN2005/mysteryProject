import { getServerSession } from "next-auth";
import { authOption } from "../auth/[...nextauth`]/options";
import dbConnect from "@/src/lib/dbConnect";
import { UserModel } from "@/src/models/User";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOption);
  const user: User = session?.user as User;
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized || Not Authenticated USER",
      },
      { status: 401 }
    );
  }

  const userId = user._id;
  const { acceptMessages } = await request.json();
  try {
    // Update the user's acceptMessages field in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessages: acceptMessages },
      { new: true }
    );
    if (!updatedUser) {
      // User not found
      return Response.json(
        {
          success: false,
          message: "Unable to find user to update message acceptance status",
        },
        { status: 404 }
      );
    }
    // succesfully updated message acceptance status
    return Response.json(
      {
        success: true,
        message: " Message acceptance status updated successfully",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating acceptMessages:", error);
    return Response.json(
      {
        success: false,
        message: "An error occurred while updating acceptMessages",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();
  // Get the user session
  const session = await getServerSession(authOption);
  const user = session?.user;
  // check if the user is authenticated

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized || Not Authenticated USER",
      },
      { status: 401 }
    );
  }
  try {
    const foundUser = await UserModel.findById(user._id);
    if (!foundUser) {
      // User notfound
      return Response.json(
        {
          success: false,
          message: "Unable to find user ",
        },
        { status: 404 }
      );
    }
    // Return the user's acceptMessages status
    return Response.json(
      { success: true, isAcceptingMessages: foundUser.isAcceptingMessage },
      { status: 200 }
    );
  } catch (error) {
    //  Retrieve the usr from database)
    console.error("Error fetching acceptMessages status:", error);
    return Response.json(
      {
        success: false,
        message: "An error occurred while fetching acceptMessages status",
      },
      { status: 500 }
    );
  }
}
