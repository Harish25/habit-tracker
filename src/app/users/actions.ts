'use server'

import db from '@/lib/db' 
import bcrypt from 'bcrypt'
import { redirect } from 'next/navigation'

export async function registerUser(prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
      },
    })
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Email already exists." }
    return { error: "Registration failed." }
  }
  redirect('/users/login')
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const user = await db.user.findUnique({ where: { email } })
    if (!user) return { error: "Invalid email or password." }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) return { error: "Invalid email or password." }

    // Logic for sessions/cookies goes here
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error
    return { error: "Login failed." }
  }
  redirect('/dashboard')
}