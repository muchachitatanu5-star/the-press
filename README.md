# The Press — Deployment Guide

Everything you need to get The Press live as a website and installable phone app.
No prior technical experience required. Each step tells you exactly what to do and what you'll see.

---

## What you're building

- A **website** anyone can visit at a real URL (e.g. `thepress.vercel.app`)
- An **installable app** people can add to their phone's home screen (no App Store needed)
- Works on iPhone, Android, and desktop

Total time: about 30–45 minutes, most of it waiting for things to install.

---

## Tools you'll use

| Tool | What it is | Cost |
|------|-----------|------|
| Node.js | Runs the build process on your computer | Free |
| GitHub | Stores your code online | Free |
| Vercel | Hosts your website and gives you a URL | Free |

---

## PHASE 1 — Install Node.js on your computer

Node.js is software that lets your computer build the app. You install it once and don't touch it again.

**Step 1.** Go to **https://nodejs.org/en/download**

**Step 2.** Click the big green **"LTS"** button (not "Current"). LTS means stable.
- On a Mac: download the `.pkg` file
- On Windows: download the `.msi` file

**Step 3.** Open the downloaded file and click through the installer. Accept all defaults. Click Install/Next until it's done.

**Step 4.** Verify it worked:
- **Mac:** Open the Terminal app (search "Terminal" in Spotlight)
- **Windows:** Open Command Prompt (search "cmd" in Start)
- Type this and press Enter:
  ```
  node --version
  ```
- You should see something like `v20.x.x` or `v24.x.x`. That's it — Node is installed.

---

## PHASE 2 — Set up the project on your computer

**Step 5.** Download this project folder to your computer.
(It came as a zip file — unzip it so you have a folder called `the-press`)

**Step 6.** Open Terminal (Mac) or Command Prompt (Windows).

**Step 7.** Navigate into the project folder. Type this, replacing the path with wherever you put the folder:
- **Mac:**
  ```
  cd ~/Downloads/the-press
  ```
- **Windows:**
  ```
  cd C:\Users\YourName\Downloads\the-press
  ```
  **Tip:** You can drag the folder onto the Terminal window instead of typing the path.

**Step 8.** Install the project's dependencies. Type this and press Enter:
```
npm install
```
You'll see a lot of text scroll by. Wait until you get your prompt back. This takes 1–3 minutes.

**Step 9.** Test that it works locally. Type:
```
npm run dev
```
You'll see something like:
```
  VITE v5.x.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```
Open your browser and go to **http://localhost:5173** — you should see The Press running. 

**Step 10.** Stop the local server by pressing `Ctrl + C` in Terminal.

---

## PHASE 3 — Put the code on GitHub

GitHub stores your code online so Vercel can read it to build your website.

**Step 11.** Go to **https://github.com** and create a free account if you don't have one.

**Step 12.** Once logged in, click the **+** icon in the top-right corner → **New repository**

**Step 13.** Fill in:
- Repository name: `the-press`
- Description: `A literary workshop`
- Select: **Public**
- **Do NOT** check "Add a README file"
- Click **Create repository**

**Step 14.** You'll see a page with setup instructions. Look for the section that says **"…or push an existing repository from the command line"**. You'll need to run those commands in your Terminal — they'll look like this (your exact URL will differ):
```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/the-press.git
git push -u origin main
```
Copy them from GitHub (not from here) and run them one at a time in your Terminal, from inside the `the-press` folder.

**Step 15.** GitHub will ask for your username and password the first time you push. Use your GitHub credentials.

**Step 16.** Refresh your GitHub repository page — you should see all the project files listed. The code is now online.

---

## PHASE 4 — Deploy to Vercel (this makes it a live website)

**Step 17.** Go to **https://vercel.com** and click **Sign Up**.

**Step 18.** Click **Continue with GitHub** and authorize Vercel to access your GitHub account.

**Step 19.** On your Vercel dashboard, click **Add New → Project**

**Step 20.** You'll see a list of your GitHub repositories. Find `the-press` and click **Import**.

**Step 21.** Vercel will automatically detect that it's a Vite project and fill in the settings. You don't need to change anything. Click **Deploy**.

**Step 22.** Wait about 60–90 seconds. Vercel will build and deploy your site.

**Step 23.** When it's done, you'll see a congratulations screen with a preview and a link like:
```
the-press.vercel.app
```
Click it. **The Press is now live on the internet.**

---

## PHASE 4a — Set up Gumroad license keys (makes the paywall work)

This is what automatically sends buyers their key and lets the app verify it.

**Step 24.** Go to **https://gumroad.com** and create an account if you don't have one.

**Step 25.** Create a product for The Press. Set the price to $49. Write whatever description you want.

**Step 26.** On your product's **Content** page, click the three-dot menu and select **"License key"**. A license key block will appear. This makes Gumroad automatically generate a unique key for every buyer and include it in their receipt email.

**Step 27.** Expand the license key block on the content page. You'll see a **Product ID** — it looks something like `SDGgCnivv6gTTHfVRfUBxQ==`. Copy it.

**Step 28.** Now go back to your **Vercel dashboard** → your `the-press` project → **Settings** → **Environment Variables**.

**Step 29.** Add a new variable:
- **Name:** `GUMROAD_PRODUCT_ID`
- **Value:** paste the Product ID you copied from Gumroad
- Click **Save**

**Step 30.** Go to **Deployments** → click the three-dot menu on your latest deployment → **Redeploy**. This restarts the app with the new variable loaded.

That's it. From now on, every Gumroad buyer gets their key automatically by email, and the app verifies it against Gumroad when they enter it.

---

## PHASE 5 — Custom domain (optional but recommended)

Your site works at `the-press.vercel.app` for free. If you want `thepress.com` or similar:

**Step 24.** Buy a domain from **Namecheap** or **Google Domains** (~$12/year for `.com`)

**Step 25.** In your Vercel project, go to **Settings → Domains** → Add your domain and follow the instructions to point it at Vercel. Takes about 10–30 minutes to propagate.

---

## PHASE 6 — Making it installable on phones (PWA)

This is already built into the code. Once your site is live on Vercel, it automatically works as an installable app. Here's how people install it:

**On iPhone (Safari):**
1. Open The Press in Safari
2. Tap the Share button (the box with an arrow pointing up)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add** — The Press icon appears on the home screen

**On Android (Chrome):**
1. Open The Press in Chrome
2. Tap the three-dot menu in the top right
3. Tap **Add to Home Screen** or **Install App**
4. Tap **Install**

The app will open full-screen with no browser bar, just like a native app.

---

## PHASE 7 — Updating the app after changes

Whenever you make changes to the code and want to push them live:

**Step 26.** In your Terminal, from inside the `the-press` folder:
```
git add .
git commit -m "Description of what you changed"
git push
```
Vercel will automatically detect the push and redeploy. Takes about 60 seconds. Done.

---

## Troubleshooting

**`npm install` fails** → Make sure you're inside the `the-press` folder before running it. Try `pwd` (Mac) or `cd` (Windows) to see where you are.

**Blank page on Vercel** → Go to your Vercel project → Settings → General → make sure Framework Preset is set to **Vite** and Output Directory is **dist**.

**GitHub push asks for authentication** → GitHub no longer accepts passwords for command-line pushes. You may need to create a Personal Access Token: GitHub → Settings → Developer Settings → Personal Access Tokens → Generate new token. Use that as your password.

**"Port already in use" when running `npm run dev`** → Press `Ctrl+C` to stop any running server, then try again.

---

## File structure reference

```
the-press/
├── api/
│   └── verify-license.js    ← Vercel serverless function (Gumroad proxy)
├── public/
│   ├── favicon.ico          ← browser tab icon
│   ├── icon-192.png         ← app icon (small)
│   ├── icon-512.png         ← app icon (large)
│   └── apple-touch-icon.png ← iPhone home screen icon
├── src/
│   ├── main.jsx             ← app entry point
│   └── App.jsx              ← all The Press code lives here
├── index.html               ← HTML shell
├── vite.config.js           ← build + PWA config
├── package.json             ← dependencies list
└── .gitignore               ← tells Git what not to upload
```

---

Questions? The two most useful resources are:
- **Vercel docs:** https://vercel.com/docs
- **Vite docs:** https://vitejs.dev/guide/
