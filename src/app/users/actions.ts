'use server'

import db from '@/lib/db' 
import bcrypt from 'bcrypt'
import { redirect } from 'next/navigation'
import { SignJWT, jwtVerify } from 'jose' 
import { cookies } from 'next/headers' 

// Helper to get the secret key
const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

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

    // 3. GENERATE THE JWT TOKEN
    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Session lasts 7 days
      .sign(getJwtSecretKey())

    // 4. SET THE COOKIE
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    })

  } catch (error: any) {
 
    if (error.digest?.includes('NEXT_REDIRECT')) throw error
    return { error: "Login failed." }
  }


  redirect('/dashboard')
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/users/login')
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, getJwtSecretKey())
    return await db.user.findUnique({ where: { id: payload.userId as number } })
  } catch (error) {
    return null
  }
}