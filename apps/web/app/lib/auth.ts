import  CredentialsProvider  from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import {db} from "@repo/db/client"
import GoogleProvider from "next-auth/providers/google";
export const authOptions={
    providers:[
        CredentialsProvider({
            name : "Credentials",
            credentials : {
                phone :{label: "Phone number",type : "text" , placeholder : "2343334142"},
                email : {label : "email",type : "text",placeholder: "yagya@examplle.com"},
                password: {label : "password",type : "password", placeholder: "password"}

            },
            async authorize(credentials: Record<"phone" | "email" | "password", string> | undefined){
                const hashedPassword = await bcrypt.hash(credentials?.password||"",10)
                const existingUser = await db.user.findFirst({
                    where : {
                        OR:[
                        {number :credentials?.phone||""},
                        {email : credentials?.email||""}
                        ]
                    }
                })
                if(existingUser){
                const passwordValidation = await bcrypt.compare(credentials?.password||"",existingUser.password)
                if(passwordValidation){
                return {
                    id :existingUser.id.toString(),
                    name :existingUser.name,
                    email : existingUser.email
                }
            }
            return null
        }
        try {
            const user = await db.user.create({
                data: {
                    email : credentials?.email||"",
                    number: credentials?.phone||"",
                    password: hashedPassword
                }
            });
        
            return {
                id: user.id.toString(),
                name: user.name,
                email: user.email
            }
        } catch(e) {
            console.error(e);
        }

        return null
      },

        })
      ,  
      GoogleProvider({
        clientId: process.env.GOOGLE_ID || "",
        clientSecret: process.env.GOOGLE_SECRET || ""
    })
    ],
    secret : process.env.JWT_SECRET||"",
    callbacks:{
        async session({token,session}:any)
        {
            session.user.id = token.sub
            return session
        }
    }
}