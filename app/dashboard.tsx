"use client";

import { useEffect, useMemo, useState } from "react";

type Screen =
  | "overview"
  | "leads"
  | "sales"
  | "integrations"
  | "mapping"
  | "reports"
  | "diagnostics"
  | "settings";

type Diagnostic = {
  code: string;
  title: string;
  summary: string;
  cause: string;
  fix: string[];
  severity: "critical" | "warning" | "info";
  time: string;
  correlationId: string;
  service: string;
};

const nav: { id: Screen; label: string; icon: string }[] = [
  { id: "overview", label: "نظرة عامة", icon: "◫" },
  { id: "leads", label: "العملاء المحتملون", icon: "◎" },
  { id: "sales", label: "فريق المبيعات", icon: "◉" },
  { id: "integrations", label: "التكاملات", icon: "⌁" },
  { id: "mapping", label: "قواعد التوزيع", icon: "⌘" },
  { id: "reports", label: "التقارير", icon: "▥" },
  { id: "diagnostics", label: "مركز الأخطاء", icon: "!" },
  { id: "settings", label: "الإعدادات", icon: "⚙" },
];

const diagnostics: Diagnostic[] = [
  {
    code: "META_TOKEN_EXPIRED",
    title: "انتهت صلاحية اتصال Meta",
    summary: "توقّف جلب بيانات النماذج الجديدة من صفحة العقبي.",
    cause:
      "رفضت Meta الطلب لأن رمز الوصول انتهت صلاحيته. لا يعرض النظام الرمز المحفوظ ولا يسجّله ضمن تفاصيل الخطأ.",
    fix: [
      "افتح التكاملات ← Meta Lead Ads.",
      "اضغط إعادة الاتصال وسجّل الدخول بالحساب المصرّح.",
      "اختبر الاتصال ثم أعد تشغيل الأحداث الفاشلة.",
    ],
    severity: "critical",
    time: "منذ 8 دقائق",
    correlationId: "evt_7JK2-META-91D",
    service: "Meta Lead Ads",
  },
  {
    code: "SHEET_MAPPING_MISSING",
    title: "حقل الهاتف غير مربوط",
    summary: "تعذّر استيراد 12 صفاً من Google Sheets.",
    cause:
      "تم تغيير اسم عمود Phone في الجدول ولم تعد قاعدة الربط الحالية قادرة على تحديد رقم الهاتف.",
    fix: [
      "افتح مورد Google Sheets المتأثر.",
      "حدّث ربط الأعمدة واختر العمود الذي يحتوي على الهاتف.",
      "شغّل المعاينة ثم أعد استيراد الصفوف الفاشلة.",
    ],
    severity: "warning",
    time: "منذ 24 دقيقة",
    correlationId: "job_1P8S-SHEET-42A",
    service: "Google Sheets",
  },
  {
    code: "ROUND_ROBIN_CAPACITY",
    title: "لا يوجد وكيل متاح",
    summary: "6 عملاء بانتظار أول وكيل لديه مساحة متاحة.",
    cause:
      "كل الوكلاء المتاحين وصلوا إلى السعة النشطة وهي 5 عملاء. لم يفقد أي عميل وموجودون في طابور الانتظار.",
    fix: [
      "راجع حالة الوكلاء والسعة النشطة.",
      "فعّل وكيلاً إضافياً أو ارفع السعة بإجراء مسجل.",
      "لا حاجة لإعادة استيراد العملاء.",
    ],
    severity: "info",
    time: "الآن",
    correlationId: "queue_3A-2281",
    service: "Round Robin",
  },
];

const leadsSeed = [
  { id: "LD-2841", name: "نورهان أحمد", phone: "+20 101 842 2951", source: "Facebook", owner: "محمود", agent: "سارة علي", status: "جديد", age: "منذ 2 د" },
  { id: "LD-2840", name: "أحمد ياسر", phone: "+20 112 905 8410", source: "WhatsApp", owner: "Unattributed", agent: "عمر خالد", status: "متابعة", age: "منذ 6 د" },
  { id: "LD-2839", name: "منى إبراهيم", phone: "+20 100 331 7254", source: "EasyOrders", owner: "ياسمين", agent: "سارة علي", status: "تم التواصل", age: "منذ 11 د" },
  { id: "LD-2838", name: "خالد مصطفى", phone: "+20 155 204 6308", source: "Messenger", owner: "أحمد", agent: "محمد طارق", status: "لا يرد", age: "منذ 18 د" },
  { id: "LD-2837", name: "ريم وليد", phone: "+20 127 449 8201", source: "Google Sheet", owner: "محمود", agent: "عمر خالد", status: "صفقة", age: "منذ 27 د" },
];

const integrations = [
  { name: "Meta Lead Ads", detail: "3 صفحات • 18 نموذجاً", state: "يحتاج إعادة اتصال", tone: "danger", sync: "منذ 8 دقائق", icon: "f" },
  { name: "WhatsApp Cloud API", detail: "رقمان متصلان", state: "متصل", tone: "success", sync: "الآن", icon: "wa" },
  { name: "Google Sheets", detail: "4 جداول • 7 أوراق", state: "تحذير ربط", tone: "warning", sync: "منذ 24 دقيقة", icon: "g" },
  { name: "EasyOrders", detail: "متجران", state: "متصل", tone: "success", sync: "منذ دقيقة", icon: "e" },
];

const screenCopy: Record<Screen, { title: string; subtitle: string }> = {
  overview: { title: "صباح الخير، عبدالله", subtitle: "إليك ملخص أداء كل المنتجات اليوم" },
  leads: { title: "العملاء المحتملون", subtitle: "كل المصادر، السجل الكامل، ومنع التكرار داخل كل منتج" },
  sales: { title: "فريق المبيعات", subtitle: "الحضور والسعة والتوزيع اللحظي بنظام Round Robin" },
  integrations: { title: "التكاملات", subtitle: "راقب الاتصال والموارد وصحة وصول البيانات" },
  mapping: { title: "قواعد Marketing Mapping", subtitle: "الإسناد التسويقي مستقل تماماً عن توزيع المبيعات" },
  reports: { title: "التقارير والتحليلات", subtitle: "بيانات موحّدة بدون احتساب مزدوج للعملاء" },
  diagnostics: { title: "مركز الأخطاء والتشخيص", subtitle: "سبب واضح، كود قابل للبحث، وخطوات معالجة آمنة" },
  settings: { title: "إعدادات المنتج", subtitle: "الهوية، الصلاحيات، الأمان، وسياسات التشغيل" },
};

function Metric({ label, value, delta, tone = "blue", chart }: { label: string; value: string; delta: string; tone?: string; chart: number[] }) {
  return (
    <article className="metric-card">
      <div className="metric-top"><span>{label}</span><button aria-label={`خيارات ${label}`}>•••</button></div>
      <div className="metric-value">{value}</div>
      <div className="metric-bottom">
        <span className={`delta ${delta.startsWith("+") ? "up" : "muted"}`}>{delta}</span>
        <div className={`spark ${tone}`} aria-hidden="true">
          {chart.map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
        </div>
      </div>
    </article>
  );
}

function ErrorDetails({ item, onClose }: { item: Diagnostic; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = `Error Code: ${item.code}\nCorrelation ID: ${item.correlationId}\nService: ${item.service}\nReason: ${item.cause}`;
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside className="error-drawer" onMouseDown={(e) => e.stopPropagation()} aria-label="تفاصيل الخطأ">
        <div className="drawer-head">
          <div><span className={`severity ${item.severity}`}>{item.severity === "critical" ? "حرج" : item.severity === "warning" ? "تحذير" : "معلومة"}</span><h2>{item.title}</h2></div>
          <button className="close" onClick={onClose} aria-label="إغلاق">×</button>
        </div>
        <div className="error-code"><span>كود الخطأ</span><b dir="ltr">{item.code}</b></div>
        <section><h3>ماذا حدث؟</h3><p>{item.summary}</p></section>
        <section><h3>السبب المحتمل</h3><p>{item.cause}</p></section>
        <section><h3>خطوات الحل</h3><ol>{item.fix.map((step) => <li key={step}>{step}</li>)}</ol></section>
        <div className="context-grid">
          <div><span>الخدمة</span><b>{item.service}</b></div>
          <div><span>وقت الرصد</span><b>{item.time}</b></div>
          <div className="wide"><span>Correlation ID</span><b dir="ltr">{item.correlationId}</b></div>
        </div>
        <div className="security-note"><b>حماية البيانات:</b> تم حجب التوكن وأرقام العملاء والـpayload الخام تلقائياً.</div>
        <button className="primary full" onClick={copy}>{copied ? "تم نسخ التقرير ✓" : "نسخ تقرير الخطأ لإرساله للدعم"}</button>
      </aside>
    </div>
  );
}

export default function Dashboard() {
  const [screen, setScreen] = useState<Screen>("overview");
  const [product, setProduct] = useState("كل المنتجات");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const [selectedError, setSelectedError] = useState<Diagnostic | null>(null);
  const [leads, setLeads] = useState(leadsSeed);
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      console.error("[CRM_UI_ERROR]", { message: event.message, source: event.filename, line: event.lineno });
    };
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);

  const filteredLeads = useMemo(
    () => leads.filter((lead) => `${lead.name} ${lead.phone} ${lead.id}`.toLowerCase().includes(query.toLowerCase())),
    [leads, query],
  );

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2300);
  };

  const changeLead = (id: string, status: string) => {
    setLeads((rows) => rows.map((row) => row.id === id ? { ...row, status } : row));
    notify(`تم تحديث ${id} إلى "${status}" وتسجيل الإجراء`);
  };

  const renderOverview = () => (
    <>
      <section className="metrics">
        <Metric label="إجمالي الليدات اليوم" value="1,284" delta="+12.5%" chart={[35, 48, 43, 58, 65, 58, 82, 76, 94]} />
        <Metric label="ليدات فريدة" value="1,067" delta="+8.2%" tone="purple" chart={[40, 38, 52, 48, 62, 60, 71, 69, 86]} />
        <Metric label="معدل التحويل" value="18.7%" delta="+2.4%" tone="green" chart={[25, 38, 32, 48, 44, 62, 70, 64, 81]} />
        <Metric label="إجمالي الإيراد" value="248,600 ج.م" delta="+16.1%" tone="orange" chart={[28, 44, 38, 53, 50, 61, 57, 74, 88]} />
      </section>

      <section className="main-grid">
        <article className="panel performance">
          <div className="panel-head"><div><h2>أداء الليدات</h2><p>الوارد مقابل الصفقات خلال 7 أيام</p></div><button className="chip">آخر 7 أيام⌄</button></div>
          <div className="legend"><span><i className="blue-dot" />ليدات واردة</span><span><i className="green-dot" />صفقات ناجحة</span></div>
          <div className="chart-area">
            <div className="y-axis"><span>400</span><span>300</span><span>200</span><span>100</span><span>0</span></div>
            <div className="bars">
              {[["السبت", 60, 31], ["الأحد", 74, 42], ["الإثنين", 66, 38], ["الثلاثاء", 86, 53], ["الأربعاء", 72, 46], ["الخميس", 94, 61], ["الجمعة", 79, 51]].map(([day, a, b]) => (
                <div className="bar-col" key={day}><div className="bar-pair"><i style={{ height: `${a}%` }} /><i style={{ height: `${b}%` }} /></div><span>{day}</span></div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel source-panel">
          <div className="panel-head"><div><h2>مصادر الليدات</h2><p>توزيع اليوم حسب المصدر</p></div><button>•••</button></div>
          <div className="donut-wrap">
            <div className="donut"><div><b>1,284</b><span>إجمالي</span></div></div>
            <div className="source-list">
              {[["Facebook", "42%", "blue"], ["WhatsApp", "28%", "green"], ["EasyOrders", "18%", "purple"], ["Google Sheets", "8%", "orange"], ["أخرى", "4%", "gray"]].map(([n, v, c]) => <div key={n}><span><i className={c} />{n}</span><b>{v}</b></div>)}
            </div>
          </div>
        </article>
      </section>

      <section className="lower-grid">
        <article className="panel">
          <div className="panel-head"><div><h2>آخر الليدات</h2><p>تحديث لحظي من كل المصادر</p></div><button className="link" onClick={() => setScreen("leads")}>عرض الكل ←</button></div>
          <LeadTable rows={leads.slice(0, 4)} compact onChange={changeLead} />
        </article>
        <article className="panel health">
          <div className="panel-head"><div><h2>صحة النظام</h2><p>التكاملات وطابور التوزيع</p></div><span className="live-pill">● مباشر</span></div>
          {diagnostics.map((item) => (
            <button className="health-row" key={item.code} onClick={() => setSelectedError(item)}>
              <i className={item.severity} />
              <span><b>{item.title}</b><small>{item.summary}</small></span>
              <em>{item.time}</em>
            </button>
          ))}
        </article>
      </section>
    </>
  );

  return (
    <div className="app-shell" dir="rtl">
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="brand"><div className="brand-mark">C</div><div><b>CoreFlow</b><span>CRM Command Center</span></div></div>
        <div className="workspace-card"><div className="product-logo">A</div><div><span>مساحة العمل</span><b>العقبي Hair Care</b></div><button>⌄</button></div>
        <nav>
          <p>القائمة الرئيسية</p>
          {nav.slice(0, 6).map((item) => <button key={item.id} className={screen === item.id ? "active" : ""} onClick={() => { setScreen(item.id); setMenu(false); }}><i>{item.icon}</i><span>{item.label}</span>{item.id === "diagnostics" && <em>2</em>}</button>)}
          <p>النظام</p>
          {nav.slice(6).map((item) => <button key={item.id} className={screen === item.id ? "active" : ""} onClick={() => { setScreen(item.id); setMenu(false); }}><i>{item.icon}</i><span>{item.label}</span>{item.id === "diagnostics" && <em>2</em>}</button>)}
        </nav>
        <div className="user-card"><div className="avatar">ع</div><div><b>عبدالله إبراهيم</b><span>Super Admin</span></div><button>⋮</button></div>
      </aside>

      <main>
        <header>
          <button className="mobile-menu" onClick={() => setMenu(!menu)}>☰</button>
          <div className="global-search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن ليد، رقم هاتف، أو كود..." /><kbd>⌘ K</kbd></div>
          <div className="header-actions">
            <button className="icon-button" aria-label="اللغة">EN</button>
            <button className="icon-button notification" aria-label="الإشعارات">♢<i /></button>
            <button className={`presence ${online ? "online" : ""}`} onClick={() => { setOnline(!online); notify(!online ? "أنت متاح الآن" : "تم تحويل حالتك إلى استراحة"); }}><i />{online ? "متاح" : "استراحة"}⌄</button>
          </div>
        </header>

        <div className="content">
          <section className="page-heading">
            <div><p className="eyebrow">28 يوليو 2026 • التوقيت: القاهرة</p><h1>{screenCopy[screen].title}</h1><p>{screenCopy[screen].subtitle}</p></div>
            <div className="heading-actions">
              <select value={product} onChange={(e) => setProduct(e.target.value)} aria-label="اختيار المنتج"><option>كل المنتجات</option><option>العقبي Hair Care</option><option>SeasonWave</option><option>UAE Real Estate</option></select>
              <button className="primary" onClick={() => notify("تم فتح نموذج إضافة ليد جديد")}>＋ إضافة ليد</button>
            </div>
          </section>

          {screen === "overview" && renderOverview()}
          {screen === "leads" && <LeadsScreen rows={filteredLeads} onChange={changeLead} />}
          {screen === "sales" && <SalesScreen onNotify={notify} />}
          {screen === "integrations" && <IntegrationsScreen onError={setSelectedError} onNotify={notify} />}
          {screen === "mapping" && <MappingScreen onNotify={notify} />}
          {screen === "reports" && <ReportsScreen />}
          {screen === "diagnostics" && <DiagnosticsScreen onSelect={setSelectedError} />}
          {screen === "settings" && <SettingsScreen onNotify={notify} />}
        </div>
      </main>
      {menu && <button className="mobile-overlay" aria-label="إغلاق القائمة" onClick={() => setMenu(false)} />}
      {selectedError && <ErrorDetails item={selectedError} onClose={() => setSelectedError(null)} />}
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}

function LeadTable({ rows, compact = false, onChange }: { rows: typeof leadsSeed; compact?: boolean; onChange: (id: string, status: string) => void }) {
  return (
    <div className="table-wrap">
      <table><thead><tr><th>العميل</th><th>المصدر</th>{!compact && <th>Marketing Owner</th>}<th>وكيل المبيعات</th><th>الحالة</th><th>الوقت</th><th /></tr></thead>
        <tbody>{rows.map((lead) => <tr key={lead.id}>
          <td><div className="lead-name"><div>{lead.name.charAt(0)}</div><span><b>{lead.name}</b><small dir="ltr">{lead.phone} • {lead.id}</small></span></div></td>
          <td><span className={`source-badge ${lead.source.toLowerCase().replace(" ", "-")}`}>{lead.source}</span></td>
          {!compact && <td><span className={lead.owner === "Unattributed" ? "unattributed" : ""}>{lead.owner}</span></td>}
          <td>{lead.agent}</td><td><span className={`status ${lead.status}`}>{lead.status}</span></td><td>{lead.age}</td>
          <td><select aria-label={`تغيير حالة ${lead.name}`} value={lead.status} onChange={(e) => onChange(lead.id, e.target.value)}><option>جديد</option><option>تم التواصل</option><option>متابعة</option><option>لا يرد</option><option>صفقة</option></select></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}

function LeadsScreen({ rows, onChange }: { rows: typeof leadsSeed; onChange: (id: string, status: string) => void }) {
  return <section className="panel full-panel"><div className="filters"><button className="active">الكل <b>1,284</b></button><button>جديد <b>128</b></button><button>متابعة <b>74</b></button><button>صفقات <b>216</b></button><button>Unattributed <b>39</b></button><span /><button>☷ تصفية</button><button>⇩ تصدير</button></div><LeadTable rows={rows} onChange={onChange} /><div className="pagination"><span>عرض 1–{rows.length} من 1,284</span><div><button>→</button><button className="active">1</button><button>2</button><button>3</button><button>…</button><button>65</button><button>←</button></div></div></section>;
}

function SalesScreen({ onNotify }: { onNotify: (s: string) => void }) {
  const agents = [["سارة علي", "متاح", 4, 5, "18.9%"], ["عمر خالد", "في مكالمة", 5, 5, "21.4%"], ["محمد طارق", "متاح", 3, 5, "16.7%"], ["دينا سمير", "استراحة", 2, 5, "24.1%"], ["أحمد سالم", "غير متصل", 0, 5, "14.8%"]];
  return <><section className="metrics sales-metrics"><Metric label="الوكلاء المتاحون" value="12 / 18" delta="+2 الآن" chart={[40, 55, 50, 67, 72, 65, 80, 76, 90]} /><Metric label="ليدات نشطة" value="68" delta="السعة 90" tone="purple" chart={[52, 60, 57, 66, 70, 74, 71, 80, 78]} /><Metric label="متوسط أول تواصل" value="2:18 د" delta="-14 ثانية" tone="green" chart={[90, 84, 80, 73, 69, 61, 58, 49, 44]} /><Metric label="في طابور الانتظار" value="6" delta="الأقدم 3 د" tone="orange" chart={[20, 34, 28, 44, 38, 51, 48, 56, 43]} /></section>
    <section className="panel full-panel"><div className="panel-head"><div><h2>حالة وسعة الوكلاء</h2><p>التوزيع آمن ضد التكرار ويُسجّل كل إعادة إسناد</p></div><button className="primary" onClick={() => onNotify("تم تشغيل دورة توزيع Round Robin بأمان")}>تشغيل دورة توزيع</button></div>
      <div className="agent-grid">{agents.map(([name, state, used, max, conversion]) => <article className="agent-card" key={String(name)}><div className="agent-title"><div className="avatar">{String(name).charAt(0)}</div><div><b>{name}</b><span className={`agent-state ${state}`}>● {state}</span></div><button>⋮</button></div><div className="capacity"><span>السعة النشطة</span><b>{used} / {max}</b><div><i style={{ width: `${(Number(used) / Number(max)) * 100}%` }} /></div></div><footer><span>التحويل اليوم</span><b>{conversion}</b></footer></article>)}</div>
    </section></>;
}

function IntegrationsScreen({ onError, onNotify }: { onError: (d: Diagnostic) => void; onNotify: (s: string) => void }) {
  return <><section className="integration-grid">{integrations.map((item, i) => <article className="integration-card" key={item.name}><div className={`integration-icon i${i}`}>{item.icon}</div><div className="integration-info"><h3>{item.name}</h3><p>{item.detail}</p><span className={item.tone}>● {item.state}</span><small>آخر مزامنة: {item.sync}</small></div><button onClick={() => item.tone === "danger" ? onError(diagnostics[0]) : item.tone === "warning" ? onError(diagnostics[1]) : onNotify(`اتصال ${item.name} يعمل بشكل سليم`)}>فحص الاتصال</button></article>)}</section>
    <section className="panel full-panel"><div className="panel-head"><div><h2>إضافة مصدر جديد</h2><p>معالج آمن من 11 خطوة لا يعرض الرموز بعد حفظها</p></div></div><div className="connector-options">{["Generic Webhook", "CSV Import", "Messenger", "Light Funnel", "Telephony / SIP"].map((name) => <button key={name} onClick={() => onNotify(`تم اختيار موصل ${name}`)}><i>＋</i><b>{name}</b><span>إعداد الاتصال ←</span></button>)}</div></section></>;
}

function MappingScreen({ onNotify }: { onNotify: (s: string) => void }) {
  const rules = [["Form ID = 991208", "Meta Lead Ads", "محمود عادل", "1", "نشط"], ["phone_number_id = 10842", "WhatsApp", "ياسمين حسن", "2", "نشط"], ["Campaign contains “Protein”", "Meta Campaign", "أحمد رجب", "3", "نشط"], ["Product default", "كل المصادر", "Unattributed", "99", "احتياطي"]];
  return <><section className="callout"><div>i</div><p><b>Marketing Mapping للإسناد فقط.</b> أي ليد لا يطابق قاعدة يأخذ Unattributed ويستمر فوراً إلى Round Robin بدون تعطيل.</p></section><section className="panel full-panel"><div className="panel-head"><div><h2>قواعد الإسناد المنشورة</h2><p>الأولوية للأرقام الثابتة قبل الأسماء القابلة للتغيير</p></div><button className="primary" onClick={() => onNotify("تم فتح منشئ قاعدة Marketing Mapping")}>＋ قاعدة جديدة</button></div><div className="rule-list">{rules.map((r) => <div key={r[0]}><span className="drag">⠿</span><b className="priority">{r[3]}</b><span className="rule-main"><b dir="ltr">{r[0]}</b><small>{r[1]}</small></span><span className="arrow">←</span><span className={r[2] === "Unattributed" ? "unattributed" : "owner"}>{r[2]}</span><span className={r[4] === "نشط" ? "active-rule" : "fallback-rule"}>● {r[4]}</span><button onClick={() => onNotify(`تم فتح محاكاة: ${r[0]}`)}>اختبار</button><button>⋮</button></div>)}</div></section></>;
}

function ReportsScreen() {
  return <><section className="metrics"><Metric label="Raw Occurrences" value="1,491" delta="+14.2%" chart={[34, 43, 47, 52, 58, 64, 67, 78, 90]} /><Metric label="Unique Leads" value="1,284" delta="+12.5%" tone="purple" chart={[38, 45, 42, 53, 58, 56, 70, 74, 84]} /><Metric label="Duplicate Rate" value="13.9%" delta="-1.2%" tone="orange" chart={[74, 69, 72, 62, 65, 57, 51, 47, 43]} /><Metric label="SLA Compliance" value="94.6%" delta="+3.1%" tone="green" chart={[55, 62, 61, 68, 72, 78, 81, 86, 92]} /></section><section className="main-grid"><article className="panel performance"><div className="panel-head"><div><h2>أداء المنتجات</h2><p>Unique Leads مقابل الإيراد</p></div><button className="chip">هذا الشهر⌄</button></div><div className="product-bars">{[["العقبي Hair Care", 88, "248.6K"], ["SeasonWave", 72, "184.2K"], ["UAE Real Estate", 54, "96.8K"]].map(([n, v, revenue]) => <div key={n}><span>{n}</span><div><i style={{ width: `${v}%` }} /></div><b>{revenue} ج.م</b></div>)}</div></article><article className="panel"><div className="panel-head"><div><h2>جودة الإسناد</h2><p>First Touch attribution</p></div></div><div className="quality-score"><div><b>97%</b><span>Attributed</span></div><p><b>39</b> ليد Unattributed يحتاج مراجعة القواعد، لكنه وصل للمبيعات بالفعل.</p></div></article></section></>;
}

function DiagnosticsScreen({ onSelect }: { onSelect: (d: Diagnostic) => void }) {
  return <><section className="diagnostic-summary"><article><i className="critical" /><div><b>1</b><span>خطأ حرج</span></div></article><article><i className="warning" /><div><b>1</b><span>تحذير</span></div></article><article><i className="info" /><div><b>1</b><span>معلومة تشغيلية</span></div></article><article className="ok"><i>✓</i><div><b>99.2%</b><span>أحداث ناجحة اليوم</span></div></article></section><section className="panel full-panel"><div className="panel-head"><div><h2>الأحداث التي تحتاج انتباهك</h2><p>كل سجل يحتوي على سبب آمن وCorrelation ID لإرساله للدعم</p></div><button className="chip">آخر 24 ساعة⌄</button></div><div className="diagnostic-list">{diagnostics.map((item) => <button key={item.code} onClick={() => onSelect(item)}><i className={item.severity}>{item.severity === "critical" ? "!" : item.severity === "warning" ? "!" : "i"}</i><span className="diag-body"><b>{item.title}</b><small>{item.summary}</small><em dir="ltr">{item.code} • {item.correlationId}</em></span><span className="diag-service"><b>{item.service}</b><small>{item.time}</small></span><strong>التفاصيل ←</strong></button>)}</div></section></>;
}

function SettingsScreen({ onNotify }: { onNotify: (s: string) => void }) {
  const [capacity, setCapacity] = useState("5");
  return <section className="settings-layout"><aside className="settings-nav">{["عام", "المنتجات", "المستخدمون والصلاحيات", "فرق المبيعات", "Round Robin", "الأمان وMFA", "الاحتفاظ بالبيانات", "سجل التدقيق"].map((x, i) => <button className={i === 0 ? "active" : ""} key={x}>{x}</button>)}</aside><article className="panel settings-form"><div className="panel-head"><div><h2>الإعدادات العامة</h2><p>تُطبّق على المنتج الحالي فقط</p></div></div><div className="form-grid"><label><span>اسم المنتج</span><input defaultValue="العقبي Hair Care" /></label><label><span>العملة</span><select defaultValue="EGP"><option>EGP — جنيه مصري</option><option>SAR — ريال سعودي</option><option>AED — درهم إماراتي</option></select></label><label><span>المنطقة الزمنية</span><select defaultValue="Africa/Cairo"><option>Africa/Cairo</option><option>Asia/Riyadh</option><option>Asia/Dubai</option></select></label><label><span>الدولة الافتراضية للهاتف</span><select defaultValue="EG"><option>EG — Egypt</option><option>SA — Saudi Arabia</option><option>AE — UAE</option></select></label><label><span>السعة النشطة لكل وكيل</span><input type="number" min="1" max="20" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></label><label><span>نموذج الإسناد</span><select><option>First Touch</option><option>Last Touch</option></select></label></div><div className="toggle-row"><div><b>إجبار MFA للإدارة</b><span>مطلوب لـSuper Admin وProduct Admin</span></div><button className="toggle on"><i /></button></div><div className="toggle-row"><div><b>تحميل التسجيلات</b><span>مرفوض افتراضياً؛ الاستماع بصلاحية مستقلة</span></div><button className="toggle"><i /></button></div><footer><button className="secondary">إلغاء</button><button className="primary" onClick={() => onNotify("تم حفظ إعدادات المنتج وتسجيلها في Audit Log")}>حفظ التغييرات</button></footer></article></section>;
}
