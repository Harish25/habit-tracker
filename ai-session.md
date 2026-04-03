## **AI-Session**

### **Session 1**

**Session Name:**   
Resolving Prisma P1000 Error

**Prompt:**  
How do i stop postgresql from using this port?   
(I also attached an image of my terminal where it showed the PIDs)

**AI Response:**

It looks like you’ve hit a classic roadblock: Port 5432 is already occupied by another instance of PostgreSQL, which will prevent your Docker container from starting up correctly.

Based on your netstat output, you actually have two processes (PIDs 6192 and 25172\) listening on that port. Here is how you can clear them out so you can get back to building the dashboard and friend management systems.

### **Option 1: The Quick "Kill" (Command Line)**

Since you already have the Command Prompt open as an Administrator, you can force-close these processes directly.

1. Kill the first process: taskkill /F /PID 6192  
2. Kill the second process: taskkill /F /PID 25172

Once these are closed, try running docker-compose up again from your project root.

Option 2: Stop the Windows Service

Often, PostgreSQL is installed as a background service that restarts itself automatically. To stop it permanently:

1. Press Win \+ R, type services.msc, and hit Enter.  
2. Scroll down to find PostgreSQL (it might be named something like postgresql-x64-16).  
3. Right-click it and select Stop.  
4. To prevent it from blocking your Docker container in the future, right-click Properties and change the "Startup type" to Manual.

**What YOUR Team Did With It:**

* The first option in the AI Response was useful as it helped to kill the processes on port 5432\.  
* Option 2 was not really needed as option 1 already helped to solve the issue.  
* After following the steps in option 1, the P1000 error went away since port 5432 was free again and could be used by Docker

### **Session 2**

**Session Name:**  Implementing Authentication using JWT tokens in Next.js

**Prompt:** We tried using the standard jsonwebtoken library in our Next.js Middleware to protect the /dashboard and /habits routes, but it’s throwing errors about missing Node.js modules. How do we verify user sessions when using Next.js

**AI Response:** 

Next.js Middleware runs on the Edge Runtime, which does not support certain legacy Node.js APIs (like crypto) used by libraries such as jsonwebtoken. To fix this, you must use a library built on Web Cryptography APIs.

Option 1: Switch to the jose Library: The jose library is specifically designed to be lightweight and compatible with Edge functions.  It allows you to sign and verify JWTs (JSON Web Tokens) using SignJWT and jwtVerify without needing the full Node.js environment.

Option 2: Use NextAuth.js (Auth.js): This is a high-level library that handles the complexities of jose for you. However, for a custom implementation where you need granular control over the userId in your database schema, a direct jose implementation is often preferred. 

Option 3: API-Only Verification: You could move all verification to standard API routes, but this would prevent you from using Middleware to "guard" pages before they render, leading to slower perceived performance.

**What YOUR Team Did With It:**

* We chose Option 1 and integrated the Jose library to handle all session encryption and decryption. By utilizing Jose within Next.js Middleware, we implemented user based access control to ensure users are restricted only to the habits and goals associated with their specific accounts. This approach supported the project's goal of a responsive interface, since it ensures quick load times for the habit dashboard and streak data.  
* Option 2 and 3 were complicated or not secure enough for our project. The jose library was the best implementation for our project use case  
* Once we implemented the Jose library, we were able to have issue JWT tokens and protect user sessions. We tested this by trying to access /dashboard when a user wasn’t logged in or directly after logging out.

### **Session 3**

**Session Name:**   
Next.js Real-time Strategies

**Prompt:**   
We're building a Next.js website which will make use of websockets for live updates. But due to the serverless design of Next.js, a persistent websocket server will not work well. What are some alternative websocket options that can be used?

**AI Response:**

This is a classic "architectural mismatch." Because Next.js typically deploys to serverless environments (like Vercel or AWS Lambda), your code only runs when a request comes in and "dies" immediately after. Since WebSockets require a persistent, open TCP connection, a serverless function cannot hold that door open.

You generally have three paths depending on how much infrastructure you want to manage.

1\.  Managed Real-time Services (PaaS)

This is the "easiest" route. You offload the persistent connection to a third-party provider. Your Next.js app sends data to the provider via a standard REST API (Server Action or Route Handler), and the provider pushes it to your clients.

* **Pusher / Ably:** They handle the "state" of who is connected.  
* **Soketi:** An open-source, self-hosted alternative to Pusher if you want to avoid high subscription costs but keep the same API.  
* **Liveblocks:** Excellent if your "live updates" are specifically for collaborative features (like "who is typing" or document syncing).

2\. Infrastructure-as-a-Proxy (AWS/Azure)

If you are already in a specific cloud ecosystem, you can use a "Gateway" that maintains the connection and triggers your serverless functions only when a message arrives.

* **AWS API Gateway (WebSockets):** It manages the 10,000 active connections for you. When a client sends a message, AWS triggers a specific Next.js Route Handler.  
* **Azure Web PubSub:** Similar to AWS, but often easier to configure for high-frequency broadcasting.

3\. The "Sidecar" Server (Dual-Hosting)

Many teams in 2026 use a "Hybrid" approach. They host the main Next.js site on Vercel for the performance/DX, but run a tiny, persistent Node.js or Go server elsewhere specifically for WebSockets.

* **Fly.io / Railway / Render:** These platforms allow for persistent containers. You can run a small Socket.io or ws server on a $5/month instance.  
* **Rivet:** A specialized tool that has become popular recently for bridging Vercel functions with long-lived WebSocket orchestration.

**What YOUR Team Did With It:**

* Coming from a React/Express architecture the team was more accustomed to using persistent WebSocket servers on Express  
* This prompt gave the team a great starting point to start researching alternative websocket solutions for the live update feature  
* The options from the AI response boiled down into PaaS vs IaaS  
* For our use case a PaaS solution seemed like the best fit. The live update feature only required streaming small text updates and going with a managed service would free the team from having to manage additional infrastructure (besides DigitalOcean)   
* After further research from this starting point the team was able to make a well informed decision and decide on using Pusher to implement this feature