# Bash Homes

A React and TypeScript short-let website styled with Tailwind. The generated photos in `public/images` and the sample amenities in `src/main.tsx` can be updated when property details are available. The palette lives in the Tailwind theme in `src/styles.css`.

## Local development

Run `npm install` and `npm run dev`. Run `npm run build` for the production browser files in `dist/client` and the site Worker in `dist/server/index.js`.

## Connect Google Sheets

1. Create or choose a Google spreadsheet and open **Extensions → Apps Script**. Paste the contents of `integration/Code.gs`.
2. Set the script properties `SPREADSHEET_ID` and `INQUIRY_SECRET`. The spreadsheet ID is the text between `/d/` and `/edit` in its URL. Use a long random secret.
3. Deploy as a [Google Apps Script web app](https://developers.google.com/apps-script/guides/web). Execute as the owner and allow **Anyone** to access the web app so the site server can call it. The script checks the secret before writing. The spreadsheet itself can remain private.
4. Set `GOOGLE_APPS_SCRIPT_URL` to the web app's `/exec` URL and `GOOGLE_APPS_SCRIPT_SECRET` to the same secret in the site's server environment. For local testing, put these values in an ignored `.env.local` file and restart Vite.
5. Submit a test inquiry and check that it appears in the **Inquiries** tab. The script creates that tab if needed.

The form shows a confirmation after the server confirms that Google saved the inquiry. It shows an unavailable message until the server environment is configured.

## Deploy to Vercel

Import the GitHub repository into Vercel. The tracked `vercel.json` sets the build command, browser output directory, and page routes. The `api/inquiries.js` function runs the same inquiry handler used locally.

In the Vercel project's environment variables, add `GOOGLE_APPS_SCRIPT_URL` and `GOOGLE_APPS_SCRIPT_SECRET` using the values from your local environment. Redeploy after setting them, then test an inquiry on the deployed Contact page.
