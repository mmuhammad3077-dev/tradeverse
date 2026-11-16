# TradeVerse: Your World. Your Trading Journey.

Ek mindful trading seekhne ka game. Is mein asli paisa nahi lagta aur ye financial advice nahi hai.

## Files
- `index.html`: poora game (HTML + CSS + JS, ek file)
- `manifest.webmanifest`, `sw.js`, `icons/`: PWA files (install aur offline ke liye)

## Phone par kaise kholein
1. **Foran khelna:** Claude ka diya hua game link phone ke browser mein kholo.
2. **App ki tarah install karna (Android):** is folder ko kisi free HTTPS hosting par daalo, jaise
   Netlify Drop (app.netlify.com/drop, folder drag karo) ya GitHub Pages. Phir link Chrome mein kholo,
   menu (⋮) dabao aur **"Add to Home screen" / "Install app"** chuno. Icon home screen par aa jayega aur game offline bhi chalega.
3. Progress usi phone ke browser mein save hoti hai (localStorage).

## Game ka structure
- **Stage 1-2 (seekhne ka mood):** candle kaise banti hai (animation), candle ki qismein, trend, buy/sell ki pehchan. Chart puzzles ke saath.
- **Stage 3-6:** nakli market mein trading: stop-loss, risk/target, FOMO aur revenge ke boss levels, MA aur levels.
- **Stage 7 se aage (endless):** stages khud bante hain, har level pehle se mushkil, har 3rd din boss.
- Har stage ka scoreboard hota hai. Targets poore hone tak aap usi stage par rehte ho.
- **Demo Account:** alag $10,000 virtual balance, reset, trade history, aur stage ka koi pressure nahi.
- XP ranks (Rookie → Legend), badges, daily challenge, Calm meter, saans (box breathing), Sukoon ka Bagh.
- **Real Market Mode:** placeholder hai, Stage 6 ke baad khulta hai (`RealMarket` aur `realSheet()` code mein).

## Players ka data Google Sheet mein (signup)
Game pehli dafa khulne par zabaan (Roman Urdu / English) aur player card mangta hai: naam, email, contact, umar, trading ka tajurba, aur ijazat.
13 saal se kam umar par walidain ki ijazat ka box bhi zaroori hai. Tajurbe ke hisaab se shuruati rank aur stage milta hai.

Data aap ki Google Sheet mein laane ke liye (ek dafa, ~5 minute):
1. sheets.new kholo, Sheet ka naam rakho "Sukoon Market Players".
2. Menu: **Extensions > Apps Script**. Wahan jo code hai mita kar `apps-script.gs` ka poora code paste karo. Upar `ADMIN_KEY` ko apni lambi secret key se badlo (kam az kam 12 harf). Save dabao.
3. **Deploy > New deployment**. Type: **Web app**. "Execute as": **Me**. "Who has access": **Anyone**. Deploy dabao, Google account ki ijazat do.
4. Jo **Web app URL** milega (https://script.google.com/macros/s/.../exec) wo Claude ko bhej do. Main usay game ke `SIGNUP_URL` mein laga dunga.

Note: data sirf hosted game (GitHub Pages / install wala app) se aata hai. Claude ka preview link bahar data nahi bhej sakta.
Privacy: players ki maloomat sirf zaroori kaam ke liye rakho, kisi ko share na karo, aur Play Store par privacy policy aur "Data safety" form bharna hoga.

## Phase 1: 3D duniya (Nov 2026)
- **Beginner Village (3D):** home screen par. Buildings: Mera Ghar, Trading Academy (levels ka naqsha), Ustaad Ullu Centre (sabaq), Market Hall (Stage 3 se), Demo Bank, Trader Town ka gate (Phase 2).
- **Mera Ghar (3D):** coins se computer, desk, kursi, roshni, sajawat aur kamra upgrade hote hain.
- **Character:** male/female, jild ka rang, baal, libaas (coins se), sunehri ghari.
- **Teen alag nizaam:** XP (seekhna/rank), Coins (game ki cheezein), Demo balance (practice trading). Coins sirf levels, market din ke *discipline*, challenges, badges, sabaq aur stage clear se milte hain. Demo P/L se kabhi coins nahi milte.
- 3D ke liye three.js r128 cdnjs se aata hai. Internet na ho to game 3D ke baghair chalta rehta hai. Play Store version mein three.min.js ko app ke andar rakhna behtar hoga.

## Admin site (admin.html)
- Hosted link: `https://game.algoalitrader.com/admin.html` (game ke saath hi upload hota hai).
- PIN owner ne badal diya hai (yahan likha nahi). PIN badalne ke liye: browser console mein `crypto.subtle.digest("SHA-256", new TextEncoder().encode("sukoon-admin:NAYA_PIN")).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")))` chalao, aur jo lamba code aaye usay admin.html mein `PIN_HASH` ki jagah rakho. Ya Claude se kaho.
- PIN sirf page ko chhupata hai (ye browser ke andar check hota hai, asli security nahi). Asli hifazat `apps-script.gs` ki **ADMIN_KEY** hai: Google ke server par check hoti hai, is ke baghair koi players ki list nahi parh sakta.
- Tabs: Overview (stats aur charts), Players (search, filter, player detail, CSV copy, WhatsApp), Player view (game phone frame mein), Connect (Sheet URL + admin key).
- Sheet nahi judi to sample data dikhta hai, aur us par saaf likha hota hai ke ye misaal hai.

## Play Store ke liye (baad mein)
Capacitor se wrap karo:
```
npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Sukoon Market" com.example.sukoonmarket --web-dir www
mkdir www && cp -r index.html manifest.webmanifest sw.js icons www/
npx cap add android && npx cap open android   # Android Studio se .aab build karo
```
Note: Play Store par trading/finance apps ke liye policy aur disclaimer ka khayal rakhna hoga.

## Forex aur Crypto pairs (real historical data)
- Charts ab asli 2025 daily data par hain: EUR/USD, GBP/USD, USD/JPY, AUD/USD (May–Nov 2025) aur BTC/USD, ETH/USD, SOL/USD, XRP/USD (Jun–Nov 2025). Har candle = 1 din.
- Data source: Financial Modeling Prep (end-of-day). Public/commercial release se pehle FMP ki license/redistribution terms check karo; zaroorat ho to data kisi licensed source se badlo (`PAIRS` object in index.html).
- Boss days (crash/FOMO pump) abhi bhi simulation hain aur screen par "Simulation (asli data nahi)" likha aata hai.
- Track: Forex (main), Crypto basics, ya Dono. Settings se badal sakte ho. Demo mein pair khud chuno.
- Gold (XAU/USD) aur GBP/JPY ke liye FMP ka higher plan chahiye.
