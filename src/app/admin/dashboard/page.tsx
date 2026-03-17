"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type PipelineItem  = { ja:string; vn:string; val:number; pct:number; color:string };
type ActivityItem  = { time:string; ja:string; vn:string; obj:string; tc:string; tb:string };

type DashData = {
  stats: { interview:number; offered:number; activeJobs:number; urgentJobs:number; unreadMsgs:number };
  pipeline: PipelineItem[];
  jobsByIndustry: PipelineItem[];
  activity: ActivityItem[];
  totals: { candidates:number; jobs:number };
  monthly: { cv:number; jobs:number; offers:number };
};

const navy = "#0B1F3A";
const B = { border:"0.5px solid rgba(11,31,58,0.1)" };

/* ── Donut chart (SVG stroke-dasharray technique) ── */
function DonutChart({ items }: { items: PipelineItem[] }) {
  const total = items.reduce((s, p) => s + p.val, 0);
  const r = 62, cx = 80, cy = 80;
  const C = 2 * Math.PI * r;
  let cum = 0;
  const slices = items.map(p => {
    const frac = total > 0 ? p.val / total : 0;
    const el = { ...p, frac, dasharray: `${frac * C} ${C}`, dashoffset: -(cum * C) };
    cum += frac;
    return el;
  });

  return (
    <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
      <svg width="160" height="160" style={{ flexShrink:0 }}>
        {total === 0
          ? <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1EFE8" strokeWidth="20" />
          : slices.map((s, i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={s.color} strokeWidth="20"
                strokeDasharray={s.dasharray}
                strokeDashoffset={s.dashoffset}
                style={{ transform:"rotate(-90deg)", transformOrigin:`${cx}px ${cy}px`, transition:"stroke-dasharray 0.8s ease" }}
              />
            ))
        }
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="26" fontWeight="700" fill={navy}>{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="#6B6B6B">名登録中</text>
        <text x={cx} y={cy + 24} textAnchor="middle" fontSize="9" fill="#6B6B6B">Ứng viên</text>
      </svg>

      {/* Legend */}
      <div style={{ flex:1 }}>
        {slices.map(s => (
          <div key={s.ja} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
              <div style={{ width:"10px", height:"10px", borderRadius:"3px", background:s.color, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:"11px", fontWeight:600, color:navy }}>{s.ja}</div>
                <div style={{ fontSize:"9px", color:"#6B6B6B" }}>{s.vn}</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:"13px", fontWeight:700, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:"9px", color:"#6B6B6B" }}>{total > 0 ? Math.round(s.frac * 100) : 0}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Funnel chart (SVG trapezoid polygons) ── */
function FunnelChart({ pipeline, monthly }: { pipeline: PipelineItem[]; monthly: { cv:number; jobs:number; offers:number } }) {
  const stages = [
    { key:"新規登録", color:"#378ADD", labelVn:"Mới đăng ký" },
    { key:"面接中",   color:"#EF9F27", labelVn:"Phỏng vấn" },
    { key:"内定済み", color:"#5DCAA5", labelVn:"Đã offer" },
    { key:"就業中",   color:"#27500A", labelVn:"Đang làm" },
  ];
  const data = stages.map(s => {
    const found = pipeline.find(p => p.ja === s.key);
    return { ...s, val: found?.val || 0 };
  });
  const maxVal = Math.max(...data.map(d => d.val), 1);
  const svgW = 260, stageH = 52, gap = 6;
  const totalH = data.length * (stageH + gap);

  return (
    <div>
      {/* Monthly summary badges */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"14px" }}>
        {[
          { label:"今月登録CV", labelVn:"CV tháng này", val:monthly.cv, color:"#378ADD", bg:"#EBF4FF" },
          { label:"今月求人",   labelVn:"Việc tháng này", val:monthly.jobs, color:"#7C6FF7", bg:"#F0EFFE" },
          { label:"今月内定",   labelVn:"Offer tháng này", val:monthly.offers, color:"#5DCAA5", bg:"#EAFAF5" },
        ].map(b => (
          <div key={b.label} style={{ flex:1, background:b.bg, borderRadius:"8px", padding:"8px 10px", textAlign:"center" }}>
            <div style={{ fontSize:"18px", fontWeight:700, color:b.color }}>{b.val}</div>
            <div style={{ fontSize:"10px", fontWeight:600, color:navy }}>{b.label}</div>
            <div style={{ fontSize:"9px", color:"#6B6B6B" }}>{b.labelVn}</div>
          </div>
        ))}
      </div>

      {/* SVG funnel */}
      <svg width="100%" viewBox={`0 0 ${svgW} ${totalH}`} style={{ overflow:"visible" }}>
        {data.map((s, i) => {
          const topFrac = s.val / maxVal;
          const botFrac = i < data.length - 1 ? (data[i + 1].val / maxVal) : topFrac * 0.85;
          const topW = Math.max(topFrac * svgW * 0.92, 40);
          const botW = Math.max(botFrac * svgW * 0.92, 36);
          const cx2 = svgW / 2;
          const y = i * (stageH + gap);
          const tl = cx2 - topW / 2, tr = cx2 + topW / 2;
          const bl = cx2 - botW / 2, br = cx2 + botW / 2;
          const convPct = i === 0 ? 100 : data[0].val > 0 ? Math.round((s.val / data[0].val) * 100) : 0;

          return (
            <g key={s.key}>
              <polygon
                points={`${tl},${y} ${tr},${y} ${br},${y + stageH} ${bl},${y + stageH}`}
                fill={s.color} opacity="0.88"
                style={{ transition:"all 0.8s ease" }}
              />
              {/* stage label left */}
              <text x={tl - 6} y={y + stageH / 2 - 5} textAnchor="end" fontSize="10" fontWeight="600" fill={navy}>{s.key}</text>
              <text x={tl - 6} y={y + stageH / 2 + 8} textAnchor="end" fontSize="8" fill="#6B6B6B">{s.labelVn}</text>
              {/* value center */}
              <text x={cx2} y={y + stageH / 2 - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">{s.val}</text>
              <text x={cx2} y={y + stageH / 2 + 10} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.82)">{convPct}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const [time, setTime] = useState("");
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTime(new Date().toLocaleString("ja-JP"));
    fetch("/api/admin/dashboard")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const d = data;
  const stats = d ? [
    { val: d.stats.interview,  ja:"選考中の人材",      vn:"Ứng viên đang tuyển", sub:`↑ ${d.totals.candidates}名登録中`, color:"#185FA5" },
    { val: d.stats.offered,    ja:"内定済み",           vn:"Đã offer thành công", sub:`↑ ${d.stats.offered}件今月`,       color:"#27500A" },
    { val: d.stats.activeJobs, ja:"募集中求人",          vn:"Công việc đang tuyển", sub: d.stats.urgentJobs > 0 ? `⚡ ${d.stats.urgentJobs}件緊急` : "募集中", color:"#633806" },
    { val: d.stats.unreadMsgs, ja:"未対応メッセージ",    vn:"Tin nhắn chưa xử lý", sub: d.stats.unreadMsgs > 0 ? "● 本日新着" : "対応済み", color:"#C8002A" },
  ] : [];

  return (
    <div>
      <div style={{ background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:"14px",fontWeight:700,color:navy }}>ダッシュボード / Dashboard</div>
          <div style={{ fontSize:"10px",color:"#6B6B6B" }}>{time}</div>
        </div>
        <Link href="/admin/jobs" style={{ padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:navy,color:"#fff",textDecoration:"none" }}>+ 新規追加 / Thêm mới</Link>
      </div>

      <div style={{ padding:"16px 20px" }}>
        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"14px" }}>
          {loading
            ? Array(4).fill(0).map((_,i) => (
                <div key={i} style={{ background:"#fff",...B,borderRadius:"10px",padding:"14px 16px",height:"80px",animation:"pulse 1.5s infinite" }}>
                  <div style={{ height:"28px",width:"60px",background:"#F1EFE8",borderRadius:"4px",marginBottom:"6px" }}/>
                  <div style={{ height:"10px",width:"80px",background:"#F1EFE8",borderRadius:"3px" }}/>
                </div>
              ))
            : stats.map(s => (
                <div key={s.ja} style={{ background:"#fff",...B,borderRadius:"10px",padding:"14px 16px" }}>
                  <div style={{ fontSize:"28px",fontWeight:700,color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:"12px",fontWeight:600,color:navy,margin:"2px 0 1px" }}>{s.ja}</div>
                  <div style={{ fontSize:"10px",color:"#6B6B6B" }}>{s.vn}</div>
                  <div style={{ fontSize:"10px",color:s.color,marginTop:"3px" }}>{s.sub}</div>
                </div>
              ))
          }
        </div>

        {/* Pipeline + Jobs bars */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px" }}>
          {[
            { title:"人材パイプライン / Pipeline ứng viên", data: d?.pipeline||[], href:"/admin/candidates" },
            { title:"業種別求人 / Công việc theo ngành",    data: d?.jobsByIndustry||[], href:"/admin/jobs" },
          ].map(card => (
            <div key={card.title} style={{ background:"#fff",...B,borderRadius:"10px",overflow:"hidden" }}>
              <div style={{ padding:"12px 16px",borderBottom:"0.5px solid rgba(11,31,58,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ fontSize:"12px",fontWeight:700,color:navy }}>{card.title}</div>
                <Link href={card.href} style={{ fontSize:"10px",color:"#185FA5",textDecoration:"none" }}>全件表示 →</Link>
              </div>
              <div style={{ padding:"14px 16px" }}>
                {loading
                  ? Array(4).fill(0).map((_,i) => (
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"9px" }}>
                        <div style={{ width:"100px",height:"28px",background:"#F1EFE8",borderRadius:"3px",flexShrink:0 }}/>
                        <div style={{ flex:1,height:"5px",background:"#F1EFE8",borderRadius:"3px" }}/>
                      </div>
                    ))
                  : card.data.length === 0
                  ? <div style={{ textAlign:"center",padding:"20px",fontSize:"12px",color:"#6B6B6B" }}>データなし</div>
                  : card.data.map(p => (
                      <div key={p.ja} style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"9px" }}>
                        <div style={{ width:"100px",flexShrink:0 }}>
                          <div style={{ fontSize:"11px",color:navy,fontWeight:500 }}>{p.ja}</div>
                          <div style={{ fontSize:"9px",color:"#6B6B6B" }}>{p.vn}</div>
                        </div>
                        <div style={{ flex:1,height:"5px",background:"#F6F7F9",borderRadius:"3px",overflow:"hidden" }}>
                          <div style={{ width:`${p.pct}%`,height:"100%",background:p.color,borderRadius:"3px",transition:"width 0.6s ease" }}/>
                        </div>
                        <span style={{ fontSize:"11px",fontWeight:700,color:navy,width:"20px",textAlign:"right" }}>{p.val}</span>
                      </div>
                    ))
                }
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts row: Donut + Funnel ── */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px" }}>

          {/* Donut chart */}
          <div style={{ background:"#fff",...B,borderRadius:"10px",overflow:"hidden" }}>
            <div style={{ padding:"12px 16px",borderBottom:"0.5px solid rgba(11,31,58,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <div style={{ fontSize:"12px",fontWeight:700,color:navy }}>人材ステータス分布 / Phân bổ ứng viên</div>
                <div style={{ fontSize:"9px",color:"#6B6B6B",marginTop:"1px" }}>Biểu đồ hình quạt · 円グラフ</div>
              </div>
              <Link href="/admin/candidates" style={{ fontSize:"10px",color:"#185FA5",textDecoration:"none" }}>全件表示 →</Link>
            </div>
            <div style={{ padding:"16px 20px" }}>
              {loading
                ? <div style={{ height:"160px",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <div style={{ width:"120px",height:"120px",borderRadius:"50%",background:"#F1EFE8",animation:"pulse 1.5s infinite" }}/>
                  </div>
                : <DonutChart items={d?.pipeline || []} />
              }
            </div>
          </div>

          {/* Funnel chart */}
          <div style={{ background:"#fff",...B,borderRadius:"10px",overflow:"hidden" }}>
            <div style={{ padding:"12px 16px",borderBottom:"0.5px solid rgba(11,31,58,0.08)" }}>
              <div style={{ fontSize:"12px",fontWeight:700,color:navy }}>採用フロー・今月実績 / Phễu tuyển dụng · Tháng này</div>
              <div style={{ fontSize:"9px",color:"#6B6B6B",marginTop:"1px" }}>Biểu đồ hình thang (Funnel) · 漏斗グラフ</div>
            </div>
            <div style={{ padding:"16px 20px" }}>
              {loading
                ? <div style={{ display:"flex",flexDirection:"column",gap:"8px" }}>
                    {Array(4).fill(0).map((_,i) => (
                      <div key={i} style={{ height:"48px",background:"#F1EFE8",borderRadius:"4px",animation:"pulse 1.5s infinite",width:`${100 - i*15}%`,margin:"0 auto" }}/>
                    ))}
                  </div>
                : <FunnelChart pipeline={d?.pipeline || []} monthly={d?.monthly || { cv:0, jobs:0, offers:0 }} />
              }
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background:"#fff",...B,borderRadius:"10px",overflow:"hidden" }}>
          <div style={{ padding:"12px 16px",borderBottom:"0.5px solid rgba(11,31,58,0.08)" }}>
            <div style={{ fontSize:"12px",fontWeight:700,color:navy }}>最近のアクティビティ / Hoạt động gần đây</div>
          </div>
          {loading
            ? <div style={{ padding:"20px",textAlign:"center",color:"#6B6B6B",fontSize:"12px" }}>読み込み中...</div>
            : (d?.activity || []).length === 0
            ? <div style={{ padding:"20px",textAlign:"center",color:"#6B6B6B",fontSize:"12px" }}>アクティビティなし</div>
            : (
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:"12px" }}>
                <thead><tr style={{ background:"#F6F7F9" }}>
                  {["日時","内容 / Sự kiện","対象","ステータス"].map(h => (
                    <th key={h} style={{ padding:"8px 14px",textAlign:"left",fontSize:"10px",color:"#6B6B6B",fontWeight:600,borderBottom:"0.5px solid rgba(11,31,58,0.1)" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {(d?.activity || []).map((a, i) => (
                    <tr key={i} style={{ borderBottom:"0.5px solid rgba(11,31,58,0.05)" }}>
                      <td style={{ padding:"10px 14px",color:"#6B6B6B",fontSize:"10px",whiteSpace:"nowrap" }}>{a.time}</td>
                      <td style={{ padding:"10px 14px" }}>
                        <div style={{ fontSize:"12px",color:navy }}>{a.ja}</div>
                        <div style={{ fontSize:"10px",color:"#6B6B6B" }}>{a.vn}</div>
                      </td>
                      <td style={{ padding:"10px 14px",fontWeight:600,color:navy,fontSize:"12px" }}>{a.obj}</td>
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ background:a.tb,color:a.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px" }}>{a.vn}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
