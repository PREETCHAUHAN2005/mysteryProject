import {UserModel} from '@/src/models/User';
import dbConnect from '@/src/lib/dbConnect';
import {Message}  from '@/src/models/User';

export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username }).exec();
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User Not Found",
        },
        { status: 404 }
      );
    }
    // Check if the user is accepting messages
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        { status: 403 }
      );
    }
    const newMessage = { content, creatdAt: new Date() };
    // Push the new message to the users message array
    user.messages.push( newMessage as Message);
    await user.save();
    return Response.json(
      {
        success: true,
        message: "Message Sent Successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error Adding Message", error);
    return Response.json(
      {
        success: false,
        message: "intenal server error",
      },
      { status: 500 }
    );
  }
}
