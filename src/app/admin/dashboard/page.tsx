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
};

const navy = "#0B1F3A";
const B = { border:"0.5px solid rgba(11,31,58,0.1)" };

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

        {/* Pipeline + Jobs */}
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
