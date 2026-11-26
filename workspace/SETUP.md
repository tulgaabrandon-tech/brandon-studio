# BrandOn Studio: setup on your own hosting

About 30 minutes, once. Everything here is free at the size of Brand On.

You will make three free accounts: **Supabase** (the database), **Telegram BotFather** (the bot) and **Vercel** (the website). The finance part also uses a Google Sheet you already have access to. Keep this page open and go step by step.

---

## 1. Database (Supabase)

1. Go to **supabase.com**, sign up, and press **New project**.
   - Name: `brandon-studio`
   - Region: **Southeast Asia (Singapore)**, the closest to Ulaanbaatar
   - Choose a database password and save it somewhere safe. You won't need it day to day.
2. When the project is ready, open **SQL Editor**, press **New query**, paste everything from `supabase/schema.sql`, and press **Run**. This creates the table and adds the team.
3. Open **Authentication > Users > Add user > Create new user**.
   - Email: `studio@brand-on.mn`
   - Password: choose the **studio password**. You will tell the team this one in person.
   - Tick **Auto Confirm User**.
4. Open **Authentication > Sign In / Providers** and turn **off** "Allow new users to sign up". Now only the studio account can get in.
5. Open **Project Settings > API** and copy two things:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key

   Send these two to Claude, or paste them into `public/config.js` yourself. They are safe to share. The studio password protects the data.

## 2. Telegram bot

1. In Telegram, open **@BotFather** and send `/newbot`.
2. Name: `BrandOn Studio`. Username: something like `BrandOnStudioBot` (it must end in `bot`).
3. BotFather gives you a **token**. This one is secret: don't paste it in a chat. It only goes into Supabase in the next step.
4. Send the bot's username (without @) to Claude, or put it in `public/config.js` as `botUsername`.

## 3. Telegram messages (Supabase functions)

1. In Supabase open **Edge Functions > Deploy a new function > Via Editor**.
   - Name it `notify`, delete the sample code, paste everything from `supabase/functions/notify/index.ts`, press **Deploy**.
2. Do it again with the name `telegram` and the code from `supabase/functions/telegram/index.ts`.
   - After deploying, open its **Details** and turn **off** "Enforce JWT verification". Telegram can't send a Supabase token.
3. Open **Edge Functions > Secrets** and add:
   - `TELEGRAM_BOT_TOKEN`: the token from BotFather
   - `TELEGRAM_SECRET`: any random word you invent, for example `bo-7Kq2xZ`
   - `APP_URL`: your website address from step 4 (you can add this one after)
4. Open **Database > Webhooks** (press **Enable webhooks** if asked), then **Create a new hook**:
   - Name: `telegram-notify`
   - Table: `docs`
   - Events: **Insert** and **Update**
   - Type: **Supabase Edge Functions**, function `notify`, method `POST`
   - Press **Create webhook**.

## 4. Website (Vercel)

1. Go to **vercel.com** and sign in with your GitHub account.
2. **Add New > Project**, choose the `brandon-studio` repository.
3. Set **Root Directory** to `workspace`. Framework preset: **Other**. Press **Deploy**.
4. Vercel gives you an address like `brandon-studio.vercel.app`. Put it in the `APP_URL` secret in Supabase (step 3.3).

From now on, every time Claude pushes an update to GitHub, the website updates by itself within a minute.

## 5. Connect the bot

Open this address in any browser once, with your own values filled in:

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<PROJECT>.supabase.co/functions/v1/telegram&secret_token=<TELEGRAM_SECRET>
```

You should see `"ok":true`.

## 6. The team, on their phones

Each person, once:

1. Opens the website on their phone. Taps **Share > Add to Home Screen** (iPhone) or **menu > Install app** (Android). Now it's an app icon.
2. Types the **studio password**.
3. Taps their name and creates their own **4-digit PIN**.
4. Taps their name at the top, then **Telegram холбох**, then **Start** in Telegram.

That's it. New tasks, sent work, notes, approvals, questions and announcements now arrive in Telegram, with a button that opens the right task.

---

## 7. Finance login (Suvdaa, Tulgaa, Nomin)

The Finance section has its own login, so the money is protected by the database itself. People who only know the studio password can't see it, even with developer tools.

1. In Supabase open **Authentication > Users > Add user > Create new user**.
   - Email: `finance@brand-on.mn`
   - Password: this is the **finance code**. At least 8 characters. Share it only with Suvdaa, Tulgaa and Nomin.
   - Tick **Auto Confirm User**.
2. If you used `supabase/schema.sql` from before this step was added, run it again. It's safe to run twice. It adds the `finance` table and Nomin.
3. Who sees the Finance section is set in **Team settings** (the lock button next to each name). They still need the finance code to open it, and it locks again after 15 quiet minutes or when someone switches person.

4. To load the 2026 numbers, open **SQL Editor**, paste the private file `brandon-finance-2026-import.sql` (sent in chat, never kept in this repo) and press **Run**. It is safe to run twice.

### Upload (both versions)

Finance has an **Upload** tab (Оруулах). Drop in bank statements (.xlsx or .csv), the monthly finance sheets, salary sheets or receipt photos, several at once:
- Transactions are sorted into the studio's categories from their description, the bank's label and what was filed before. Guesses are marked **?** so you can check them.
- Anything with the same date, amount and direction as something already filed is skipped. A month that is already filed comes in unticked, because the bank statement and the studio sheet hold the same money in different detail.
- Salary sheets become that month's payroll. Client sales tables become sales.
- Receipt photos are read by Claude on the Claude page and matched to the expense waiting for a receipt. On your own hosting you choose the expense yourself.
- Old .xls files need saving as .xlsx first.

### Jobs, clients and periods

- **Ажил, борлуулалт** (Jobs and sales): every job shows contract, final amount, received, owed, its own costs and profit. If a contract is amended or cancelled mid-way, open the job, set **Өөрчилсөн** or **Цуцалсан** and enter the amount actually agreed: the difference shows separately instead of hiding inside "owed". Link costs (freelancers, camera rental, travel, shoot meals) to the job from the job itself, from a transaction, or in bulk with **Шалгаад холбох**.
- **Харилцагч** (Clients): sales, received, owed, profit, work types and VAT status per company, plus purchases where the supplier has or hasn't filed VAT for us.
- Reports, jobs and clients switch between month, quarter, half year and year.
- Weekly bank uploads: rows already filed are skipped; rows after the last filed day come in ticked, each with a category and job you can change.

### On the Claude page

The finance collections are readable only by **Editors** and the owner. Share the page as **Editor** with Suvdaa, Tulgaa and Nomin, and as **Contributor** with everyone else: Contributors can use the studio but get no finance data, even with developer tools. The first person to open Finance sets the finance code by typing it twice. Editors can also change the page itself, so keep that list short.

## 8. Google Sheets, kept up to date

1. Create a new Google Sheet, for example **BrandOn Санхүү 2026 (автомат)**.
2. In it, open **Extensions > Apps Script**. Delete what's there, paste everything from `google-sheets/Code.gs`.
3. On the line `var TOKEN = 'change-me';` replace `change-me` with a secret word you invent. Press **Save**.
4. Press **Deploy > New deployment**, type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Press **Deploy**, allow access, and copy the **Web app URL**.
5. In Supabase: **Edge Functions > Deploy a new function > Via Editor**, name it `sheets`, paste `supabase/functions/sheets/index.ts`, deploy.
6. **Edge Functions > Secrets**, add:
   - `SHEETS_URL`: the Web app URL from step 4
   - `SHEETS_TOKEN`: the same secret word from step 3
7. **Database > Webhooks > Create a new hook**:
   - Name: `sheets-sync`, Table: `finance`, Events: **Insert**, **Update**, **Delete**
   - Type: **Supabase Edge Functions**, function `sheets`, method `POST`

Now every change in Finance rewrites five tabs in that sheet within a few seconds: **Гүйлгээ** (all transactions, in the same columns as your old sheets), **Борлуулалт** (sales and what's still owed), **Сар бүр** (every category by month, with the sales plan), **Төсөв** (budget against spending) and **Цалин** (payroll with all the taxes). The Finance overview shows when the last copy went through.

Don't type in those five tabs: the next update replaces them. Add your own tabs next to them for notes or extra formulas.

### If something goes wrong

- **Someone forgot their PIN:** Suvdaa or Reka opens **Team settings** and taps **PIN шинэчлэх** (Reset PIN) next to their name.
- **No Telegram messages:** check the person shows "Telegram холбогдсон" (Telegram connected) in Team settings, and that the `telegram-notify` webhook exists.
- **Backups:** Team settings has **Хүснэгтээр татах** (Export to spreadsheet). Do it once a month and keep the file in Drive.
- **Supabase free projects pause after a week with no use.** With the team using it daily this won't happen. If it ever does, open Supabase and press **Restore**.
