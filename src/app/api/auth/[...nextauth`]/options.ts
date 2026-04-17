import { NextAuthOptions } from "next-auth";
import { CredentialsProvider } from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/src/lib/dbConnect";
import { UserModel } from "@/src/models/User";
export const authOption : NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id:"credentials",
        name :"Credentials",
        credentials: {
            email: { label: "Email", type: "text" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials: any ):Promise<any>{
            await dbConnect();
            const user = await UserModel.findOne({
                $or:[
                    {email: credentials.identifier},
                    {username: credentials.identifier}
                ]
            })
            if(!user){
                throw new Error("No user found with this Email")
            }
            if(!user.isVerified){
                throw new Error("Please verify your email before logging in")
            }
            const isPasswordCorrect = await bcrypt.compare(credentials.password,userAgent.password)

            if(isPasswordCorrect){
                return user
            }else{
                throw new Error("Invalid password")
            }
        } catch (err : any ){
            throw new Error(err.message);
        }
        })
        
    ],
    callbacks:{
        async jwt({token,user}){
            if(user){
                token._id=user._id?.toString()
                token.verified = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
                token.email = user.email
            }
            return token
        },
        async session({session,token}){
            if(token){
                session.user._id = token._id
                session.user.isVerified = token.verified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
                session.user.email = token.email
            }
            return session
        }
    },

    pages:{
        signIn:"/sign-in",
    },
    session: {
        strategy : "jwt",

    },
    secret: process.env.NEXTAUTH_SECRET,
}
