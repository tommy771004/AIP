# AeroSafe AIP Console

這個專案目前已實作成一個面向 FIR / ACC / RCC 聯絡情報的前後端原型，核心調整如下：

- 後端 scraper / API 已對齊 FIR 規格欄位：`firIcao`、`firName`、`facilityName`、`phoneNumber`、`faxNumber`、`aftnAddress`、`vhfFreq`、`airacCycle`、`sourceUrl`
- `/api/contacts` 現在回傳標準化資料結構，並保留 `sourceVerified` 與 `sourceStatus` 讓前端顯示 live / cache 信任狀態
- 首頁 UI 已重構成 2026 風格的 FIR ops console，包含 source health、AIRAC readiness、global FIR map 與聯絡卡片視圖

## Local Development

```bash
npm install
npm run dev
```

開發伺服器預設啟動於 `http://127.0.0.1:3000`。

## API

- `GET /api/health`
- `GET /api/contacts?page=1&pageSize=20&regionCode=TW`
- `GET /api/regions`
- `GET /api/sources/validate`

---

全球 FIR (飛航情報區) 聯絡資訊爬蟲規格書

為了建立一個全球 FIR 緊急聯絡資料庫，爬蟲需要針對各國數位化的「電子飛航指南 (eAIP)」進行抓取。由於 eAIP 遵循 ICAO 國際標準規範，這讓我們的爬蟲可以具備一定程度的通用性。

壹、 資料庫設計：目標抓取欄位 (Schema)

不論你從哪個國家的網站抓取資料，你的爬蟲最終都應該將資料清洗並整理成以下標準欄位，以便未來 API 呼叫使用：

欄位名稱 (Field)

資料型態

說明

範例

fir_icao

String(4)

FIR 的 4 碼 ICAO 代號 (主鍵)，注意：是 FIR 代碼不是機場代碼（Taipei FIR = RCAA，RCTP 是桃園機場）

RCAA

fir_name

String

FIR 的英文名稱

Taipei FIR

facility_name

String

管制中心名稱 (ACC 或 FIC)

Taipei Area Control Center

phone_number

String

區管中心值班台/緊急聯絡市話

+886-3-398-2459

fax_number

String

傳真號碼 (航空界仍常用)

+886-3-398-2465

aftn_address

String(8)

航空固定電信網路 8 碼地址 (極重要)

RCAAZQZX

vhf_freq

Array

主要與緊急 VHF 通訊頻率

["121.5 MHz", "125.1 MHz"]

airac_cycle

String

該筆資料所屬的 AIRAC 生效日期

2026-05-21

source_url

String

爬蟲抓取資料的原始來源網址

https://eaip.../RC-GEN-3.3-en-US.html

貳、 爬蟲目標網址與尋路策略

核心規則： 絕對不要寫死最終頁面的網址！必須先抓首頁，判斷「Current AIRAC（當前生效週期）」的動態目錄，再進入 GEN 3.3 頁面。

1. 台灣 (Taiwan) - 民航局飛航服務總台 eAIP

入口網址： https://ais.caa.gov.tw/eaip/ （已驗證 2026-06；舊站 eaip.caa.gov.tw 已無法連線）

尋路策略： 在入口首頁尋找包含 Current eAIP 的連結。進入目錄後，在左側導航樹找尋 Part 1 - General (GEN) -> GEN 3.3 Air traffic services。

HTML 特徵： 資料包在 <div id="GEN-3.3"> 下的 <table class="eAIPTable"> 中。

2. 澳洲 (Australia) - Airservices Australia

入口網址： https://www.airservicesaustralia.com/aip/aip.asp

尋路策略： 點擊 I Agree 接受使用條款。點擊當前週期的 AIP Book。目標章節為 GEN 3.3。

優勢： 涵蓋廣泛的南半球海域（布里斯本 YBBB 和墨爾本 YMMM 兩個超大 FIR）。

3. 日本 (Japan) - SWIM Portal（原 AIS Japan）

入口網址： https://top.swim.mlit.go.jp/swim/ （已驗證 2026-06）

重要變更： AIS Japan（aisjapan.mlit.go.jp）已於 2026-03-10 永久停止服務，DNS 已移除。eAIP 與 NOTAM 服務全面遷移至 SWIM Portal。

爬蟲挑戰： 仍須實作會員登入機制（免費註冊）。爬蟲需先取得登入 Session，再進入 eAIP 區塊尋找 GEN 3.3。

4. 英國 (United Kingdom) - NATS

入口網址： https://nats-uk.ead-it.com/cms-nats/opencms/en/Publications/AIP/

尋路策略： NATS 使用標準的 Eurocontrol eAIP 系統，結構極度規律。進入 GEN 3.3 後，用 XPath 定位 "London ACC" 或 "Scottish ACC" 的表格。

5. 新加坡 (Singapore) - CAAS AIM-SG (代表東南亞樞紐)

入口網址： https://aim-sg.caas.gov.sg/aip/ （已驗證 2026-06；舊站 aip.caas.gov.sg 已下線，DNS 已移除）

尋路策略： 新加坡的 eAIP 介面非常乾淨且標準。首頁點擊生效日期後，展開左側 iframe 選單找到 GEN 3.3。

爬蟲挑戰： 它們的頁面大量使用了 iframe 來載入導航樹和內容，爬蟲（如 Selenium 或 Playwright）需要切換 context 到對應的 iframe 才能抓到 <table>。

6. 香港 (Hong Kong) - CAD AIS

入口網址： https://www.ais.gov.hk/

尋路策略： 與新加坡類似，屬於極度標準化的 ICAO eAIP 網頁。進入 eAIP 後，導航至 Part 1 -> GEN 3 -> GEN 3.3，抓取香港區管中心 (HKVACC) 的資料。

7. 加拿大 (Canada) - Nav Canada (代表北美)

入口網址： https://www.navcanada.ca/en/aeronautical-information/aip-canada.aspx

尋路策略： 加拿大偏好將 AIP 打包成 PDF 發布。爬蟲需要抓取最新 AIRAC 週期那一欄的 Part 1 - General (GEN) PDF 檔案連結並下載。

爬蟲挑戰： 需結合 PDF 解析工具（如 pdfplumber），讀取 PDF 內容並使用正則表達式萃取 "Area Control Centres" 的電話與 AFTN 資訊。

8. 巴西 (Brazil) - DECEA AISWEB (代表南美洲)

入口網址： https://aisweb.decea.mil.br/ （站台存活但可能封鎖部分海外 IP / TLS client，爬蟲需準備重試與備援）

尋路策略： 巴西的系統非常現代化，但也相對獨特。進入網站後，可以尋找 Publicações -> AIP Brasil。巴西管轄五個主要的 FIR（如 Atlântico, Brasília 等），資料通常分布在 GEN 3.3 的 PDF 或專屬頁面中。

參、 替代方案：歐洲綜合大補帖 (Eurocontrol EAD)

如果你不想為歐洲幾十個國家分別寫爬蟲，最好的解決方案是直接攻克歐洲航管局的系統：

目標平台： EAD Basic (European AIS Database)

註冊網址： https://www.ead.eurocontrol.int/

爬蟲動作： 1. 註冊一個免費帳號。
2. 撰寫爬蟲模擬登入，進入 PAMS Light (Published AIP Management System) 應用程式。
3. PAMS Light 提供強大的過濾表單。你可以讓爬蟲勾選所有的 ECAC 國家（歐洲民航會議成員國），Document Type 選擇 AIP，Part 選擇 GEN。
4. 爬蟲可以一次性獲取包含法國 (LFFF)、德國 (EDWW)、義大利 (LIRR) 等國家的 eAIP 或 PDF 下載連結，大幅減少尋找入口網址的時間。

肆、 不依賴 HTML 爬蟲的免費來源

如果解析 HTML 表格太容易因為網頁改版而壞掉，以下是提供「純資料檔」的目標：

1. 美國 FAA (Federal Aviation Administration)

來源名稱： FAA 28 Day NASR Subscription

下載網址： https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/

爬蟲動作： 每個月自動下載 28DaySubscription.zip。解壓縮後讀取 AFF.txt 等檔案，獲取美國境內 ARTCC 的頻率與聯絡資料。

2. OpenAIP (補齊空中頻率)

API 網址： https://api.core.openaip.net/api/airspaces （舊端點 api.openaip.net/v1 已停用，DNS 已移除）

爬蟲動作： 需註冊取得免費 API key，透過 `x-openaip-api-key` header 或 `apiKey` query 參數帶入。雖然 OpenAIP 沒有「市內電話」，但它能為你的系統補齊非常準確的 vhf_freq (無線電頻率) 以及該 FIR 的精確 GeoJSON 邊界多邊形。

3. 紐西蘭 (New Zealand) - Airways AIP New Zealand

入口網址： https://www.aip.net.nz/ （已驗證 2026-06）

爬蟲動作： GEN 3.3 直接以固定路徑 PDF 發布（/assets/AIP/General-GEN/3-SERVICES/GEN_3.3.pdf），Table GEN 3.3-2 即為 ATS Unit Address List，含 Christchurch ACC 電話、傳真與 AFTN，是極穩定的官方來源。NZ 全境為單一 New Zealand FIR (NZZC)，海洋區為 Auckland Oceanic (NZZO)。

伍、 爬蟲實作防坑建議 (Tips)

處理 iframe： ICAO 標準的 eAIP 頁面（左側目錄、右側內容）幾乎都是用 iframe 寫的。如果你用 Beautiful Soup，直接請求右側內容的 URL；如果你用 Selenium，記得先 switch_to.frame()。

使用者代理 (User-Agent)： 許多政府機構的防火牆會阻擋預設的 Python requests。請務必在爬蟲中設定常見的瀏覽器 User-Agent。

排程設定： 不要每天爬！設定 cron job 在每個 AIRAC 週期生效日 (通常是星期四，每四周一次) 的後兩天執行爬蟲即可，以減少對官方伺服器的負擔並避免被 Ban IP。
