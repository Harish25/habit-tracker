'use client'

import { useActionState } from 'react'
import { loginUser } from '../actions'
import Link from 'next/link'

//Define styles as constants to clean up jsx
const styles = {
  container: "flex min-h-screen items-center justify-center bg-gray-50",
  card: "w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg",
  input: "w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black",
  button: "w-full py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition"
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null)

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className="text-2xl font-bold text-center text-gray-900">Welcome Back</h1>
        
        {state?.error && (
          <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
            {state.error}
          </p>
        )}

        <form action={formAction} className="space-y-4">
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            required 
            className={styles.input} 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            required 
            className={styles.input} 
          />
          
          <button disabled={isPending} className={styles.button}>
            {isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          New here? <Link href="/users/register" className="text-indigo-600 hover:underline">Register account</Link>
        </p>
      </div>
    </div>
  )
}