"use client";

import { useMemo, useState } from "react";

type BizType = "法人" | "個人事業主";
type YesNo = "はい" | "いいえ";

type Pref =
  | "北海道" | "青森県" | "岩手県" | "宮城県" | "秋田県" | "山形県" | "福島県"
  | "茨城県" | "栃木県" | "群馬県" | "埼玉県" | "千葉県" | "東京都" | "神奈川県"
  | "新潟県" | "富山県" | "石川県" | "福井県" | "山梨県" | "長野県"
  | "岐阜県" | "静岡県" | "愛知県" | "三重県"
  | "滋賀県" | "京都府" | "大阪府" | "兵庫県" | "奈良県" | "和歌山県"
  | "鳥取県" | "島根県" | "岡山県" | "広島県" | "山口県"
  | "徳島県" | "香川県" | "愛媛県" | "高知県"
  | "福岡県" | "佐賀県" | "長崎県" | "熊本県" | "大分県" | "宮崎県" | "鹿児島県"
  | "沖縄県";

type Industry =
  | "IT・通信"
  | "製造"
  | "建設"
  | "卸売・小売"
  | "運輸・物流"
  | "飲食・宿泊"
  | "医療・福祉"
  | "教育"
  | "士業"
  | "不動産"
  | "金融・保険"
  | "サービス"
  | "その他";

type EmpCount =
  | "1〜4"
  | "5〜9"
  | "10〜19"
  | "20〜49"
  | "50〜99"
  | "100〜299"
  | "300以上";

/** ★ここが超重要：キー名をUI/送信/型で完全一致させる */
type FormDataJP = {
  mail: string;
  "会社名": string;
  "法人／個人事業主区別": BizType | "";
  "都道府県": Pref | "";
  "市区町村": string;
  "業種（大分類）": Industry | "";
  "従業員数": EmpCount | "";
  "資本金（円）": string; // 数字文字列（カンマ無し推奨）
  "設立年（YYYY）": string; // YYYY
  "雇用保険加入（はい/いいえ）": YesNo | "";
};

type SubmitResp = { ok: true } | { ok: false; error: string };

const PREFS: readonly Pref[] = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県",
  "沖縄県",
];

const INDUSTRIES: readonly Industry[] = [
  "IT・通信",
  "製造",
  "建設",
  "卸売・小売",
  "運輸・物流",
  "飲食・宿泊",
  "医療・福祉",
  "教育",
  "士業",
  "不動産",
  "金融・保険",
  "サービス",
  "その他",
];

const EMP_COUNTS: readonly EmpCount[] = [
  "1〜4",
  "5〜9",
  "10〜19",
  "20〜49",
  "50〜99",
  "100〜299",
  "300以上",
];

const BIZ_TYPES: readonly BizType[] = ["法人", "個人事業主"];
const YESNO: readonly YesNo[] = ["はい", "いいえ"];

const initialData: FormDataJP = {
  mail: "",
  "会社名": "",
  "法人／個人事業主区別": "",
  "都道府県": "",
  "市区町村": "",
  "業種（大分類）": "",
  "従業員数": "",
  "資本金（円）": "",
  "設立年（YYYY）": "",
  "雇用保険加入（はい/いいえ）": "",
};

/** YYYYのみ（例: 2021） */
function isYYYY(s: string) {
  const t = s.trim();
  return /^(19|20)\d{2}$/.test(t);
}

function normalizeMoney(s: string) {
  const zenkaku = s.replace(/[０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0)
  );
  return zenkaku.replace(/,/g, "").replace(/\s+/g, "").trim();
}

function isEmailLike(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function Page() {
  const [data, setData] = useState<FormDataJP>(initialData);
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState<{ kind: "idle" | "ok" | "ng"; msg: string }>({
    kind: "idle",
    msg: "入力して「送信」で、診断結果をメールで受け取る。",
  });

  function set<K extends keyof FormDataJP>(key: K, value: FormDataJP[K]) {
    setData((p) => ({ ...p, [key]: value }));
  }

  const progress = useMemo(() => {
    const checks: boolean[] = [
      isEmailLike(data.mail),
      data["会社名"].trim().length > 0,
      !!data["法人／個人事業主区別"],
      !!data["都道府県"],
      data["市区町村"].trim().length > 0,
      !!data["業種（大分類）"],
      !!data["従業員数"],
      normalizeMoney(data["資本金（円）"]).length > 0,
      isYYYY(data["設立年（YYYY）"]),
      !!data["雇用保険加入（はい/いいえ）"],
    ];
    const done = checks.filter(Boolean).length;
    return { done, total: checks.length, ok: done === checks.length };
  }, [data]);

  const valid = progress.ok;

  const modeText = sending ? "MODE: SENDING" : "MODE: FORM";
  const pulseText =
    banner.kind === "ok" ? "PULSE: OK" : banner.kind === "ng" ? "PULSE: NG" : "PULSE: IDLE";

  async function onClear() {
    setData(initialData);
    setBanner({ kind: "idle", msg: "入力をリセット。" });
  }

  async function onSubmit() {
    if (!valid || sending) return;

    setSending(true);
    setBanner({ kind: "idle", msg: "送信中…" });

    const payload: FormDataJP = {
      ...data,
      "資本金（円）": normalizeMoney(data["資本金（円）"]),
      "設立年（YYYY）": data["設立年（YYYY）"].trim(),
      mail: data.mail.trim(),
      "会社名": data["会社名"].trim(),
      "市区町村": data["市区町村"].trim(),
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as SubmitResp;

      if (!res.ok || ("ok" in json && json.ok === false)) {
        const msg = "error" in json ? json.error : "送信に失敗。";
        setBanner({ kind: "ng", msg });
        return;
      }

      setBanner({ kind: "ok", msg: "送信完了。診断結果をメールで送付する。" });
    } catch {
      setBanner({ kind: "ng", msg: "通信エラー。時間をおいて再送。" });
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="shell">
      <div className="cy-grid" />

      <header className="header">
        <div className="brand">
          <div className="brandTitle">
            <span className="glitch" data-text="NEXT ASIA LINK">
              NEXT ASIA LINK
            </span>
            <span className="accentY">■</span>
          </div>
          <div className="brandSub">補助金・助成金 自動診断 / BUILD: ALPHA</div>
        </div>

        <div className="statusPills" aria-hidden="true">
          <div className="pill"><b>{modeText}</b></div>
          <div className="pill"><b>{pulseText}</b></div>
          <div className="pill">
            <b>FIELDS:</b> {progress.done}/{progress.total}
          </div>
        </div>
      </header>

      <section className="panel">
        <div className="shine" />
        <div className="panelInner">
          <div className="panelTitle">
            <h1>診断情報の入力</h1>
          </div>

          <p className="panelLead">
            必須だけ入力。送信すると、登録メールに診断結果が届く。
          </p>

          <div className="formGrid">
            <div className="field">
              <div className="labelRow">
                <label>メール</label>
                <span className="req">必須</span>
              </div>
              <input
                value={data.mail}
                onChange={(e) => set("mail", e.target.value)}
                placeholder="example@company.com"
                inputMode="email"
                autoComplete="email"
              />
              <div className="help">結果送付先。間違えると届かない。</div>
            </div>

            <div className="field">
              <div className="labelRow">
                <label>会社名</label>
                <span className="req">必須</span>
              </div>
              <input
                value={data["会社名"]}
                onChange={(e) => set("会社名", e.target.value)}
                placeholder="株式会社NEXT ASIA LINK"
              />
              <div className="help">正式名じゃなくてもOK。</div>
            </div>

            <div className="field">
              <div className="labelRow">
                <label>区分</label>
                <span className="req">必須</span>
              </div>
              <select
                value={data["法人／個人事業主区別"]}
                onChange={(e) => set("法人／個人事業主区別", (e.target.value as BizType) || "")}
              >
                <option value="">選択</option>
                {BIZ_TYPES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="help">制度の対象条件が変わる。</div>
            </div>

            <div className="field">
              <div className="labelRow">
                <label>都道府県</label>
                <span className="req">必須</span>
              </div>
              <select
                value={data["都道府県"]}
                onChange={(e) => set("都道府県", (e.target.value as Pref) || "")}
              >
                <option value="">選択</option>
                {PREFS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="help">地域限定の制度がある。</div>
            </div>

            <div className="field">
              <div className="labelRow">
                <label>市区町村</label>
                <span className="req">必須</span>
              </div>
              <input
                value={data["市区町村"]}
                onChange={(e) => set("市区町村", e.target.value)}
                placeholder="中央区 / 渋谷区 / ○○市"
                autoComplete="address-level2"
              />
              <div className="help">市区町村単位の制度がある。</div>
            </div>

            <div className="field">
              <div className="labelRow">
                <label>業種（大分類）</label>
                <span className="req">必須</span>
              </div>
              <select
                value={data["業種（大分類）"]}
                onChange={(e) => set("業種（大分類）", (e.target.value as Industry) || "")}
              >
                <option value="">選択</option>
                {INDUSTRIES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="help">対象業種が絞られることがある。</div>
            </div>

            <div className="field">
              <div className="labelRow">
                <label>従業員数</label>
                <span className="req">必須</span>
              </div>
              <select
                value={data["従業員数"]}
                onChange={(e) => set("従業員数", (e.target.value as EmpCount) || "")}
              >
                <option value="">選択</option>
                {EMP_COUNTS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="help">中小企業要件に直結。</div>
            </div>

            <div className="field">
              <div className="labelRow">
                <label>資本金（円）</label>
                <span className="req">必須</span>
              </div>
              <input
                value={data["資本金（円）"]}
                onChange={(e) => set("資本金（円）", e.target.value)}
                placeholder="例：1000000"
                inputMode="numeric"
              />
              <div className="help">数字で入力（カンマ不要）。</div>
            </div>

            {/* ★ここ：設立年だけ */}
            <div className="field">
              <div className="labelRow">
                <label>設立年（YYYY）</label>
                <span className="req">必須</span>
              </div>
              <input
                value={data["設立年（YYYY）"]}
                onChange={(e) => set("設立年（YYYY）", e.target.value)}
                placeholder="例：2021"
                inputMode="numeric"
                maxLength={4}
              />
              <div className="help">西暦4桁だけ入力。</div>
            </div>

            <div className="field">
              <div className="labelRow">
                <label>雇用保険加入（はい/いいえ）</label>
                <span className="req">必須</span>
              </div>
              <select
                value={data["雇用保険加入（はい/いいえ）"]}
                onChange={(e) => set("雇用保険加入（はい/いいえ）", (e.target.value as YesNo) || "")}
              >
                <option value="">選択</option>
                {YESNO.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="help">雇用系の制度の入口。</div>
            </div>
          </div>

          <div className="ctaBar">
            <div className="note">
              {banner.kind === "ok" ? "✅ " : banner.kind === "ng" ? "⚠️ " : "• "}
              {banner.msg}
            </div>

            <div className="btns">
              <button className="btn" type="button" onClick={onClear}>
                クリア
              </button>

              <button
                className="btn btnPrimary"
                type="button"
                onClick={onSubmit}
                disabled={!valid || sending}
                title={!valid ? "未入力の必須項目がある" : "送信"}
              >
                {sending ? "送信中…" : "送信"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}